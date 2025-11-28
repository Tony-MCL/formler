import { formulas } from "./formulas";
import type {
  FormulaId,
  Formula,
  FormulaVariant,
  SolveForId
} from "./types";

/* ============================================================================
 * MCL FORMELMOTOR – FASE 4
 * ----------------------------------------------------------------------------
 * Denne motoren håndterer:
 *
 *  - Parsering av enkle uttrykk (stil B):
 *      "U = R * I"
 *      "P = U * I * cosphi"
 *      "E = P * t"
 *
 *  - Variabelevaluering fra brukerens verdier
 *  - cosphi → Math.cos(φ) hvis ønskelig senere (nå behandlet som tall)
 *  - Sikker evaluering (ingen eval(), ingen eksponering av JS)
 *  - Standardisert returformat
 *
 *  Klar for fase 5 (Kalkulator).
 * ========================================================================== */

/** Intern representasjon av et evaluert uttrykk */
type EvalResult = {
  ok: boolean;
  value?: number;
  error?: string;
};

/** Henter formel etter id */
export function getFormula(id: FormulaId): Formula | undefined {
  return formulas.find((f) => f.id === id);
}

/** Henter variant etter solveFor */
export function getVariant(
  formula: Formula,
  solveFor: SolveForId
): FormulaVariant | undefined {
  if (!formula.variants) return undefined;
  return formula.variants.find((v) => v.solveFor === solveFor);
}

/* ============================================================================
 *  Parser for enkel uttrykkssyntaks
 * ============================================================================
 *
 *  Eksempel:
 *      "U = R * I"
 *
 *  Steg:
 *   1. Del på "=" → venstre = "U", høyre = "R * I"
 *   2. Tokeniser høyre del
 *   3. Bytt ut variabler med tallverdier
 *   4. Evaluer trygt
 * ============================================================================
 */

/** Konverterer "R * I" eller "P / (U * cosphi)" til et tall */
function evaluateExpression(
  expression: string,
  vars: Record<string, number>
): EvalResult {
  try {
    // Rydd mellomrom
    let expr = expression.trim();

    // Håndter cosphi → cos φ hvis det skulle dukke opp
    // men i fase 4 behandler vi cosphi som et tall (settes fra bruker)
    expr = expr.replace(/\bcosphi\b/g, (match) => {
      return vars["cosphi"] !== undefined
        ? vars["cosphi"].toString()
        : match;
    });

    // Sett inn variabler
    for (const key of Object.keys(vars)) {
      const value = vars[key];
      const re = new RegExp(`\\b${key}\\b`, "g");
      expr = expr.replace(re, `(${value})`);
    }

    // Sikker evaluering:
    // Godkjenn kun tall, parenteser og + - * /
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      return { ok: false, error: "Ugyldig symbol i uttrykk." };
    }

    // Trygt evalueringsmiljø (ingen eval, ingen funksjoner)
    const value = Function(`"use strict"; return (${expr});`)();

    if (typeof value !== "number" || isNaN(value)) {
      return { ok: false, error: "Uttrykket kunne ikke evalueres." };
    }

    return { ok: true, value };
  } catch (err) {
    return { ok: false, error: "Feil i evaluering." };
  }
}

/* ============================================================================
 *  HOVEDFUNKSJON: Løs en formelvariant
 * ============================================================================
 */

/**
 * Løser formelen for ønsket variabel.
 *
 * @param formulaId  f.eks. "ohm"
 * @param solveFor   f.eks. "U"
 * @param input      brukerens verdier, f.eks: { R: 10, I: 20 }
 */
export function solveFormula(
  formulaId: FormulaId,
  solveFor: SolveForId,
  input: Record<string, number>
): {
  ok: boolean;
  value?: number;
  unit?: string;
  error?: string;
  expressionUsed?: string;
} {
  const formula = getFormula(formulaId);
  if (!formula) {
    return { ok: false, error: "Fant ikke formel." };
  }

  const variant = getVariant(formula, solveFor);
  if (!variant) {
    return { ok: false, error: "Fant ingen variant som løser for valgt variabel." };
  }

  const expr = variant.expression;
  if (!expr.includes("=")) {
    return { ok: false, error: "Variant mangler '='." };
  }

  const [left, right] = expr.split("=");
  const trimmedLeft = left.trim();
  const trimmedRight = right.trim();

  // Vi evaluerer HØYRE side – venstre side er solveFor
  if (trimmedLeft !== solveFor) {
    return { ok: false, error: "Variant samsvarer ikke med ønsket løsningsvariabel." };
  }

  // Evaluer høyreside
  const result = evaluateExpression(trimmedRight, input);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Hent enhet fra variabeldefinisjonen hvis mulig
  const unit = formula.variables.find((v) => v.id === solveFor)?.unit;

  return {
    ok: true,
    value: result.value,
    unit,
    expressionUsed: variant.expression
  };
}

/* ============================================================================
 *  Hjelpere
 * ========================================================================== */

export function listSolveTargets(formulaId: FormulaId): SolveForId[] {
  const f = getFormula(formulaId);
  if (!f || !f.variants) return [];
  return f.variants.map((v) => v.solveFor);
}

export function listVariants(formulaId: FormulaId): FormulaVariant[] {
  const f = getFormula(formulaId);
  return f?.variants ?? [];
}

/* ============================================================================
 * Motoren er nå klar for fase 5 (Kalkulator)
 * ========================================================================== */
