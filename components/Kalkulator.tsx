// components/Kalkulator.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FormulaId, SolveForId } from "../lib/types";
import { getFormulaById } from "../lib/formulas";
import { solveFormula, listVariants } from "../lib/engine";
import MathText from "./MathText";
import { formatInlineMath } from "../lib/mathFormat";

type KalkulatorProps = {
  formulaId: FormulaId;
};

type InputMap = Record<string, string>;

type ResultState = {
  label: string;
  pretty: string;
  raw: string;
  solveFor: SolveForId;
  inputs: Record<string, string>;
  variantExpression?: string;
};

/** Formater pen verdi med antall desimaler basert på enhet */
function formatPrettyNumber(value: number, unit?: string): string {
  let decimals = 2;

  if (unit) {
    const u = unit.toLowerCase();

    // kilo-enheter: kV, kA, kW, kWh, kΩ, kVA → 1 desimal
    if (u.startsWith("k")) {
      decimals = 1;
    }
    // milli-enheter: mA, mW, mΩ, mVA osv. → 2 desimaler
    else if (u.startsWith("m")) {
      decimals = 2;
    } else {
      decimals = 2;
    }
  }

  const str = value.toFixed(decimals);
  return str
    .replace(/(\.\d*?[1-9])0+$/u, "$1")
    .replace(/\.0+$/u, "");
}

/**
 * Skaler verdier til kV, kA, mA, kW, mW, kWh, kΩ, mΩ, kVA der det er naturlig.
 * Terskler:
 *  - V → kV fra 1000 V
 *  - A → kA fra 1000 A, mA under 1 A
 *  - W → kW fra 1000 W, mW under 1 W
 *  - Wh → kWh fra 1000 Wh
 *  - Ω → kΩ fra 1000 Ω, mΩ under 0,01 Ω
 *  - VA → kVA fra 1000 VA
 */
function scaleValue(
  value: number,
  unit?: string
): { value: number; unit?: string } {
  const abs = Math.abs(value);
  if (!unit) return { value, unit };

  switch (unit) {
    case "V":
      if (abs >= 1000) return { value: value / 1000, unit: "kV" };
      return { value, unit: "V" };

    case "A":
      if (abs >= 1000) return { value: value / 1000, unit: "kA" };
      if (abs > 0 && abs < 1) return { value: value * 1000, unit: "mA" };
      return { value, unit: "A" };

    case "W":
      if (abs >= 1000) return { value: value / 1000, unit: "kW" };
      if (abs > 0 && abs < 1) return { value: value * 1000, unit: "mW" };
      return { value, unit: "W" };

    case "Wh":
      if (abs >= 1000) return { value: value / 1000, unit: "kWh" };
      return { value, unit: "Wh" };

    case "VA":
      if (abs >= 1000) return { value: value / 1000, unit: "kVA" };
      if (abs > 0 && abs < 1) return { value: value * 1000, unit: "mVA" };
      return { value, unit: "VA" };

    case "Ω":
    case "ohm":
    case "Ohm":
      if (abs >= 1000) return { value: value / 1000, unit: "kΩ" };
      if (abs > 0 && abs < 0.01) return { value: value * 1000, unit: "mΩ" };
      return { value, unit: "Ω" };

    default:
      return { value, unit };
  }
}

function makeSolveLabel(
  formula: ReturnType<typeof getFormulaById> | undefined,
  id: SolveForId
) {
  const v = formula?.variables.find((x) => x.id === id);
  if (!v) return id.toString();
  const symbol = formatInlineMath(v.symbol);
  return `${symbol} (${v.name})`;
}

export default function Kalkulator({ formulaId }: KalkulatorProps) {
  const formula = getFormulaById(formulaId);
  const variants = useMemo(
    () => listVariants(formulaId),
    [formulaId]
  );

  // Tom streng = ingen variant valgt ennå
  const [solveFor, setSolveFor] = useState<SolveForId | "">("");
  const [inputs, setInputs] = useState<InputMap>({});
  const [result, setResult] = useState<ResultState | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Reset kalkulator når aktiv formel byttes
  useEffect(() => {
    setSolveFor("");
    setInputs({});
    setResult(null);
    setErrorText(null);
  }, [formulaId]);

  if (!formula || variants.length === 0) {
    return (
      <section style={{ marginTop: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>Kalkulator</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--mcl-muted)" }}>
          Kalkulator er ikke tilgjengelig for denne formelen.
        </p>
      </section>
    );
  }

  const solveOptions = Array.from(
    new Map(variants.map((v) => [v.solveFor, v.solveFor])).values()
  );

  const currentVariant =
    (solveFor && variants.find((v) => v.solveFor === solveFor)) || null;

  const handleChangeInput = (id: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSolve = () => {
    setErrorText(null);
    setResult(null);

    if (!solveFor) {
      setErrorText("Velg først hva du vil løse for.");
      return;
    }

    const requiredVars = formula.variables.filter((v) => v.id !== solveFor);

    const numericInput: Record<string, number> = {};
    const snapshotInputs: Record<string, string> = {};

    for (const v of requiredVars) {
      const rawStateValue = inputs[v.id];

      // cosphi får default 1 hvis ikke utfylt
      if (
        (rawStateValue === undefined || rawStateValue === "") &&
        v.id === "cosphi"
      ) {
        numericInput[v.id] = 1;
        snapshotInputs[v.id] = "1.0";
        continue;
      }

      if (rawStateValue === undefined || rawStateValue === "") {
        setErrorText(`Fyll inn verdi for ${v.symbol} (${v.name}).`);
        return;
      }

      const num = Number(rawStateValue.toString().replace(",", "."));
      if (!isFinite(num)) {
        setErrorText(`Ugyldig tall for ${v.symbol} (${v.name}).`);
        return;
      }
      numericInput[v.id] = num;
      snapshotInputs[v.id] = rawStateValue;
    }

    const res = solveFormula(
      formulaId,
      solveFor as SolveForId,
      numericInput
    );
    if (!res.ok || res.value === undefined) {
      setErrorText(res.error ?? "Kunne ikke beregne resultat.");
      return;
    }

    const outVar = formula.variables.find((v) => v.id === solveFor);
    const baseUnit = res.unit ?? outVar?.unit;
    const scaled = scaleValue(res.value, baseUnit);

    const prettyNumber = formatPrettyNumber(scaled.value, scaled.unit);
    const prettyText = scaled.unit
      ? `${prettyNumber} ${scaled.unit}`
      : prettyNumber;

    const rawNumber = res.value.toPrecision(6);
    const rawText = baseUnit ? `${rawNumber} ${baseUnit}` : rawNumber;

    const label = outVar
      ? `${formatInlineMath(outVar.symbol)} (${outVar.name})`
      : (solveFor as string);

    setResult({
      label,
      pretty: prettyText,
      raw: rawText,
      solveFor: solveFor as SolveForId,
      inputs: snapshotInputs,
      variantExpression: currentVariant?.expression
    });
  };

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "0.4rem"
        }}
      >
        <h3 style={{ margin: 0 }}>Kalkulator</h3>
      </div>

      {/* Interaktiv del – skjules ved print */}
      <div className="calc-interactive">
        {/* Velg variant */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "0.8rem"
          }}
        >
          <select
            value={solveFor}
            onChange={(e) => {
              const next = e.target.value as SolveForId | "";
              setSolveFor(next);
              setResult(null);
              setErrorText(null);
            }}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: 6,
              border: "1px solid var(--mcl-outline)",
              background: "var(--mcl-surface)",
              color: "var(--mcl-text)",
              fontSize: "0.9rem"
            }}
          >
            <option value="">Velg hva du vil løse for</option>
            {solveOptions.map((id) => {
              const label = makeSolveLabel(formula, id);
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>

          {currentVariant && (
            <div style={{ fontSize: "0.9rem" }}>
              <span style={{ color: "var(--mcl-muted)" }}>Bruker variant: </span>
              <MathText text={currentVariant.expression} />
            </div>
          )}
        </div>

        {/* Input-felt – vises først når bruker har valgt variant */}
        {solveFor && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
              marginBottom: "0.9rem"
            }}
          >
            {formula.variables
              .filter((v) => v.id !== solveFor)
              .map((v) => (
                <label
                  key={v.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.85rem",
                    gap: "0.2rem"
                  }}
                >
                  <span>
                    {formatInlineMath(v.symbol)} ({v.name})
                    {v.unit ? ` [${v.unit}]` : ""}:
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs[v.id] ?? ""}
                    onChange={(e) => handleChangeInput(v.id, e.target.value)}
                    placeholder={v.id === "cosphi" ? "1.0" : ""}
                    style={{
                      padding: "0.35rem 0.5rem",
                      borderRadius: 6,
                      border: "1px solid var(--mcl-outline)",
                      background: "var(--mcl-bg)",
                      color: "var(--mcl-text)",
                      fontSize: "0.9rem"
                    }}
                  />
                </label>
              ))}
          </div>
        )}

        <button
          type="button"
          className="button"
          onClick={handleSolve}
          disabled={!solveFor}
          style={{
            background: "var(--mcl-brand)",
            color: "#fff",
            borderRadius: 999,
            padding: "0.45rem 0.9rem",
            marginBottom: "0.6rem",
            opacity: solveFor ? 1 : 0.6,
            cursor: solveFor ? "pointer" : "default"
          }}
        >
          Beregn
        </button>

        {/* Feiltekst */}
        {errorText && (
          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "0.85rem",
              color: "var(--mcl-error, #b91c1c)"
            }}
          >
            {errorText}
          </div>
        )}
      </div>

      {/* Resultat (skjules ved print, får egen print-versjon under) */}
      {result && (
        <div
          className="calc-result"
          style={{
            marginTop: "0.4rem",
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            background: "rgba(0, 0, 0, 0.03)",
            fontSize: "0.9rem"
          }}
        >
          <div>
            <strong>Resultat: </strong>
            {result.label} = {result.pretty}
          </div>
          <div
            style={{
              marginTop: "0.15rem",
              fontSize: "0.8rem",
              color: "var(--mcl-muted)"
            }}
          >
            Rå verdi: {result.raw}
          </div>
        </div>
      )}

      {result && (
        <div className="calc-print-summary">
          <div className="calc-print-header-grid">
            <div className="calc-print-header-cell">
              <strong>Løs for:</strong>{" "}
              {makeSolveLabel(formula, result.solveFor)}
            </div>
            <div className="calc-print-header-cell">
              {result.variantExpression && (
                <>
                  <strong>Bruker:</strong>{" "}
                  <MathText text={result.variantExpression} />
                </>
              )}
            </div>
          </div>

          <div className="calc-print-values-grid">
            {formula.variables.map((v) => {
              if (v.id === result.solveFor) return null;
              const val = result.inputs[v.id];
              if (!val) return null;

              return (
                <div key={v.id} className="calc-print-value-field">
                  <div className="calc-print-label">
                    {formatInlineMath(v.symbol)} ({v.name})
                    {v.unit ? ` [${v.unit}]` : ""}:
                  </div>
                  <div className="calc-print-value">
                    {val}
                    {v.unit ? ` ${v.unit}` : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="calc-print-result-box">
            <div>
              <strong>Resultat: </strong>
              {result.label} = {result.pretty}
            </div>
            <div className="calc-print-raw">Rå verdi: {result.raw}</div>
          </div>
        </div>
      )}
    </section>
  );
}
