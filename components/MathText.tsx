"use client";

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextVariant = "normal" | "large";

type MathTextProps = {
  text: string;
  variant?: MathTextVariant;
};

/**
 * Gjør en enkel uttrykksstreng om til LaTeX-vennlig tekst:
 *  - *  → \cdot
 *  - cosphi → \cos \varphi
 *  - phi → \varphi
 *  - dU, dI, dR → \Delta U, \Delta I, ...
 *  - sqrt(x) → \sqrt{x}
 *  - R_1, n_s, R_tot → R_{1}, n_{s}, R_{tot}
 *  - U^2, I^3 → U^{2}, I^{3}
 */
function applyReplacementsForLatex(text: string): string {
  let s = text.trim();
  if (!s) return "";

  // Multiplikasjonstegn
  s = s.replace(/\s*\*\s*/g, " \\cdot ");

  // cosphi → cos φ
  s = s.replace(/cosphi/g, "\\cos\\varphi");

  // phi → φ (som eget ord)
  s = s.replace(/\bphi\b/g, "\\varphi");

  // dX → ΔX (delta-prefiks, f.eks. dU, dI, dR)
  s = s.replace(/\bd([A-Za-z])\b/g, (_match, letter: string) => {
    return `\\Delta ${letter}`;
  });

  // sqrt(...) → \sqrt{...}
  // Enkel variant (ingen dype, nestede parenteser nødvendig for våre formler)
  s = s.replace(/sqrt\(([^()]+)\)/g, (_match, inner: string) => {
    const innerLatex = applyReplacementsForLatex(inner);
    return `\\sqrt{${innerLatex}}`;
  });

  // Subscript: R_1, n_s, R_tot, osv.
  s = s.replace(
    /([A-Za-z]+)_([A-Za-z0-9]+)/g,
    (_match, base: string, sub: string) => {
      return `${base}_{${sub}}`;
    }
  );

  // Superscript: U^2, I^3 osv.
  s = s.replace(
    /([A-Za-z0-9]+)\^([0-9]+)/g,
    (_match, base: string, expo: string) => {
      return `${base}^{${expo}}`;
    }
  );

  return s;
}

/** Finn første divisjonstegn på topp-nivå (ikke inni parenteser) */
function findTopLevelDivision(expr: string): number {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "/" && depth === 0) return i;
  }
  return -1;
}

/**
 * Gjør et høyreside-uttrykk om til LaTeX.
 * Top-nivå "/" blir til brøk, med rekursiv behandling.
 */
function exprToLatex(expr: string): string {
  const trimmed = expr.trim();
  if (!trimmed) return "";

  const index = findTopLevelDivision(trimmed);
  if (index === -1) {
    // Ingen brøk på top-nivå – bare vanlige erstatninger
    return applyReplacementsForLatex(trimmed);
  }

  const numerator = trimmed.slice(0, index).trim();
  const denominator = trimmed.slice(index + 1).trim();

  const numLatex = exprToLatex(numerator);
  const denLatex = exprToLatex(denominator);

  return `\\frac{${numLatex}}{${denLatex}}`;
}

/**
 * Full formel: "U = R * I" → "U = R \cdot I" med brøk osv.
 */
function toLatex(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) {
    // Bare høyreside/enkeltuttrykk
    return exprToLatex(trimmed);
  }

  const left = trimmed.slice(0, eqIndex).trim();
  const right = trimmed.slice(eqIndex + 1).trim();

  const leftLatex = applyReplacementsForLatex(left);
  const rightLatex = exprToLatex(right);

  return `${leftLatex} = ${rightLatex}`;
}

export default function MathText({ text, variant = "normal" }: MathTextProps) {
  const latex = toLatex(text);
  if (!latex) return null;

  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false
      }),
    [latex]
  );

  const className =
    variant === "large" ? "math-text math-text--large" : "math-text";

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
