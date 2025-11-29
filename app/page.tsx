"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LangToggle from "../components/LangToggle";
import FormelVisning from "../components/FormelVisning";
import LicenseModal from "../components/LicenseModal";
import { useI18n } from "../lib/i18n";
import { useLicense } from "../lib/license";
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

  const { tier, isTrialActive, isTrialExpired, trialEndsAt, trialUsed } =
    license;

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

  // Åpne lisensmodal automatisk ved #license / #lisens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.toLowerCase();
    if (hash === "#license" || hash === "#lisens") {
      setLicenseModalOpen(true);
    }
  }, []);

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
                // -------------------------------------------------
                // Kort ved AKTIV lisens (fullversjon)
                // -------------------------------------------------
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
                // -------------------------------------------------
                // Kort for GRATIS / PRØVEPERIODE / KJØP LISENS
                // -------------------------------------------------
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
