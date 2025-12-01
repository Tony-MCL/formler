"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LangToggle from "../components/LangToggle";
import FormelVisning from "../components/FormelVisning";
import LicenseModal from "../components/LicenseModal";
import { useI18n } from "../lib/i18n";
import { useLicense, LICENSE_TOKEN_STORAGE_KEY } from "../lib/license";
import type { FormulaId } from "../lib/types";

type ViewMode = "home" | "formula";

const workerUrl = process.env
  .NEXT_PUBLIC_STRIPE_WORKER_URL as string | undefined;

export default function HomePage() {
  const { t, basePath } = useI18n();
  const license = useLicense();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFormulaId, setSelectedFormulaId] =
    useState<FormulaId>("ohm");
  const [viewMode, setViewMode] = useState<ViewMode>("home");

  const [trialEmail, setTrialEmail] = useState("");
  const [trialError, setTrialError] = useState<string | null>(null);

  const [activationEmail, setActivationEmail] = useState("");
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationInfo, setActivationInfo] = useState<string | null>(null);

  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  const appNameKey = "fm_app_name";
  const heroTitleKey = "fm_hero_title";
  const heroSubKey = "fm_hero_sub";

  const appName =
    t(appNameKey) === appNameKey ? "Digital Formelsamling" : t(appNameKey);
  const heroTitle =
    t(heroTitleKey) === heroTitleKey
      ? "Formler du faktisk bruker – samlet på ett sted"
      : t(heroTitleKey);
  const heroSub =
    t(heroSubKey) === heroSubKey
      ? "Beregninger for elkraft og maskiner, med pen visning og innebygde kalkulatorer."
      : t(heroSubKey);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleSelectFormula = (id: FormulaId) => {
    setSelectedFormulaId(id);
    setViewMode("formula");
  };

  const handleGoHome = () => {
    setViewMode("home");
  };

  const {
    tier,
    isTrialActive,
    isTrialExpired,
    trialEndsAt,
    trialUsed
  } = license;

  const canStartTrial = tier === "free" && !trialUsed;

  const formatDateNO = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleStartTrial = () => {
    const trimmed = trialEmail.trim().toLowerCase();
    if (!trimmed) {
      setTrialError(
        "Skriv inn e-postadressen din for å starte prøveperioden."
      );
      return;
    }

    setTrialError(null);
    license.startTrial(trimmed);
  };

  const handleOpenLicenseModal = () => {
    setLicenseModalOpen(true);
  };

  const handleActivateLicense = () => {
    const trimmed = activationEmail.trim().toLowerCase();
    if (!trimmed) {
      setActivationError("Skriv inn e-postadressen din.");
      return;
    }

    setActivationError(null);
    setActivationInfo(
      "Sjekker etter lisens på denne adressen. Hvis du har kjøpt lisens med denne e-posten, blir fullversjon aktivert."
    );
    // Knytt e-post til lisenssystemet
    license.linkEmail(trimmed);
    // Trigg faktisk sjekk mot Firestore
    license.refresh();
  };

  // Åpne lisensmodal automatisk ved #license / #lisens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.toLowerCase();
    if (hash === "#license" || hash === "#lisens") {
      setLicenseModalOpen(true);
    }
  }, []);

  // Hvis vi kommer tilbake fra Stripe med session_id i URL,
  // henter vi et signert lisens-token fra Stripe-workeren og lagrer det lokalt.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!workerUrl) return;

    const currentUrl = new URL(window.location.href);
    const sessionId = currentUrl.searchParams.get("session_id");
    if (!sessionId) return;

    const baseUrl = workerUrl.replace(/\/create-checkout-session\/?$/, "");
    if (!baseUrl) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`${baseUrl}/issue-lic-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Klarte ikke å hente lisens-token:", res.status, text);
          return;
        }

        const data = await res.json();
        if (!cancelled && data && data.ok && data.licToken) {
          try {
            window.localStorage.setItem(
              LICENSE_TOKEN_STORAGE_KEY,
              data.licToken as string
            );
          } catch {
            // Ignorer lagringsfeil hvis f.eks. localStorage er deaktivert
          }

          license.refresh();
        }
      } catch (err) {
        console.error("Uventet feil ved henting av lisens-token:", err);
      } finally {
        if (!cancelled) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("session_id");
          newUrl.searchParams.delete("status");
          window.history.replaceState({}, "", newUrl.toString());
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [license]);

  return (
    <div className="page-root">
      <header className="header">
        {/* DESKTOP */}
        <div className="header-inner header-desktop container">
          <div className="header-left">
            <button
              className="button sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle meny"
            >
              ☰
            </button>
            <div className="header-title">
              <img
                src={`${basePath}/images/mcl-logo.svg`}
                alt="Morning Coffee Labs"
                className="header-logo"
              />
              <div className="header-text">
                <div className="header-app-name">{appName}</div>
                <div className="header-subtitle">{heroTitle}</div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* MOBIL */}
        <div className="header-inner header-mobile container">
          <div className="header-left">
            <button
              className="button sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle meny"
            >
              ☰
            </button>
            <div className="header-title">
              <img
                src={`${basePath}/images/mcl-logo.svg`}
                alt="Morning Coffee Labs"
                className="header-logo"
              />
              <div className="header-text">
                <div className="header-app-name">{appName}</div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="main-layout container">
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          selectedFormulaId={selectedFormulaId}
          onSelectFormula={handleSelectFormula}
        />

        <main className="main-content">
          {viewMode === "home" && (
            <section className="hero">
              <div className="hero-text">
                <h1>{heroTitle}</h1>
                <p>{heroSub}</p>

                <div className="hero-actions">
                  <button
                    className="button primary"
                    onClick={handleOpenLicenseModal}
                  >
                    Åpne lisens- og kjøpsdialog
                  </button>
                  {canStartTrial && (
                    <div className="trial-box">
                      <label>
                        Start prøveperiode (14 dager):
                        <input
                          type="email"
                          value={trialEmail}
                          onChange={(e) => setTrialEmail(e.target.value)}
                          placeholder="din@epost.no"
                        />
                      </label>
                      {trialError && (
                        <div className="error-text">{trialError}</div>
                      )}
                      <button
                        className="button secondary"
                        onClick={handleStartTrial}
                      >
                        Start prøveperiode
                      </button>
                    </div>
                  )}
                  {!canStartTrial && trialUsed && (
                    <div className="trial-info">
                      {isTrialActive && trialEndsAt && (
                        <p>
                          Prøveperioden er aktiv til{" "}
                          <strong>{formatDateNO(trialEndsAt)}</strong>.
                        </p>
                      )}
                      {isTrialExpired && (
                        <p>Prøveperioden er utløpt.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="license-activation">
                  <h3>Aktiver lisens med e-post (fallback)</h3>
                  <p>
                    Hvis du har kjøpt lisens tidligere med e-post, kan du
                    aktivere fullversjon her:
                  </p>
                  <label>
                    E-postadresse:
                    <input
                      type="email"
                      value={activationEmail}
                      onChange={(e) => setActivationEmail(e.target.value)}
                      placeholder="din@epost.no"
                    />
                  </label>
                  {activationError && (
                    <div className="error-text">{activationError}</div>
                  )}
                  {activationInfo && (
                    <div className="info-text">{activationInfo}</div>
                  )}
                  <button
                    className="button secondary"
                    onClick={handleActivateLicense}
                  >
                    Sjekk lisens
                  </button>
                </div>
              </div>
            </section>
          )}

          {viewMode === "formula" && (
            <FormelVisning
              formulaId={selectedFormulaId}
              onGoHome={handleGoHome}
            />
          )}
        </main>
      </div>

      <LicenseModal
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
      />
    </div>
  );
}
