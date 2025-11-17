"use client";

import React from "react";

type MathTextVariant = "normal" | "large";

type MathTextProps = {
  text: string;
  variant?: MathTextVariant;
};

/**
 * Enkel, "pen nok" matte-visning:
 * - Erstatter * med ·
 * - cosphi → cos φ
 * - Støtter brøkvisning med CSS-basert fraksjon:
 *     "I = U / R" → I = U over R
 * - Støtter nedsenket / oppløftet skrift:
 *     "U_1", "I_k", "U_{L1}", "U^2", "I^{2}"
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

/**
 * Render inline-del av uttrykk, med støtte for _ og ^:
 *   U_1  → U<sub>1</sub>
 *   U_{L1} → U<sub>L1</sub>
 *   I^2  → I<sup>2</sup>
 */
function renderInline(text: string): React.ReactNode {
  const src = applyReplacements(text);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if ((ch === "_" || ch === "^") && i > 0) {
      const isSub = ch === "_";
      i += 1;

      if (i >= src.length) break;

      let content = "";
      // Variant 1: _{...}
      if (src[i] === "{") {
        i += 1; // hopp over "{"
        const start = i;
        while (i < src.length && src[i] !== "}") {
          i += 1;
        }
        content = src.slice(start, i);
        if (i < src.length && src[i] === "}") {
          i += 1; // hopp over "}"
        }
      } else {
        // Variant 2: _X / _12 – les til første ikke-alfanumeriske tegn
        const start = i;
        while (
          i < src.length &&
          /[0-9A-Za-zÆØÅæøå]/.test(src[i])
        ) {
          i += 1;
        }
        content = src.slice(start, i);
      }

      if (content) {
        nodes.push(
          isSub ? (
            <sub key={nodes.length}>{content}</sub>
          ) : (
            <sup key={nodes.length}>{content}</sup>
          )
        );
      }
    } else {
      // Samle vanlig tekst frem til neste _ eller ^
      const start = i;
      while (i < src.length && src[i] !== "_" && src[i] !== "^") {
        i += 1;
      }
      const segment = src.slice(start, i);
      if (segment) {
        nodes.push(segment);
      }
    }
  }

  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return <>{nodes}</>;
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
    // Ingen brøk på top-nivå – vis inline med sub/sup
    return renderInline(trimmed);
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
        <span>{renderInline(left)}</span>
        <span>{` = `}</span>
        {renderExpr(right)}
      </span>
    );
  }

  return <span className={className}>{renderExpr(trimmed)}</span>;
}
