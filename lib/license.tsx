"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { getDb } from "./firebase";

type LicenseTier = "free" | "trial" | "pro";

type LicenseState = {
  tier: LicenseTier;
  email?: string;
  trialEndsAt?: string;
  trialUsed: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  loading: boolean;
  /** Når vi har funnet en PRO-lisens i Firestore, lagrer vi utløpsdato (om den finnes) her kun som info. */
  proValidTo?: string;
};

type LicenseContextValue = LicenseState & {
  /** Start lokal 10-dagers prøveperiode */
  startTrial: (email: string) => void;
  /**
   * Aktiver PRO lokalt (kan brukes for manuell testing eller dersom du
   * vil sette PRO direkte etter en vellykket Stripe-redirect i appen).
   */
  activatePro: (opts: { email?: string; proValidTo?: string }) => void;
  /** Tilbake til begrenset gratis-versjon (brukes sjelden) */
  resetToFree: () => void;
  /**
   * Sett e-post som skal brukes til lisensoppslag i Firestore uten
   * å starte prøveperiode. Kan brukes dersom bruker allerede har kjøpt
   * lisens via nettsiden.
   */
  setLookupEmail: (email: string) => void;
  /** True når bruker skal ha fullversjons-opplevelse i appen */
  hasFullAccess: boolean;
};

const STORAGE_KEY = "mcl_formler_license_v1";

type StoredLicenseV1 = {
  version: 1;
  tier: LicenseTier;
  email?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialUsed?: boolean;
  proValidTo?: string;
};

const LicenseCtx = createContext<LicenseContextValue | null>(null);

function loadStoredLicense(): StoredLicenseV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLicenseV1;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function computeStateFromStored(stored: StoredLicenseV1 | null): LicenseState {
  if (!stored) {
    return {
      tier: "free",
      email: undefined,
      trialEndsAt: undefined,
      trialUsed: false,
      isTrialActive: false,
      isTrialExpired: false,
      loading: false,
      proValidTo: undefined
    };
  }

  const now = Date.now();
  let tier: LicenseTier = stored.tier ?? "free";
  let trialUsed = stored.trialUsed ?? false;
  const trialEndsAt = stored.trialEndsAt;
  let isTrialActive = false;
  let isTrialExpired = false;

  if (trialEndsAt) {
    const endTs = Date.parse(trialEndsAt);
    if (!Number.isNaN(endTs)) {
      trialUsed = true;
      if (now < endTs && tier === "trial") {
        isTrialActive = true;
        isTrialExpired = false;
      } else if (now >= endTs) {
        isTrialActive = false;
        isTrialExpired = true;
        if (tier === "trial") {
          tier = "free";
        }
      }
    }
  }

  return {
    tier,
    email: stored.email,
    trialEndsAt,
    trialUsed,
    isTrialActive,
    isTrialExpired,
    loading: false,
    proValidTo: stored.proValidTo
  };
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LicenseState>({
    tier: "free",
    email: undefined,
    trialEndsAt: undefined,
    trialUsed: false,
    isTrialActive: false,
    isTrialExpired: false,
    loading: true,
    proValidTo: undefined
  });

  // Last inn lagret lisens fra localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = loadStoredLicense();
    const computed = computeStateFromStored(stored);
    setState(computed);
  }, []);

  // Persistér lisens til localStorage (ikke mens vi fortsatt laster)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.loading) return;

    const toStore: StoredLicenseV1 = {
      version: 1,
      tier: state.tier,
      email: state.email,
      trialEndsAt: state.trialEndsAt,
      trialStartedAt: undefined,
      trialUsed: state.trialUsed,
      proValidTo: state.proValidTo
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignorer lagringsfeil
    }
  }, [state]);

  const startTrial = (email: string) => {
    setState((prev) => {
      // Har allerede brukt prøve eller har PRO → ikke start ny
      if (prev.trialUsed || prev.tier === "pro") {
        return { ...prev, loading: false, email: email || prev.email };
      }

      const now = new Date();
      const durationMs = 10 * 24 * 60 * 60 * 1000; // 10 dager
      const end = new Date(now.getTime() + durationMs);

      return {
        ...prev,
        tier: "trial",
        email: email || prev.email,
        trialEndsAt: end.toISOString(),
        trialUsed: true,
        isTrialActive: true,
        isTrialExpired: false,
        loading: false
      };
    });
  };

  const activatePro = (opts: { email?: string; proValidTo?: string }) => {
    setState((prev) => ({
      ...prev,
      tier: "pro",
      email: opts.email ?? prev.email,
      isTrialActive: false,
      isTrialExpired: false,
      loading: false,
      proValidTo: opts.proValidTo ?? prev.proValidTo
    }));
  };

  const resetToFree = () => {
    setState((prev) => ({
      ...prev,
      tier: "free",
      isTrialActive: false,
      // beholder info om at prøve er brukt/utløpt
      isTrialExpired: prev.isTrialExpired || prev.trialUsed,
      trialEndsAt: prev.trialEndsAt,
      loading: false
    }));
  };

  const setLookupEmail = (email: string) => {
    setState((prev) => ({
      ...prev,
      email: email || prev.email
    }));
  };

  // Synkroniser PRO-lisens fra Firestore basert på e-postadresse
  useEffect(() => {
    if (!state.email) return;

    let unsub: (() => void) | undefined;
    let cancelled = false;

    try {
      const db = getDb();
      const colRef = collection(db, "licenses");
      // Juster feltnavn/verdier til ditt faktiske skjema:
      //  - email: e-post brukt ved kjøp
      //  - appId: "formler" (eller annet fast navn for denne appen)
      //  - status: "active"
      const q = query(
        colRef,
        where("email", "==", state.email.toLowerCase()),
        where("appId", "==", "formler"),
        where("status", "==", "active")
      );

      unsub = onSnapshot(q, (snap) => {
        if (cancelled) return;

        let hasActivePro = false;
        let bestValidTo: Date | undefined;

        snap.forEach((doc) => {
          const data = doc.data() as {
            validTo?: Timestamp;
            status?: string;
          };

          // Hvis du bruker andre feltnavn enn validTo/status, juster her.
          if (data.status !== "active") {
            return;
          }

          const validTo = data.validTo?.toDate?.();
          if (!validTo) {
            // Ingen sluttdato → behandler som aktiv til videre
            hasActivePro = true;
            return;
          }

          if (validTo.getTime() > Date.now()) {
            hasActivePro = true;
            if (!bestValidTo || validTo > bestValidTo) {
              bestValidTo = validTo;
            }
          }
        });

        if (hasActivePro) {
          const validToIso = bestValidTo?.toISOString();

          setState((prev) => ({
            ...prev,
            tier: "pro",
            isTrialActive: false,
            isTrialExpired: prev.isTrialExpired,
            loading: false,
            proValidTo: validToIso ?? prev.proValidTo
          }));
        } else {
          // Ingen aktiv PRO-lisens i Firestore → ikke rør tier hvis bruker har trial
          setState((prev) => ({
            ...prev,
            loading: false
          }));
        }
      });
    } catch (err) {
      console.warn("[MCL] Kunne ikke koble til Firestore for lisensoppslag:", err);
    }

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [state.email]);

  const hasFullAccess =
    state.tier === "pro" ||
    (state.tier === "trial" && state.isTrialActive);

  const value: LicenseContextValue = {
    ...state,
    startTrial,
    activatePro,
    resetToFree,
    setLookupEmail,
    hasFullAccess
  };

  return (
    <LicenseCtx.Provider value={value}>{children}</LicenseCtx.Provider>
  );
}

export function useLicense(): LicenseContextValue {
  const ctx = useContext(LicenseCtx);
  if (!ctx) {
    throw new Error("LicenseProvider is missing in component tree");
  }
  return ctx;
}
