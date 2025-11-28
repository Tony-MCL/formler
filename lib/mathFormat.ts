// lib/mathFormat.ts
// Enkel formattering av inline-mattesymboler til penere Unicode-varianter.
// Brukes i dropdowns, etiketter osv. der vi ikke kjører full MathText.

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
  // Bokstaver vi bruker i indekser
  a: "ₐ",
  e: "ₑ",
  i: "ᵢ",   // ny – trengs for P_inn
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",   // ny – trengs for P_ut
  x: "ₓ"
};

function toSubscript(text: string): string {
  return text
    .split("")
    .map((ch) => SUBSCRIPT_MAP[ch] ?? ch)
    .join("");
}

/**
 * formatInlineMath("R_tot")  → "Rₜₒₜ"
 * formatInlineMath("n_s")    → "nₛ"
 * formatInlineMath("P_ut")   → "Pᵤₜ"
 * formatInlineMath("P_inn")  → "Pᵢₙₙ"
 *
 * Hvis symbolet ikke inneholder "_", returneres det uendret.
 */
export function formatInlineMath(symbol: string): string {
  if (!symbol.includes("_")) return symbol;

    // Vis '·' i stedet for '*'
  const pretty = symbol.replace(/\*/g, "·");

  const [base, sub] = symbol.split("_");
  if (!sub) {
    return base;
  }

  const subFormatted = toSubscript(sub);
  return `${base}${subFormatted}`;
}
