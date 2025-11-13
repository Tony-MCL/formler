"use client";

import React from "react";
import { getFormulaById } from "../lib/formulas";
import type { FormulaId } from "../lib/types";
import MathText from "./MathText";

type FormelVisningProps = {
  formulaId: FormulaId;
};

export default function FormelVisning({ formulaId }: FormelVisningProps) {
  const formula = getFormulaById(formulaId);

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
      <h2 className="main-hero-title">{formula.name}</h2>
      {formula.description && (
        <p className="main-hero-sub">{formula.description}</p>
      )}

      <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
        <strong>Grunnuttrykk: </strong>
        <MathText text={formula.baseExpression} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>Variabler</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>Symbol</th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>Navn</th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>Enhet</th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>Beskrivelse</th>
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
                <td style={{ padding: "0.15rem 0", color: "var(--mcl-muted)" }}>
                  {v.description ?? "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formula.variants && formula.variants.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 0.4rem" }}>Varianter (løs for …)</h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
            {formula.variants.map((variant) => (
              <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                <strong>{variant.label}: </strong>
                <MathText text={variant.expression} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
