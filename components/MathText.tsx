"use client";

import React from "react";
import { formatInlineMath } from "../lib/mathFormat";

type MathTextVariant = "normal" | "large";

type MathTextProps = {
  text: string;
  variant?: MathTextVariant;
};

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
    // Multiplikasjonstegn: * → ·
    const cleaned = trimmed.replace(/\*/g, "·");
    return formatInlineMath(cleaned);
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
    // Multiplikasjonstegn på venstre side av likhetstegn
    const left = trimmed.slice(0, eqIndex).trim().replace(/\*/g, "·");
    const right = trimmed.slice(eqIndex + 1).trim();


    return (
      <span className={className}>
        <span>{formatInlineMath(left)}</span>
        <span>{` = `}</span>
        {renderExpr(right)}
      </span>
    );
  }

  return <span className={className}>{renderExpr(trimmed)}</span>;
}
