"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

type LicenseTier = "free" | "trial" | "pro";

type LicenseState = {
  tier: LicenseTier;
  email?: string;
  trialEndsAt?: string;
  trialUsed: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  loading: boolean;
};

type LicenseContextValue = LicenseState & {
  /** Start lokal 10-dagers prøveperiode */
  startTrial: (email: string) => void;
  /** Sett lisens til PRO (kan senere kobles til Stripe/Firestore) */
  activatePro: (opts: { email?: string }) => void;
  /** Tilbake til begrenset gratis-versjon (brukes sjelden) */
  resetToFree: () => void;
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
      loading: false
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
    loading: false
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
    loading: true
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
      trialUsed: state.trialUsed
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
        return { ...prev, loading: false };
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

  const activatePro = (opts: { email?: string }) => {
    setState((prev) => ({
      ...prev,
      tier: "pro",
      email: opts.email ?? prev.email,
      isTrialActive: false,
      isTrialExpired: false,
      loading: false
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

  const hasFullAccess =
    state.tier === "pro" ||
    (state.tier === "trial" && state.isTrialActive);

  const value: LicenseContextValue = {
    ...state,
    startTrial,
    activatePro,
    resetToFree,
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
