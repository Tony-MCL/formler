"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LangToggle from "../components/LangToggle";
import FormelVisning from "../components/FormelVisning";
import { useI18n } from "../lib/i18n";
import type { FormulaId } from "../lib/types";

type ViewMode = "home" | "formula";

export default function HomePage() {
  const { t, basePath } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFormulaId, setSelectedFormulaId] =
    useState<FormulaId>("ohm");
  const [viewMode, setViewMode] = useState<ViewMode>("home");

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
            <section className="card main-hero" style={{ marginBottom: "1rem" }}>
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
          )}

          {viewMode === "formula" && (
            <FormelVisning
              formulaId={selectedFormulaId}
              onGoHome={handleGoHome}
            />
          )}
        </main>
      </div>
    </div>
  );
}
