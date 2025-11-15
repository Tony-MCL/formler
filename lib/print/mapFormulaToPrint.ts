// /lib/print/mapFormulaToPrint.ts

import type { PrintData, PrintSection, PrintContentBlock } from "./types";

/**
 * Minimal "bridge"-typer slik at adapteren kan brukes uavhengig av
 * den faktiske Formelsamling-implementasjonen.
 * Når du vil koble den ordentlig mot appen, kan du bytte disse
 * til dine egne typer (eller importere Formula direkte).
 */
export type FormulaLike = {
  id: string;
  name: string;
  description?: string;
  categoryName?: string;
  baseExpression: string;
};

export type CalcValue = {
  label: string;
  displayValue: string;
};

export type CalcState = {
  values: CalcValue[];
};

export function mapFormulaToPrint(
  formula: FormulaLike,
  calcState: CalcState
): PrintData {
  const expressionSection: PrintSection = {
    id: "expression",
    title: "Grunnuttrykk",
    content: [
      {
        type: "paragraph",
        text: formula.baseExpression
      } as PrintContentBlock
    ]
  };

  const valuesSection: PrintSection = {
    id: "values",
    title: "Verdier",
    content: [
      {
        type: "keyValueList",
        items: calcState.values.map((v) => ({
          key: v.label,
          value: v.displayValue
        })),
        columns: 1
      } as PrintContentBlock
    ]
  };

  const sections: PrintSection[] = [expressionSection, valuesSection];

  const meta = [
    ...(formula.categoryName
      ? [{ label: "Kategori", value: formula.categoryName }]
      : []),
    { label: "Formel ID", value: formula.id }
  ];

  return {
    title: formula.name,
    subtitle: formula.description,
    meta,
    sections
  };
}
