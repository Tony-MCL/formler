// components/FormelVisning.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getFormulaById, formulas } from "../lib/formulas";
import type { Formula, FormulaId } from "../lib/types";
import MathText from "./MathText";
import Kalkulator from "./Kalkulator";
import PDFExport from "./PDFExport";
import { useI18n } from "../lib/i18n";

const FAVORITES_STORAGE_KEY = "mcl_formula_favorites_v1";

function loadFavoritesFromStorage(): FormulaId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as FormulaId[]) : [];
  } catch {
    return [];
  }
}

function broadcastFavoritesUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("mcl:favorites-updated"));
}

type FormelVisningProps = {
  formulaId: FormulaId;
  onGoHome?: () => void;
};

export default function FormelVisning({
  formulaId,
  onGoHome
}: FormelVisningProps) {
  const { basePath } = useI18n();

  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Aktiv formel – kan skifte mellom familiemedlemmer (1-fase / 3-fase osv.)
  const [activeFormulaId, setActiveFormulaId] =
    useState<FormulaId>(formulaId);

  // Kun "er denne formelen favoritt?" – ikke hele lista
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset aktiv formel når bruker velger ny i menyen
  useEffect(() => {
    setActiveFormulaId(formulaId);
    setShowInfo(false);
  }, [formulaId]);

  const formula: Formula | undefined = getFormulaById(activeFormulaId);

  // Håndter mobil / desktop for sidepanel
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Oppdater isFavorite når aktiv formel endres
  useEffect(() => {
    if (typeof window === "undefined") return;
    const favorites = loadFavoritesFromStorage();
    setIsFavorite(favorites.includes(activeFormulaId));
  }, [activeFormulaId]);

  // Hold isFavorite i sync hvis Sidebar oppdaterer favoritter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUpdate = () => {
      const favorites = loadFavoritesFromStorage();
      setIsFavorite(favorites.includes(activeFormulaId));
    };

    window.addEventListener("mcl:favorites-updated", handleUpdate);
    return () => {
      window.removeEventListener("mcl:favorites-updated", handleUpdate);
    };
  }, [activeFormulaId]);

  // Finn alle familiemedlemmer (enfase/trefase osv.)
  const familyMembers = useMemo(() => {
    if (!formula?.familyId) return [] as Formula[];
    return formulas.filter((f) => f.familyId === formula.familyId);
  }, [formula?.familyId]);

  const hasFamilyToggle = familyMembers.length > 1;

  const handleToggleFamilyMember = () => {
    if (!formula || !hasFamilyToggle) return;

    const currentIndex = familyMembers.findIndex((m) => m.id === formula.id);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % familyMembers.length;

    const next = familyMembers[nextIndex];
    setActiveFormulaId(next.id as FormulaId);
  };

  const phaseLabel = formula?.modeLabel ?? formula?.name ?? "";

  // Datadrevet fargevalg basert på modeLabel (ikke hardkodet på id)
  const isSinglePhaseMode = (formula?.modeLabel ?? "")
    .toLowerCase()
    .includes("1");

  const toggleFavorite = () => {
    if (typeof window === "undefined") return;

    const current = loadFavoritesFromStorage();
    const exists = current.includes(activeFormulaId);
    const next = exists
      ? current.filter((x) => x !== activeFormulaId)
      : [...current, activeFormulaId];

    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(next)
      );
      setIsFavorite(!exists);
      broadcastFavoritesUpdated();
    } catch {
      // ignorer lagringsfeil
    }
  };

  if (!formula) {
    return (
      <section className="card">
        <h2>Ingen formel valgt</h2>
        <p>Velg en formel i menyen til venstre for å se detaljer.</p>
      </section>
    );
  }

  return (
    <section className="card">
      {/* Vannmerke – kun for print */}
      <img
        src={`${basePath}/images/mcl-watermark.png`}
        alt=""
        className="print-watermark"
      />

      {/* Topp-rad: Hjem + PDF-knapp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "0.5rem"
        }}
      >
        <div>
          {onGoHome && (
            <button
              type="button"
              className="button"
              onClick={onGoHome}
              aria-label="Til forside"
              style={{
                fontSize: "0.85rem",
                paddingInline: "0.7rem"
              }}
            >
              ← Hjem
            </button>
          )}
        </div>
        <PDFExport />
      </div>

      {/* Tittel + fase-toggle + favoritt-stjerne i samme linje */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.25rem"
        }}
      >
        <h2 className="main-hero-title" style={{ margin: 0 }}>
          {formula.name}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          {hasFamilyToggle && (
            <button
              type="button"
              className="button"
              onClick={handleToggleFamilyMember}
              aria-label={`Bytt fase-modus (nå: ${phaseLabel})`}
              style={{
                fontSize: "0.8rem",
                paddingInline: "0.65rem",
                paddingBlock: "0.2rem",
                borderRadius: 999,
                border: "1px solid var(--mcl-outline)",
                background: isSinglePhaseMode
                  ? "var(--mcl-header, #e5c3a5)" // modus merket som "1-fase"
                  : "var(--mcl-brand)", // f.eks. "3-fase" eller andre
                color: isSinglePhaseMode ? "#000" : "#fff",
                fontWeight: 600
              }}
            >
              {formula.modeLabel ?? "Modus"}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFavorite}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? "Fjern formel fra favoritter"
                : "Legg formel til i favoritter"
            }
            style={{
              padding: "0 0.35rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
              color: isFavorite ? "gold" : "var(--mcl-muted)"
            }}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </div>

      {formula.description && (
        <p className="main-hero-sub">{formula.description}</p>
      )}

      {/* Grunnuttrykk – ekstra luft, midtstilt; Info-knapp helt til høyre */}
      <div
        style={{
          marginTop: "1.25rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <MathText text={formula.baseExpression} variant="large" />
        </div>

        <div className="no-print">
          <button
            type="button"
            className="button"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Vis variabler og varianter"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              paddingInline: "0.6rem",
              paddingBlock: "0.2rem",
              lineHeight: 1
            }}
          >
            i
          </button>
        </div>
      </div>

      {/* PRINT-ONLY: Variabler + Varianter inne i flisa */}
      <div className="print-only">
        {/* Variabler */}
        <section style={{ marginBottom: "1.4rem" }}>
          <h3 style={{ margin: "0 0 0.4rem" }}>Variabler</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem"
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                  Symbol
                </th>
                <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                  Navn
                </th>
                <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                  Enhet
                </th>
                <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                  Beskrivelse
                </th>
              </tr>
            </thead>
            <tbody>
              {formula.variables.map((v) => (
                <tr key={v.id}>
                  <td style={{ padding: "0.15rem 0" }}>
                    <code>{v.symbol}</code>
                  </td>
                  <td style={{ padding: "0.15rem 0" }}>{v.name}</td>
                  <td style={{ padding: "0.15rem 0" }}>{v.unit ?? "–"}</td>
                  <td
                    style={{
                      padding: "0.15rem 0",
                      color: "var(--mcl-muted)"
                    }}
                  >
                    {v.description ?? "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Varianter */}
        {formula.variants && formula.variants.length > 0 && (
          <section>
            <h3 style={{ margin: "0 0 0.4rem" }}>
              Varianter (løs for …
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "0.9rem"
              }}
            >
              {formula.variants.map((variant) => (
                <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                  <strong>{variant.label}: </strong>
                  <MathText text={variant.expression} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Kalkulator-seksjon (interaktiv på skjerm, med egen print-oppsummering) */}
      <Kalkulator formulaId={activeFormulaId} />

      {/* Sidepanel: mobil med backdrop, desktop uten */}
      {showInfo && isMobile && (
        <button
          type="button"
          className="formula-info-backdrop"
          aria-label="Lukk detaljpanel"
          onClick={() => setShowInfo(false)}
        />
      )}

      {showInfo && (
        <aside
          className="formula-info-panel"
          aria-label={`Detaljer for formel ${formula.name}`}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem"
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1rem"
              }}
            >
              Detaljer – {formula.name}
            </h3>
            <button
              type="button"
              className="button"
              onClick={() => setShowInfo(false)}
              aria-label="Lukk"
              style={{ paddingInline: "0.6rem" }}
            >
              ✕
            </button>
          </header>

          <div
            style={{
              fontSize: "0.9rem"
            }}
          >
            {/* Variabler */}
            <section style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.4rem" }}>Variabler</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem"
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                      Symbol
                    </th>
                    <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                      Navn
                    </th>
                    <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                      Enhet
                    </th>
                    <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                      Beskrivelse
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formula.variables.map((v) => (
                    <tr key={v.id}>
                      <td style={{ padding: "0.15rem 0" }}>
                        <code>{v.symbol}</code>
                      </td>
                      <td style={{ padding: "0.15rem 0" }}>{v.name}</td>
                      <td style={{ padding: "0.15rem 0" }}>
                        {v.unit ?? "–"}
                      </td>
                      <td
                        style={{
                          padding: "0.15rem 0",
                          color: "var(--mcl-muted)"
                        }}
                      >
                        {v.description ?? "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Varianter */}
            {formula.variants && formula.variants.length > 0 && (
              <section>
                <h4 style={{ margin: "0 0 0.4rem" }}>
                  Varianter (løs for …
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2rem",
                    fontSize: "0.85rem"
                  }}
                >
                  {formula.variants.map((variant) => (
                    <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                      <strong>{variant.label}: </strong>
                      <MathText text={variant.expression} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      )}
    </section>
  );
}
