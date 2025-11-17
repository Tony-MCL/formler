"use client";

import React from "react";

type MathTextVariant = "normal" | "large";

type MathTextProps = {
  text: string;
  variant?: MathTextVariant;
};

/**
 * Enkel, "pen nok" matte-visning for stil B:
 * - Erstatter * med ·
 * - cosphi → cos φ
 * - Støtter brøkvisning med CSS-basert fraksjon:
 *   "I = U / R" → I = U over R
 *
 * Dette er UI-laget. Vi kan senere bytte hele innmaten til KaTeX/LaTeX
 * uten å endre hvordan komponenten brukes.
 */

function applyReplacements(text: string): string {
  let pretty = text;

  // Multiplikasjonstegn
  pretty = pretty.replace(/\s*\*\s*/g, " · ");

  // cosphi → cos φ
  pretty = pretty.replace(/cosphi/g, "cos φ");

  // phi → φ (kun egne ord)
  pretty = pretty.replace(/\bphi\b/g, "φ");

  return pretty;
}

/** Finn første divisjonstegn på top-nivå (ikke inne i parenteser) */
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

/** Rekursiv renderer som lager brøker når den finner "/" på top-nivå */
function renderExpr(expr: string): React.ReactNode {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  const index = findTopLevelDivision(trimmed);
  if (index === -1) {
    // Ingen brøk på top-nivå – bare vis pen tekst
    return applyReplacements(trimmed);
  }

  const numerator = trimmed.slice(0, index).trim();
  const denominator = trimmed.slice(index + 1).trim();

  return (
    <span className="math-frac">
      <span className="math-frac-num">{renderExpr(numerator)}</span>
      <span className="math-frac-den">{renderExpr(denominator)}</span>
    </span>
  );
}

export default function MathText({ text, variant = "normal" }: MathTextProps) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const className =
    variant === "large" ? "math-text math-text--large" : "math-text";

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex !== -1) {
    const left = trimmed.slice(0, eqIndex).trim();
    const right = trimmed.slice(eqIndex + 1).trim();

    return (
      <span className={className}>
        <span>{applyReplacements(left)}</span>
        <span>{` = `}</span>
        {renderExpr(right)}
      </span>
    );
  }

  return <span className={className}>{renderExpr(trimmed)}</span>;
}
