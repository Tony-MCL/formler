// /lib/mathFormat.ts

// Unicode-subscript-map (brukes for f.eks. R_tot, R_1, n_s)
const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "n": "ₙ",
  "s": "ₛ",
  "p": "ₚ",
  "t": "ₜ",
  "o": "ₒ",
  "x": "ₓ"
};

// Unicode-superscript-map (I^2, U^2 osv.)
const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "n": "ⁿ"
};

function applySubscripts(text: string): string {
  // Fanger f.eks. R_tot, R_1, n_s
  return text.replace(/([A-Za-z])_([A-Za-z0-9]+)/g, (_, base: string, sub: string) => {
    let converted = "";
    for (const ch of sub) {
      converted += SUBSCRIPT_MAP[ch] ?? ch;
    }
    return base + converted;
  });
}

function applySuperscripts(text: string): string {
  // Fanger f.eks. U^2, I^2R
  return text.replace(/\^([0-9+\-n]+)/g, (_, exp: string) => {
    let converted = "";
    for (const ch of exp) {
      converted += SUPERSCRIPT_MAP[ch] ?? ch;
    }
    return converted ? converted : exp;
  });
}

/**
 * Formatterer en enkel matte-streng til "pen tekst":
 *  - * → ·
 *  - cosphi → cos φ
 *  - phi → φ
 *  - dU → ΔU
 *  - R_tot, R_1, n_s → med senket skrift via Unicode
 *  - U^2, I^2 → opphøyd via Unicode
 *
 * Denne brukes både i MathText og i rene tekst-kontekster (select, labels, osv.).
 */
export function formatInlineMath(text: string): string {
  let pretty = text;

  // Multiplikasjonstegn
  pretty = pretty.replace(/\s*\*\s*/g, " · ");

  // cosphi / phi
  pretty = pretty.replace(/cosphi/g, "cos φ");
  pretty = pretty.replace(/\bphi\b/g, "φ");

  // dU → ΔU (spenningsfall)
  pretty = pretty.replace(/\bdU\b/g, "ΔU");

  // Sub- og superscript
  pretty = applySubscripts(pretty);
  pretty = applySuperscripts(pretty);

  return pretty;
}
