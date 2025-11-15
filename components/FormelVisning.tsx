"use client";

import React from "react";
import { getFormulaById } from "../lib/formulas";
import type { FormulaId } from "../lib/types";
import MathText from "./MathText";
import Kalkulator from "./Kalkulator";
import { useI18n } from "../lib/i18n";

type FormelVisningProps = {
  formulaId: FormulaId;
  onGoHome?: () => void;
};

export default function FormelVisning({
  formulaId,
  onGoHome
}: FormelVisningProps) {
  const { t } = useI18n();
  const formula = getFormulaById(formulaId);

  if (!formula) {
    return (
      <section className="card">
        <p>{t("no_formula_selected") ?? "Ingen formel valgt."}</p>
      </section>
    );
  }

  return (
    <section className="card">
      {/* Topp-rad: tilbake-knapp + tittel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.75rem"
        }}
      >
        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="button"
            style={{ fontSize: "0.85rem", paddingInline: "0.7rem" }}
          >
            ← {t("back_to_list") ?? "Tilbake"}
          </button>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 600
            }}
          >
            {formula.name}
          </h2>
          {formula.description && (
            <p
              style={{
                margin: "0.15rem 0 0",
                fontSize: "0.9rem",
                color: "var(--mcl-muted)"
              }}
            >
              {formula.description}
            </p>
          )}
        </div>
      </div>

      {/* Grunnuttrykk */}
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>
          {t("base_expression") ?? "Grunnuttrykk"}
        </h3>
        <div
          style={{
            padding: "0.4rem 0.6rem",
            borderRadius: "0.5rem",
            background: "var(--mcl-surface-elevated)"
          }}
        >
          <MathText text={(formula as any).baseExpression ?? ""} />
        </div>
      </div>

      {/* Variabler */}
      {Array.isArray((formula as any).variables) &&
        (formula as any).variables.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.4rem" }}>
              {t("variables") ?? "Variabler"}
            </h3>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                fontSize: "0.9rem"
              }}
            >
              {(formula as any).variables.map((v: any) => (
                <li
                  key={v.id ?? v.symbol}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.25rem"
                  }}
                >
                  <span style={{ minWidth: "3.5rem", fontWeight: 600 }}>
                    {v.symbol}
                    {v.unit ? ` [${v.unit}]` : ""}
                  </span>
                  <span>{v.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Varianter (løs for …) */}
      {Array.isArray((formula as any).variants) &&
        (formula as any).variants.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.4rem" }}>
              {t("variants") ?? "Varianter (løs for …)"}
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "0.9rem"
              }}
            >
              {(formula as any).variants.map((variant: any) => (
                <li key={variant.id} style={{ marginBottom: "0.2rem" }}>
                  <strong>{variant.label}: </strong>
                  <MathText text={variant.expression} />
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Kalkulator-seksjon */}
      <Kalkulator formulaId={formulaId} />
    </section>
  );
}
