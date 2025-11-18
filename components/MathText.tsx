"use client";

import React, { useMemo } from "react";
import katex from "katex";

type MathTextVariant = "normal" | "large";

type MathTextProps = {
  text: string;
  variant?: MathTextVariant;
};

/**
 * Små hjelpefunksjoner som oversetter vår enkle tekstsyntaks til LaTeX
 * som KaTeX kan rendre pent.
 *
 * Støtter blant annet:
 *  - "*"  → "\cdot"
 *  - "cosphi" → "\cos\varphi"
 *  - "phi" → "\varphi"
 *  - subscript: R_1, n_s → R_{1}, n_{s}
 *  - brøker:  U / R  → \frac{U}{R} (med støtte for parenteser)
 */

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

function applyReplacementsForLatex(text: string): string {
  let s = text.trim();
  if (!s) return "";

  // Multiplikasjonstegn
  s = s.replace(/\s*\*\s*/g, " \\cdot ");

  // cosphi → cos φ
  s = s.replace(/cosphi/g, "\\cos\\varphi");

  // phi → φ (kun som eget ord)
  s = s.replace(/\bphi\b/g, "\\varphi");

  // Subscript: R_1, n_s, R_tot, osv.
  s = s.replace(
    /([A-Za-z]+)_([A-Za-z0-9]+)/g,
    (_: string, base: string, sub: string) => {
      return `${base}_{${sub}}`;
    }
  );

  return s;
}

/** Rekursiv konvertering der "/" på top-nivå blir til \frac{...}{...} */
function convertExpr(expr: string): string {
  const trimmed = expr.trim();
  if (!trimmed) return "";

  const idx = findTopLevelDivision(trimmed);
  if (idx === -1) {
    return applyReplacementsForLatex(trimmed);
  }

  const numerator = trimmed.slice(0, idx);
  const denominator = trimmed.slice(idx + 1);

  const numLatex = convertExpr(numerator);
  const denLatex = convertExpr(denominator);

  return `\\frac{${numLatex}}{${denLatex}}`;
}

/** Hoved-funksjon: gjør hele uttrykket om til LaTeX, inkl. likhetstegn. */
function toLatex(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Hvis brukeren senere vil skrive ren LaTeX selv (starter med "\"),
  // lar vi det gå rett igjennom.
  if (trimmed.startsWith("\\")) {
    return trimmed;
  }

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) {
    return convertExpr(trimmed);
  }

  const leftRaw = trimmed.slice(0, eqIndex);
  const rightRaw = trimmed.slice(eqIndex + 1);

  const leftLatex = applyReplacementsForLatex(leftRaw);
  const rightLatex = convertExpr(rightRaw);

  return `${leftLatex} = ${rightLatex}`;
}

export default function MathText({ text, variant = "normal" }: MathTextProps) {
  const latex = useMemo(() => toLatex(text), [text]);

  if (!latex) return null;

  const className =
    variant === "large" ? "math-text math-text--large" : "math-text";

  let html = "";
  try {
    html = katex.renderToString(latex, {
      throwOnError: false
    });
  } catch {
    // Fallback: vis ren tekst hvis KaTeX feiler
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
