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

export default function Kalkulator({ formulaId }: KalkulatorProps) {
  const formula = getFormulaById(formulaId);

  const variants = useMemo(() => listVariants(formulaId), [formulaId]);
  const [solveFor, setSolveFor] = useState<SolveForId>(
    variants[0]?.solveFor ?? (formula?.variables[0]?.id as SolveForId)
  );

  const [inputs, setInputs] = useState<InputMap>({});
  const [resultText, setResultText] = useState<string | null>(null);
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
    new Map(
      variants.map((v) => [v.solveFor, v.solveFor])
    ).values()
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
    setResultText(null);

    // Vi trenger alle variabler bortsett fra solveFor
    const requiredVars = formula.variables.filter((v) => v.id !== solveFor);

    const numericInput: Record<string, number> = {};
    for (const v of requiredVars) {
      const raw = inputs[v.id];
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
    const unit = res.unit ?? outVar?.unit ?? "";

    const rounded =
      Math.abs(res.value) >= 1000 || Math.abs(res.value) < 0.01
        ? res.value.toExponential(3)
        : res.value.toFixed(3).replace(/\.?0+$/, "");

    const label = outVar
      ? `${outVar.symbol} (${outVar.name})`
      : solveFor.toString();

    setResultText(`${label} = ${rounded}${unit ? " " + unit : ""}`);
  };

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h3 style={{ margin: "0 0 0.4rem" }}>Kalkulator</h3>
      <p style={{ margin: "0 0 0.8rem", fontSize: "0.9rem", color: "var(--mcl-muted)" }}>
        Velg hvilken variabel du vil løse for, fyll inn de andre og trykk{" "}
        <strong>Beregn</strong>.
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
              setResultText(null);
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

      {resultText && (
        <div
          style={{
            marginTop: "0.4rem",
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            background: "rgba(0, 0, 0, 0.03)",
            fontSize: "0.95rem"
          }}
        >
          <strong>Resultat: </strong>
          {resultText}
        </div>
      )}
    </section>
  );
}
