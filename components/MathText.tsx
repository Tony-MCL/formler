"use client";

import React from "react";

type MathTextProps = {
  text: string;
};

/**
 * Enkel, "pen nok" matte-visning for stil B:
 * - " * " → " · "
 * - "cosphi" → "cos φ"
 * - små justeringer for lesbarhet
 *
 * Senere kan vi bytte ut innmaten med ordentlig KaTeX/LaTeX uten
 * å endre resten av appen, så lenge prop-signaturen er lik.
 */
export default function MathText({ text }: MathTextProps) {
  let pretty = text;

  // Multiplikasjonstegn
  pretty = pretty.replace(/\s*\*\s*/g, " · ");

  // cosphi → cos φ
  pretty = pretty.replace(/cosphi/g, "cos φ");

  // Eventuell "phi" alene → φ (forsiktig, bare ordgrense)
  pretty = pretty.replace(/\bphi\b/g, "φ");

  return <span className="math-text">{pretty}</span>;
}
