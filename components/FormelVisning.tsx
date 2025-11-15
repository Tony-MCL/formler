// /components/FormelVisning.tsx
"use client";

import React from "react";
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
  const { basePath, t } = useI18n();

  if (!formula) {
    return (
      <section className="card">
        <h2>{t("fm_no_formula_selected_title")}</h2>
        <p>{t("fm_no_formula_selected_body")}</p>
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
              aria-label={t("fm_btn_home_aria")}
              style={{
                fontSize: "0.85rem",
                paddingInline: "0.7rem"
              }}
            >
              {t("fm_btn_home")}
            </button>
          )}
        </div>
        <PDFExport />
      </div>

      <h2 className="main-hero-title">{formula.name}</h2>
      {formula.description && (
        <p className="main-hero-sub">{formula.description}</p>
      )}

      <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
        <strong>{t("fm_base_expression_label")}: </strong>
        <MathText text={formula.baseExpression} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>{t("fm_variables_heading")}</h3>
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
                {t("fm_variables_col_symbol")}
              </th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                {t("fm_variables_col_name")}
              </th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                {t("fm_variables_col_unit")}
              </th>
              <th style={{ textAlign: "left", paddingBottom: "0.2rem" }}>
                {t("fm_variables_col_description")}
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
      </div>

      {formula.variants && formula.variants.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: "0 0 0.4rem" }}>
            {t("fm_variants_heading")}
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
        </div>
      )}

      {/* Kalkulator-seksjon */}
      <Kalkulator formulaId={formulaId} />
    </section>
  );
}
