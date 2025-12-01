"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { getDb } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

// Delt nøkkel mellom app/page.tsx og denne fila
export const LICENSE_TOKEN_STORAGE_KEY = "mcl_fm_licToken_v1";

const TRIAL_STORAGE_KEY = "mcl_fm_trial_v1";
const EMAIL_STORAGE_KEY = "mcl_fm_license_email_v1";

const FIRESTORE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

const STRIPE_WORKER_URL =
  (process.env.NEXT_PUBLIC_STRIPE_WORKER_URL as string | undefined) || "";

/* ------------------------------------------------------------------ */
/*  FIRESTORE TYPES & HELPERS                                         */
/* ------------------------------------------------------------------ */

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { nullValue: null };

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
/*  LOCALSTORAGE – TRIAL, E-POST, TOKEN                               */
/* ------------------------------------------------------------------ */

type StoredTrial = {
  trialEndsAt: string;
};

function loadStoredTrial(): StoredTrial | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.trialEndsAt === "string") {
      return { trialEndsAt: parsed.trialEndsAt };
    }
    return null;
  } catch {
    return null;
  }
}

function saveStoredTrial(trial: StoredTrial | null) {
  if (typeof window === "undefined") return;
  if (!trial) {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trial));
}

function loadStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!raw) return null;
    const trimmed = raw.trim().toLowerCase();
    return trimmed || null;
  } catch {
    return null;
  }
}

function saveStoredEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (!email) {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  } else {
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email.trim().toLowerCase());
  }
}

function loadStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LICENSE_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}

function saveStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(LICENSE_TOKEN_STORAGE_KEY);
  } else {
    window.localStorage.setItem(LICENSE_TOKEN_STORAGE_KEY, token);
  }
}

/* ------------------------------------------------------------------ */
/*  FIRESTORE-LISENSSJEKK (FALLBACK VIA E-POST)                       */
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
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "active" }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: "paid" },
                op: "EQUAL",
                value: { booleanValue: true }
              }
            }
          ]
        }
      },
      limit: 1
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Lisens: Firestore runQuery-feil:", text);
      return false;
    }

    const data = await res.json();
    if (!Array.isArray(data)) return false;

    for (const row of data) {
      if (row && row.document && row.document.fields) {
        const fields = row.document.fields as Record<string, FirestoreValue>;
        const status = readStringField(fields, "status");
        const paid = readBooleanField(fields, "paid");
        const product = readStringField(fields, "product");

        if (status === "active" && paid && product === "formelsamling") {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error("Lisens: Uventet feil ved Firestore-forespørsel:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  TOKEN-VERIFISERING VIA STRIPE-WORKER                              */
/* ------------------------------------------------------------------ */

function getWorkerBaseUrl(): string | null {
  if (!STRIPE_WORKER_URL) return null;
  // NEXT_PUBLIC_STRIPE_WORKER_URL kan være:
  //  - full path til /create-checkout-session
  //  - eller base-URL til workeren
  // Vi stripper /create-checkout-session hvis det finnes.
  return STRIPE_WORKER_URL.replace(/\/create-checkout-session\/?$/, "");
}

type VerifyTokenResult =
  | { ok: true; payload: any }
  | { ok: false; error: string };

// Strukturen vi forventer inni payload.products
type TokenProduct = {
  product: string;
  plan?: string;
  billing?: string;
  seats?: number;
};

async function verifyStoredToken(): Promise<VerifyTokenResult> {
  const token = loadStoredToken();
  if (!token) {
    return { ok: false, error: "Ingen token lagret." };
  }

  const baseUrl = getWorkerBaseUrl();
  if (!baseUrl) {
    console.warn(
      "Lisens: STRIPE worker-URL mangler, kan ikke verifisere token."
    );
    return { ok: false, error: "Worker-URL mangler." };
  }

  try {
    const res = await fetch(`${baseUrl}/verify-lic-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licToken: token })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Lisens: verify-lic-token HTTP-feil:", res.status, text);
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.error || "Token avvist av server." };
    }

    return { ok: true, payload: data.payload };
  } catch (err) {
    console.error("Lisens: Uventet feil ved verifisering av token:", err);
    return { ok: false, error: "Nettverksfeil ved token-verifisering." };
  }
}

/* ------------------------------------------------------------------ */
/*  HOVEDHOOK                                                          */
/* ------------------------------------------------------------------ */

function useLicenseInternal(): LicenseState {
  const [tier, setTier] = useState<LicenseTier>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Last inn lokalt lagret trial, e-post og token + beregn lisensstatus
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const storedTrial = loadStoredTrial();
      const storedEmail = loadStoredEmail();

      if (!cancelled) {
        if (storedTrial?.trialEndsAt) {
          setTrialEndsAt(storedTrial.trialEndsAt);
          setTrialUsed(true);
        } else {
          setTrialEndsAt(null);
          setTrialUsed(false);
        }

        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          setEmail(null);
        }
      }

      let nextTier: LicenseTier = "free";
      let proByToken = false;

      // 1) Prøv token-modellen først
      const tokenResult = await verifyStoredToken();
      if (tokenResult.ok) {
        const payload = tokenResult.payload as any;
        const products: TokenProduct[] = Array.isArray(payload.products)
          ? (payload.products as TokenProduct[])
          : [];

        const hasFormelsamling = products.some(
          (p: TokenProduct) =>
            p &&
            typeof p.product === "string" &&
            p.product.toLowerCase() === "formelsamling"
        );

        if (hasFormelsamling) {
          nextTier = "pro";
          proByToken = true;
        }
      } else {
        // Hvis token er ugyldig, kan vi rydde den bort for å unngå spam
        if (
          tokenResult.error &&
          (tokenResult.error.includes("utløpt") ||
            tokenResult.error.includes("Ugyldig") ||
            tokenResult.error.includes("avvist"))
        ) {
          saveStoredToken(null);
        }
      }

      // 2) Fallback: lokal trial
      if (!proByToken && storedTrial?.trialEndsAt) {
        try {
          const now = new Date();
          const ends = new Date(storedTrial.trialEndsAt);
          if (now < ends) {
            nextTier = "trial";
          }
        } catch {
          // ignorér ugyldig dato
        }
      }

      // 3) Fallback: Firestore-lookup på e-post
      if (!proByToken && storedEmail) {
        const hasRemote = await fetchRemoteLicense(storedEmail);
        if (hasRemote) {
          nextTier = "pro";
        }
      }

      if (!cancelled) {
        setTier(nextTier);
        setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const startTrial = (emailForTrial: string) => {
    if (typeof window === "undefined") return;

    const trimmed = (emailForTrial || "").trim().toLowerCase();
    if (trimmed) {
      saveStoredEmail(trimmed);
      setEmail(trimmed);
    }

    const now = new Date();
    // F.eks. 10 dagers prøveperiode (juster ved behov)
    now.setDate(now.getDate() + 10);
    const iso = now.toISOString();

    // Lokal lagring (som før)
    saveStoredTrial({ trialEndsAt: iso });
    setTrialEndsAt(iso);
    setTrialUsed(true);
    setTier("trial");

    // Nytt: logg trial-bruker til Firestore for admin-oversikt
    try {
      const db = getDb();
      // Vi gjør kallet "fire-and-forget" for ikke å blokkere UI
      void addDoc(collection(db, "trialSignups"), {
        email: trimmed || null,
        product: "formelsamling",
        startedAt: serverTimestamp(),
        trialEndsAt: iso,
        source: "formler-app"
      });
    } catch (err) {
      console.error(
        "Lisens: Klarte ikke å lagre trial-bruker i Firestore:",
        err
      );
    }
  };

  const linkEmail = (emailToLink: string) => {
    const trimmed = (emailToLink || "").trim().toLowerCase();
    if (!trimmed) return;
    saveStoredEmail(trimmed);
    setEmail(trimmed);
    // Kjør en ny runde med lisenssjekk
    setRefreshToken((x) => x + 1);
  };

  const refresh = () => {
    setRefreshToken((x) => x + 1);
  };

  const isTrialActive = useMemo(() => {
    if (!trialEndsAt) return false;
    try {
      const now = new Date();
      const ends = new Date(trialEndsAt);
      return now < ends;
    } catch {
      return false;
    }
  }, [trialEndsAt]);

  const isTrialExpired = useMemo(() => {
    if (!trialEndsAt) return false;
    try {
      const now = new Date();
      const ends = new Date(trialEndsAt);
      return now >= ends;
    } catch {
      return false;
    }
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
