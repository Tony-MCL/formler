"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LangToggle from "../components/LangToggle";
import { useI18n } from "../lib/i18n";

export default function HomePage() {
  const { t, basePath } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="page-root">
      <header className="header">
        <div className="header-inner container">
          {/* VENSTRE SIDE – sidebar-toggle helt ytterst, så logo, så tekst */}
          <div className="header-left">
            <button
              className="button sidebar-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <img
              src={`${basePath}/images/mcl-logo.png`}
              alt="Morning Coffee Labs"
              className="brand-logo"
            />

            <div className="brand-text">
              <div className="brand-title">{appName}</div>
              <div className="brand-subtitle">Morning Coffee Labs</div>
            </div>
          </div>

          {/* HØYRE SIDE – språk + tema */}
          <div className="toolbar">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="app-shell container">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="app-main">
          <section className="card main-hero">
            <h1 className="main-hero-title">{heroTitle}</h1>
            <p className="main-hero-sub">{heroSub}</p>
            <ul className="main-hero-list">
              <li>Fokus på elkraft, motorer og generatorer i første versjon.</li>
              <li>Pen mattevisning (brøker, potenser, symboler).</li>
              <li>Klar for kalkulator og PDF-eksport i senere faser.</li>
            </ul>
            <p className="main-hero-footnote">
              Start ved å velge en kategori eller formel i menyen til venstre.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
