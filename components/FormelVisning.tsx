"use client";

import React, { useEffect, useState } from "react";
import { getFormulaById } from "../lib/formulas";
import type { FormulaId } from "../lib/types";
import MathText from "./MathText";
import Kalkulator from "./Kalkulator";
import PDFExport from "./PDFExport";
import { useI18n } from "../lib/i18n";

type FormelVisningProps = {
  formulaId: FormulaId;
  onGoHome?: () => void;
};

export default function FormelVisning({
  formulaId,
  onGoHome
}: FormelVisningProps) {
  const formula = getFormulaById(formulaId);
  const { basePath } = useI18n();
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

      <h2 className="main-hero-title">{formula.name}</h2>
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
            onClick={() => setShowInfo(prev => !prev)}
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
                    <MathText text={v.symbol} />
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
            <h3 style={{ margin: "0 0 0.4rem" }}>Varianter (løs for …)</h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "0.9rem"
              }}
            >
              {formula.variants.map((variant) => (
                <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                  <strong>Løs for: </strong>
                  <MathText text={variant.expression} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Kalkulator-seksjon (interaktiv på skjerm, med egen print-oppsummering) */}
      <Kalkulator formulaId={formulaId} />

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
                        <MathText text={v.symbol} />
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
                <h4 style={{ margin: "0 0 0.4rem" }}>Varianter (løs for …)</h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2rem",
                    fontSize: "0.85rem"
                  }}
                >
                  {formula.variants.map((variant) => (
                    <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                      <strong>Løs for: </strong>
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
