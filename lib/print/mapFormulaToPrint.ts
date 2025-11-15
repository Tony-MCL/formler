// /lib/print/mapFormulaToPrint.ts

import type { PrintData } from "./types";
import type { FormulaId } from "../types";
import { getFormulaById } from "../formulas";

// Merk: Dette er en "ren" adapter fra Formelsamling-domenet til PrintEngine.
// Foreløpig bruker vi kun selve formeldataene (ikke kalkulator-state).

export function mapFormulaToPrint(formulaId: FormulaId): PrintData {
  const formula = getFormulaById(formulaId);

  if (!formula) {
    return {
      title: "Formel ikke funnet",
      subtitle: `ID: ${formulaId}`,
      sections: [
        {
          id: "not-found",
          title: "Feil",
          content: [
            {
              type: "paragraph",
              text: "Formelen ble ikke funnet. Kontroller at ID-en er korrekt."
            }
          ]
        }
      ]
    };
  }

  const sections = [];

  // 1) Grunnuttrykk
  sections.push({
    id: "expression",
    title: "Grunnuttrykk",
    content: [
      {
        type: "paragraph",
        // Her antar vi at baseExpression er LaTeX / "pen tekst".
        // PrintLayout rendrer dette som ren tekst – senere kan vi evt. koble på KaTeX.
        text: formula.baseExpression
      }
    ]
  });

  // 2) Variabler (som nøkkel/verdi-liste)
  if (Array.isArray(formula.variables) && formula.variables.length > 0) {
    sections.push({
      id: "variables",
      title: "Symboler og størrelser",
      content: [
        {
          type: "keyValueList",
          items: formula.variables.map((v: any) => {
            const unit = v.unit ? ` [${v.unit}]` : "";
            const desc = v.description ? ` – ${v.description}` : "";
            return {
              key: v.symbol ?? v.id,
              value: `${v.name ?? ""}${unit}${desc}`.trim()
            };
          }),
          columns: 1
        }
      ]
    });
  }

  // 3) Varianter (løs for …)
  if (Array.isArray(formula.variants) && formula.variants.length > 0) {
    sections.push({
      id: "variants",
      title: "Varianter (løs for …)",
      content: [
        {
          type: "keyValueList",
          items: formula.variants.map((variant: any) => ({
            key: variant.label ?? variant.id,
            value: variant.expression ?? ""
          })),
          columns: 1
        }
      ]
    });
  }

  return {
    title: formula.name,
    subtitle: formula.description || undefined,
    sections
  };
}
