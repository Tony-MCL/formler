"use client";

import React, { useMemo, useState } from "react";
import type { FormulaId, SolveForId } from "../lib/types";
import { getFormulaById } from "../lib/formulas";
import { solveFormula, listVariants } from "../lib/engine";
import MathText from "./MathText";

type KalkulatorProps = {
  formulaId: FormulaId;
};

type InputMap = Record<string, string>;

type ResultState = {
  label: string;
  pretty: string;
  raw: string;
};

/** Formater pen verdi med rett antall desimaler basert på enhet */
function formatPrettyNumber(value: number, unit?: string): string {
  let decimals = 2;

  if (unit) {
    const u = unit.toLowerCase();

    // kilo-enheter: kV, kA, kW, kWh, kΩ → 1 desimal
    if (u.startsWith("k")) {
      decimals = 1;
    }
    // milli-enheter: mV, mA, mW, mΩ → 2 desimaler (beholder 2)
    else if (u.startsWith("m")) {
      decimals = 2;
    } else {
      decimals = 2;
    }
  }

  const str = value.toFixed(decimals);
  // fjern overflødige nuller og punktum
  return str.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

/** Skaler verdier til kV, kA, mA, kW, kWh, kΩ, mΩ der det er naturlig */
function scaleValue(
  value: number,
  unit?: string
): { value: number; unit?: string } {
  const abs = Math.abs(value);
  if (!unit) return { value, unit };

  switch (unit) {
    case "V":
      if (abs >= 1000) return { value: value / 1000, unit: "kV" };
      if (abs > 0 && abs < 1) return { value: value * 1000, unit: "mV" };
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
    case "Ω":
    case "ohm":
    case "Ohm":
      if (abs >= 1000) return { value: value / 1000, unit: "kΩ" };
      if (abs > 0 && abs < 1) return { value: value * 1000, unit: "mΩ" };
      return { value, unit: "Ω" };
    default:
      return { value, unit };
  }
}

export default function Kalkulator({ formulaId }: KalkulatorProps) {
  const formula = getFormulaById(formulaId);

  const variants = useMemo(() => listVariants(formulaId), [formulaId]);
  const [solveFor, setSolveFor] = useState<SolveForId>(
    variants[0]?.solveFor ?? (formula?.variables[0]?.id as SolveForId)
  );

  const [inputs, setInputs] = useState<InputMap>({});
  const [result, setResult] = useState<ResultState | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

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
    variants.find((v) => v.solveFor === solveFor) ?? variants[0];

  const handleChangeInput = (id: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSolve = () => {
    setErrorText(null);
    setResult(null);

    const requiredVars = formula.variables.filter((v) => v.id !== solveFor);

    const numericInput: Record<string, number> = {};
    for (const v of requiredVars) {
      const raw = inputs[v.id];

      // cosphi får default 1 hvis ikke utfylt
      if ((raw === undefined || raw === "") && v.id === "cosphi") {
        numericInput[v.id] = 1;
        continue;
      }

      if (raw === undefined || raw === "") {
        setErrorText(`Fyll inn verdi for ${v.symbol} (${v.name}).`);
        return;
      }

      const num = Number(raw.toString().replace(",", "."));
      if (!isFinite(num)) {
        setErrorText(`Ugyldig tall for ${v.symbol} (${v.name}).`);
        return;
      }
      numericInput[v.id] = num;
    }

    const res = solveFormula(formulaId, solveFor, numericInput);
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
      ? `${outVar.symbol} (${outVar.name})`
      : solveFor.toString();

    setResult({
      label,
      pretty: prettyText,
      raw: rawText
    });
  };

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h3 style={{ margin: "0 0 0.4rem" }}>Kalkulator</h3>
      <p
        style={{
          margin: "0 0 0.8rem",
          fontSize: "0.9rem",
          color: "var(--mcl-muted)"
        }}
      >
        Velg hvilken variabel du vil løse for, fyll inn de andre og trykk{" "}
        <strong>Beregn</strong>. cosφ settes automatisk til 1 hvis du ikke
        skriver noe.
      </p>

      {/* Velg "løs for" */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "0.8rem"
        }}
      >
        <label style={{ fontSize: "0.9rem" }}>
          Løs for:
          <select
            value={solveFor}
            onChange={(e) => {
              const next = e.target.value as SolveForId;
              setSolveFor(next);
              setResult(null);
              setErrorText(null);
            }}
            style={{
              marginLeft: "0.5rem",
              padding: "0.25rem 0.5rem",
              borderRadius: 6,
              border: "1px solid var(--mcl-outline)",
              background: "var(--mcl-surface)",
              color: "var(--mcl-text)",
              fontSize: "0.9rem"
            }}
          >
            {solveOptions.map((id) => {
              const v = formula.variables.find((x) => x.id === id);
              const label = v ? `${v.symbol} (${v.name})` : id;
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>

        {currentVariant && (
          <div style={{ fontSize: "0.9rem" }}>
            <span style={{ color: "var(--mcl-muted)" }}>Bruker: </span>
            <MathText text={currentVariant.expression} />
          </div>
        )}
      </div>

      {/* Input-felt */}
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
                {v.symbol} ({v.name}){v.unit ? ` [${v.unit}]` : ""}:
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

      <button
        type="button"
        className="button"
        onClick={handleSolve}
        style={{
          background: "var(--mcl-brand)",
          color: "#fff",
          borderRadius: 999,
          padding: "0.45rem 0.9rem",
          marginBottom: "0.6rem"
        }}
      >
        Beregn
      </button>

      {/* Resultat / feil */}
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

      {result && (
        <div
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
    </section>
  );
}
