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
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleStartTrial = () => {
    if (!canStartTrial) return;

    const trimmed = trialEmail.trim();
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
    const trimmed = activationEmail.trim();
    if (!trimmed) {
      setActivationError("Skriv inn e-postadressen du brukte ved kjøp.");
      setActivationInfo(null);
      return;
    }
    setActivationError(null);
    setActivationInfo(
      "Sjekker etter lisens på denne adressen. Hvis du har kjøpt lisens med denne e-posten, blir fullversjon aktivert."
    );
    license.linkEmail(trimmed);
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

  /**
   * TOKEN-FLOW:
   *  - Etter kjøp i Stripe kommer brukeren tilbake til:
   *    ?status=success&session_id=cs_test_...
   *  - Her henter vi et lisens-token fra workeren (/issue-lic-token),
   *    lagrer det i localStorage og kjører license.refresh().
   *  - Hvis vi bare har ?status=success (uten session_id),
   *    bruker vi dagens fallback (license.refresh()).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const workerUrl = process.env.NEXT_PUBLIC_STRIPE_WORKER_URL as
      | string
      | undefined;

    console.log("[LIC-TOKEN] effect start");
    console.log("[LIC-TOKEN] workerUrl:", workerUrl);

    const url = new URL(window.location.href);
    console.log("[LIC-TOKEN] current URL:", url.toString());

    const status = url.searchParams.get("status");
    const sessionId = url.searchParams.get("session_id");
    console.log("[LIC-TOKEN] session_id from URL:", sessionId);

    // Ingen session_id → bruk gammel oppførsel for status=success og hopp ut
    if (!sessionId) {
      if (status === "success") {
        console.log(
          "[LIC-TOKEN] status=success uten session_id → bare license.refresh()."
        );
        license.refresh();
      } else {
        console.log(
          "[LIC-TOKEN] Ingen session_id i URL – avbryter token-flow."
        );
      }
      return;
    }

    if (!workerUrl) {
      console.error(
        "[LIC-TOKEN] NEXT_PUBLIC_STRIPE_WORKER_URL mangler – kan ikke hente token."
      );
      return;
    }

    const baseUrl = workerUrl.replace(/\/create-checkout-session\/?$/, "");
    console.log("[LIC-TOKEN] baseUrl for worker:", baseUrl);

    (async () => {
      try {
        console.log(
          "[LIC-TOKEN] Kaller /issue-lic-token med sessionId:",
          sessionId
        );

        const res = await fetch(`${baseUrl}/issue-lic-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        console.log("[LIC-TOKEN] /issue-lic-token status:", res.status);
        console.log("[LIC-TOKEN] /issue-lic-token response body:", data);

        // Venter { ok: true, token: string, payload: {...} }
        if (!res.ok || !data || data.ok !== true || typeof data.token !== "string") {
          console.error(
            "[LIC-TOKEN] Klarte ikke å hente gyldig lisens-token.",
            { resStatus: res.status, data }
          );
        } else {
          const token = data.token as string;
          window.localStorage.setItem(LICENSE_TOKEN_STORAGE_KEY, token);
          console.log("[LIC-TOKEN] Lagret token i localStorage.");
          // Nå som token er lagret, ber vi lisens-hooken gjøre en ny runde
          license.refresh();
        }

        // Rens URL for session_id og status uansett utfall
        url.searchParams.delete("session_id");
        url.searchParams.delete("status");
        window.history.replaceState({}, "", url.toString());
        console.log("[LIC-TOKEN] Renset session_id/status fra URL.");
      } catch (err) {
        console.error("[LIC-TOKEN] Uventet feil i token-flow:", err);
      }
    })();
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
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <button
              className="button"
              onClick={handleGoHome}
              aria-label="Gå til forside"
              style={{ paddingInline: "0.5rem" }}
            >
              ⌂
            </button>

            <img
              src={`${basePath}/images/mcl-logo.png`}
              alt="Morning Coffee Labs"
              className="brand-logo"
            />
          </div>

          <div className="header-center">
            <div className="brand-title">{appName}</div>
          </div>

          <div className="toolbar">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* MOBIL */}
        <div className="header-inner header-mobile container">
          <div className="header-mobile-top">
            <img
              src={`${basePath}/images/mcl-logo.png`}
              alt="Morning Coffee Labs"
              className="brand-logo"
            />
          </div>

          <div className="header-mobile-bottom">
            <div className="header-mobile-left">
              <button
                className="button sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>

              <button
                className="button"
                onClick={handleGoHome}
                aria-label="Gå til forside"
                style={{ paddingInline: "0.5rem" }}
              >
                ⌂
              </button>

              <span className="brand-title">{appName}</span>
            </div>

            <div className="toolbar">
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="app-shell container">
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          selectedFormulaId={selectedFormulaId}
          onSelectFormula={handleSelectFormula}
        />

        <main className="app-main">
          {viewMode === "home" && (
            <>
              <section
                className="card main-hero"
                style={{ marginBottom: "1rem" }}
              >
                <h1 className="main-hero-title">{heroTitle}</h1>
                <p className="main-hero-sub">{heroSub}</p>
                <ul className="main-hero-list">
                  <li>
                    Fokus på elkraft, motorer og generatorer i første versjon.
                  </li>
                  <li>Formler med pen visning og innebygd kalkulator.</li>
                  <li>
                    Klar for PDF-eksport og flere fagområder i senere versjoner.
                  </li>
                </ul>
                <p className="main-hero-footnote">
                  Velg en formel i menyen til venstre for å starte.
                </p>
              </section>

              {tier === "pro" ? (
                <section className="card">
                  <h2 style={{ marginTop: 0 }}>Fullversjon aktiv</h2>
                  <p style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                    Hei!
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                    Du har <strong>fullversjon</strong> av Digital
                    Formelsamling. Kalkulatoren er åpen for alle formler, og
                    utskrifter genereres uten vannmerke.
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.9rem" }}>
                    Takk for at du støtter videre utvikling av appen – nye
                    formler og forbedringer vil bli rullet ut fortløpende.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      alignItems: "center"
                    }}
                  >
                    <a
                      href="https://tony-mcl.github.io/website/"
                      target="_blank"
                      rel="noreferrer"
                      className="button"
                      style={{
                        borderRadius: 999,
                        paddingInline: "0.9rem",
                        fontSize: "0.9rem",
                        textDecoration: "none"
                      }}
                    >
                      Besøk nettsiden vår
                    </a>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--mcl-muted)",
                        margin: 0
                      }}
                    >
                      Utforsk våre andre apper og prosjekter.
                    </p>
                  </div>
                </section>
              ) : (
                <section className="card">
                  <h2 style={{ marginTop: 0 }}>Lisens og prøveperiode</h2>
                  <p style={{ fontSize: "0.9rem" }}>
                    Appen kan brukes gratis uten innlogging. I gratisversjonen
                    er kalkulatoren slått av, og utskrifter har vannmerke.
                  </p>

                  {tier === "trial" && isTrialActive && (
                    <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      Du har en <strong>aktiv prøveperiode</strong> som varer
                      til <strong>{formatDateNO(trialEndsAt)}</strong>. I denne
                      perioden har du full tilgang til kalkulatoren og utskrift
                      uten vannmerke.
                    </p>
                  )}

                  {tier === "free" && isTrialExpired && (
                    <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      Din 10-dagers prøveperiode er over. Du kan fortsatt bruke
                      formelsamlingen gratis, men kalkulatoren er slått av og
                      utskrifter har vannmerke. Kjøp lisens for å få full
                      tilgang igjen.
                    </p>
                  )}

                  {tier === "free" && !isTrialExpired && !trialUsed && (
                    <>
                      <p style={{ fontSize: "0.9rem" }}>
                        Ønsker du å teste fullversjonen? Start en{" "}
                        <strong>gratis 10-dagers prøveperiode</strong> med
                        e-postadressen din.
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0, 2fr) minmax(0, 1fr)",
                          gap: "0.5rem",
                          maxWidth: "500px",
                          marginTop: "0.5rem"
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            fontSize: "0.85rem",
                            gap: "0.2rem"
                          }}
                        >
                          <span>E-postadresse</span>
                          <input
                            type="email"
                            value={trialEmail}
                            onChange={(e) => setTrialEmail(e.target.value)}
                            placeholder="navn@firma.no"
                            style={{
                              padding: "0.4rem 0.6rem",
                              borderRadius: 8,
                              border: "1px solid var(--mcl-outline)",
                              fontSize: "0.9rem"
                            }}
                          />
                        </label>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-start"
                          }}
                        >
                          <button
                            type="button"
                            className="button"
                            onClick={handleStartTrial}
                            disabled={!canStartTrial}
                            style={{
                              background: "var(--mcl-brand)",
                              color: "#fff",
                              borderRadius: 999,
                              padding: "0.45rem 0.9rem",
                              opacity: canStartTrial ? 1 : 0.6,
                              cursor: canStartTrial
                                ? "pointer"
                                : "not-allowed"
                            }}
                          >
                            Start gratis prøveperiode
                          </button>
                        </div>
                      </div>
                      {trialError && (
                        <p
                          style={{
                            marginTop: "0.3rem",
                            fontSize: "0.85rem",
                            color: "var(--mcl-error, #b91c1c)"
                          }}
                        >
                          {trialError}
                        </p>
                      )}
                    </>
                  )}

                  <div
                    style={{
                      marginTop: "0.9rem",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      alignItems: "center"
                    }}
                  >
                    <button
                      type="button"
                      className="button"
                      onClick={handleOpenLicenseModal}
                      style={{
                        background: "var(--mcl-brand)",
                        color: "#fff",
                        borderRadius: 999,
                        paddingInline: "0.9rem",
                        textDecoration: "none",
                        fontSize: "0.9rem"
                      }}
                    >
                      Kjøp lisens
                    </button>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--mcl-muted)",
                        margin: 0
                      }}
                    >
                      Du kan også åpne lisensdialogen direkte med{" "}
                      <code>#license</code> i adressen.
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "1.1rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--mcl-outline-soft, #e5e7eb)"
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9rem",
                        marginBottom: "0.4rem",
                        fontWeight: 500
                      }}
                    >
                      Har du allerede kjøpt lisens?
                    </p>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        marginBottom: "0.5rem"
                      }}
                    >
                      Skriv inn e-postadressen du brukte ved kjøp, så prøver vi
                      å aktivere fullversjon i appen.
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 2fr) minmax(0, 1fr)",
                        gap: "0.5rem",
                        maxWidth: "500px"
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          fontSize: "0.85rem",
                          gap: "0.2rem"
                        }}
                      >
                        <span>E-post brukt ved kjøp</span>
                        <input
                          type="email"
                          value={activationEmail}
                          onChange={(e) => setActivationEmail(e.target.value)}
                          placeholder="samme e-post som i Stripe"
                          style={{
                            padding: "0.4rem 0.6rem",
                            borderRadius: 8,
                            border: "1px solid var(--mcl-outline)",
                            fontSize: "0.9rem"
                          }}
                        />
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "flex-start"
                        }}
                      >
                        <button
                          type="button"
                          className="button"
                          onClick={handleActivateLicense}
                          style={{
                            borderRadius: 999,
                            padding: "0.45rem 0.9rem",
                            fontSize: "0.9rem"
                          }}
                        >
                          Aktiver lisens
                        </button>
                      </div>
                    </div>
                    {activationError && (
                      <p
                        style={{
                          marginTop: "0.3rem",
                          fontSize: "0.85rem",
                          color: "var(--mcl-error, #b91c1c)"
                        }}
                      >
                        {activationError}
                      </p>
                    )}
                    {activationInfo && (
                      <p
                        style={{
                          marginTop: "0.3rem",
                          fontSize: "0.8rem",
                          color: "var(--mcl-muted)"
                        }}
                      >
                        {activationInfo}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </>
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
