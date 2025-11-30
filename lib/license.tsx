"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type LicenseTier = "free" | "trial" | "pro";

export type LicenseState = {
  tier: LicenseTier;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialEndsAt: string | null;
  trialUsed: boolean;
  loading: boolean;
  error: string | null;
  hasFullAccess: boolean;
  startTrial: (email: string) => void;
  linkEmail: (email: string) => void;
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
  | { timestampValue: string }
  | { nullValue: null };

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

/**
 * Viktig:
 *  - .env har NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *  - vi støtter også NEXT_PUBLIC_FIRESTORE_PROJECT_ID hvis du vil ha det senere
 */
const FIRESTORE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

/* ------------------------------------------------------------------ */
/*  HJELPERE FOR FIRESTORE-FELTER                                     */
/* ------------------------------------------------------------------ */

function readStringField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string
): string | null {
  const v = fields?.[key];
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  return null;
}

function readBooleanField(
  fields: Record<string, FirestoreValue> | undefined,
  key: string
): boolean {
  const v = fields?.[key];
  if (!v) return false;
  if ("booleanValue" in v) return !!v.booleanValue;
  return false;
}

/* ------------------------------------------------------------------ */
/*  LOCALSTORAGE – TRIAL OG E-POST                                    */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  FIRESTORE-LISENSSJEKK                                             */
/* ------------------------------------------------------------------ */

async function fetchRemoteLicense(emailRaw: string): Promise<boolean> {
  if (!FIRESTORE_PROJECT_ID || !FIREBASE_API_KEY) {
    console.warn(
      "Lisens: Firestore ikke konfigurert (mangler prosjekt-id eller api-key)."
    );
    return false;
  }

  const email = (emailRaw || "").trim().toLowerCase();
  if (!email) return false;

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
                field: { fieldPath: "customerEmail" },
                op: "EQUAL",
                value: { stringValue: email }
              }
            },
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
    const text = await res.text().catch(() => "");
    console.error("Feil ved henting av lisens fra Firestore:", text);
    return false;
  }

  const rows = (await res.json()) as Array<{ document?: FirestoreDocument }>;
  const doc = rows.find((r) => r.document && r.document.fields)?.document;
  if (!doc || !doc.fields) return false;

  const fields = doc.fields;
  const status = readStringField(fields, "status");
  const paid = readBooleanField(fields, "paid");

  if (status !== "active") return false;
  if (!paid) return false;

  return true;
}

/* ------------------------------------------------------------------ */
/*  HOOK: INTERN LISENSLOGIKK                                        */
/* ------------------------------------------------------------------ */

function useLicenseInternal(): LicenseState {
  const [tier, setTier] = useState<LicenseTier>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Init: les trial-info + e-post fra localStorage
  useEffect(() => {
    const storedTrial = loadStoredTrial();
    const storedEmail = loadStoredEmail();

    if (storedTrial) {
      setTrialEndsAt(storedTrial.trialEndsAt);
      setTrialUsed(true);
      const now = new Date();
      const ends = new Date(storedTrial.trialEndsAt);
      if (now < ends) {
        setTier("trial");
      }
    }

    if (storedEmail) {
      setEmail(storedEmail.toLowerCase());
    }

    setLoading(false);
  }, []);

  // Sjekk lisens i Firestore når vi har e-post eller refreshToken endres
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    async function run(emailLocal: string) {
      setLoading(true);
      setError(null);
      try {
        const hasLicense = await fetchRemoteLicense(emailLocal);
        if (cancelled) return;
        if (hasLicense) {
          setTier("pro");
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Feil ved lisenskall:", err);
        setError("Kunne ikke sjekke lisensstatus nå.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run(email);

    return () => {
      cancelled = true;
    };
  }, [email, refreshToken]);

  const startTrial = (inputEmail: string) => {
    const trimmed = (inputEmail || "").trim().toLowerCase();
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
  };

  const linkEmail = (inputEmail: string) => {
    const trimmed = (inputEmail || "").trim().toLowerCase();
    if (!trimmed) return;

    saveStoredEmail(trimmed);
    setEmail(trimmed);
    // Tvinger en ny runde mot Firestore
    setRefreshToken((x) => x + 1);
  };

  const refresh = () => {
    if (!email) return;
    setRefreshToken((x) => x + 1);
  };

  const isTrialActive = useMemo(() => {
    if (!trialEndsAt) return false;
    const now = new Date();
    const ends = new Date(trialEndsAt);
    return now < ends;
  }, [trialEndsAt]);

  const isTrialExpired = useMemo(() => {
    if (!trialEndsAt) return false;
    const now = new Date();
    const ends = new Date(trialEndsAt);
    return now >= ends;
  }, [trialEndsAt]);

  const hasFullAccess =
    tier === "pro" || (tier === "trial" && isTrialActive);

  return {
    tier,
    isTrialActive,
    isTrialExpired,
    trialEndsAt,
    trialUsed,
    loading,
    error,
    hasFullAccess,
    startTrial,
    linkEmail,
    refresh
  };
}

/* ------------------------------------------------------------------ */
/*  CONTEXT + PROVIDER + HOOK                                         */
/* ------------------------------------------------------------------ */

const LicenseContext = createContext<LicenseState | null>(null);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const value = useLicenseInternal();
  return (
    <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
  );
}

export function useLicense(): LicenseState {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    return useLicenseInternal();
  }
  return ctx;
}
