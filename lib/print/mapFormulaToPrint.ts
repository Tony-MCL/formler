// /lib/print/mapFormulaToPrint.ts

import type { PrintData, PrintSection } from "./types";
import { getFormulaById, getFormulasGroupedByCategory } from "../formulas";
import type { FormulaId } from "../types";

/**
 * Foreløpig enkel adapter:
 *  - Tittel, beskrivelse
 *  - Kategori (hvis tilgjengelig via gruppe)
 *  - Variabel-tabell
 */
export function mapFormulaToPrint(formulaId: FormulaId): PrintData {
  const formula = getFormulaById(formulaId);

  if (!formula) {
    return {
      title: "Ukjent formel",
      sections: []
    };
  }

  const f: any = formula; // NOTE: løses senere med strengere typer

  // Finn kategori-navn via eksisterende grupper
  let categoryName: string | undefined;
  const groups = getFormulasGroupedByCategory();
  for (const g of groups) {
    if (g.formulas.some((x) => x.id === f.id)) {
      categoryName = g.category.title;
      break;
    }
  }

  const sections: PrintSection[] = [];

  if (f.baseExpression) {
    sections.push({
      id: "expression",
      title: "Grunnuttrykk",
      content: [
        {
          type: "paragraph",
          text: String(f.baseExpression)
        }
      ]
    });
  }

  if (Array.isArray(f.variables) && f.variables.length > 0) {
    sections.push({
      id: "variables",
      title: "Variabler",
      content: [
        {
          type: "table",
          headers: ["Symbol", "Navn", "Enhet"],
          rows: f.variables.map((v: any) => [
            v.symbol ?? "",
            v.name ?? "",
            v.unit ?? ""
          ])
        }
      ]
    });
  }

  const meta = [
    ...(categoryName ? [{ label: "Kategori", value: categoryName }] : []),
    { label: "Formel-ID", value: String(f.id) }
  ];

  return {
    title: f.name ?? String(f.id),
    subtitle: f.description ?? undefined,
    meta,
    sections
  };
}
