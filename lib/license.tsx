"use client";

import { useEffect, useMemo, useState } from "react";

export type LicenseTier = "free" | "trial" | "pro";

export type LicenseState = {
  tier: LicenseTier;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialEndsAt: string | null;
  trialUsed: boolean;
  loading: boolean;
  error: string | null;
  /** Start en lokal 10-dagers prøveperiode basert på e-post */
  startTrial: (email: string) => void;
  /** Trigg ny sjekk mot Firestore (f.eks. etter Stripe-success) */
  refresh: () => void;
};

const TRIAL_STORAGE_KEY = "mcl_formler_trial";
const EMAIL_STORAGE_KEY = "mcl_formler_email";

type StoredTrial = {
  email: string;
  trialEndsAt: string; // ISO
  startedAt: string; // ISO
};

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { timestampValue: string | undefined | null }
  | { nullValue: null };

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

const FIRESTORE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID || "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

/** Hjelper for å lese felter trygt */
function readStringField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string
): string | null {
  const v = fields?.[key];
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  return null;
}

function readBoolField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string
): boolean | null {
  const v = fields?.[key];
  if (!v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  return null;
}

/**
 * Leser evt. lagret trial-info fra localStorage
 */
function loadStoredTrial(): StoredTrial | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTrial;
    if (!parsed || !parsed.trialEndsAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredTrial(value: StoredTrial | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(value));
}

function loadStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    return v || null;
  } catch {
    return null;
  }
}

function saveStoredEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (!email) {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  } else {
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
  }
}

/**
 * Sjekker Firestore om det finnes en aktiv lisens for
 * gitt e-postadresse og produkt "formelsamling".
 */
async function fetchRemoteLicense(email: string): Promise<boolean> {
  if (!FIRESTORE_PROJECT_ID || !FIREBASE_API_KEY) {
    // Hvis ikke konfigurert, antar vi bare ingen fjern-lisens
    return false;
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: "licenses" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: "product" },
                op: "EQUAL",
                value: { stringValue: "formelsamling" }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "active" }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: "customerEmail" },
                op: "EQUAL",
                value: { stringValue: email }
              }
            }
          ]
        }
      },
      orderBy: [
        {
          field: { fieldPath: "createdAt" },
          direction: "DESCENDING"
        }
      ],
      limit: 1
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    // Vi logger bare i konsoll – appen skal ikke knekke
    const text = await res.text().catch(() => "");
    console.error("Feil ved henting av lisens fra Firestore:", text);
    return false;
  }

  const rows = (await res.json()) as Array<{ document?: FirestoreDocument }>;

  const doc = rows.find((r) => r.document && r.document.fields)?.document;
  if (!doc || !doc.fields) return false;

  const fields = doc.fields;
  const paid = readBoolField(fields, "paid");
  const status = readStringField(fields, "status");
  const licenseType = readStringField(fields, "licenseType");

  if (status === "active" && paid !== false) {
    // Vi tolker alle aktive, betalte lisenser (single purchase / subscription)
    // som "pro" for appen.
    console.log("Fant aktiv lisens for", email, {
      status,
      licenseType,
      paid
    });
    return true;
  }

  return false;
}

/**
 * Hook som holder orden på:
 *  - gratis / trial / pro
 *  - lokal trial i localStorage
 *  - enkel sjekk mot Firestore for pro-lisens via e-post
 */
export function useLicense(): LicenseState {
  const [tier, setTier] = useState<LicenseTier>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Les lokal state (trial + e-post) ved første render
  useEffect(() => {
    const storedTrial = loadStoredTrial();
    const storedEmail = loadStoredEmail();

    if (storedTrial) {
      setTrialEndsAt(storedTrial.trialEndsAt);
      setTrialUsed(true);
      if (!storedEmail && storedTrial.email) {
        setEmail(storedTrial.email);
        saveStoredEmail(storedTrial.email);
      }
    }

    if (storedEmail) {
      setEmail(storedEmail);
    }

    setLoading(false);
    // Initial sjekk mot Firestore hvis vi har e-post
    if (storedEmail) {
      setRefreshToken((x) => x + 1);
    }
  }, []);

  // Avledet trial-status
  const { isTrialActive, isTrialExpired } = useMemo(() => {
    if (!trialEndsAt) {
      return { isTrialActive: false, isTrialExpired: trialUsed };
    }
    const now = Date.now();
    const end = Date.parse(trialEndsAt);
    if (Number.isNaN(end)) {
      return { isTrialActive: false, isTrialExpired: trialUsed };
    }
    const active = now < end;
    return {
      isTrialActive: active,
      isTrialExpired: trialUsed && !active
    };
  }, [trialEndsAt, trialUsed]);

  // Hoved-heuristikk for tier
  useEffect(() => {
    // Hvis vi allerede har pro, holder vi oss der til noe annet sier ifra
    if (tier === "pro") return;

    if (isTrialActive) {
      setTier("trial");
    } else {
      setTier("free");
    }
  }, [isTrialActive, tier]);

  // Hent lisens fra Firestore når refreshToken eller e-post endrer seg
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    async function run() {
      setError(null);
      try {
        const hasLicense = await fetchRemoteLicense(email);
        if (cancelled) return;
        if (hasLicense) {
          setTier("pro");
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Feil ved lisenskall:", err);
        setError("Kunne ikke sjekke lisensstatus nå.");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [email, refreshToken]);

  const startTrial = (inputEmail: string) => {
    const trimmed = (inputEmail || "").trim();
    if (!trimmed) return;

    const now = new Date();
    const ends = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const stored: StoredTrial = {
      email: trimmed,
      startedAt: now.toISOString(),
      trialEndsAt: ends.toISOString()
    };

    saveStoredTrial(stored);
    saveStoredEmail(trimmed);

    setEmail(trimmed);
    setTrialUsed(true);
    setTrialEndsAt(stored.trialEndsAt);
    setTier("trial");

    // Når brukeren har startet trial (og sannsynligvis senere kjøper lisens
    // med samme e-post), kan vi trigge remote-sjekk ved behov.
  };

  const refresh = () => {
    if (!email) {
      // Ingen e-post å sjekke mot – vi gjør ingen remote-kall.
      return;
    }
    setRefreshToken((x) => x + 1);
  };

  return {
    tier,
    isTrialActive,
    isTrialExpired,
    trialEndsAt,
    trialUsed,
    loading,
    error,
    startTrial,
    refresh
  };
}
