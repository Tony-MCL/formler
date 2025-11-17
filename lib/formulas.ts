import type {
  Formula,
  FormulaCategory,
  FormulaCategoryId,
  FormulaId
} from "./types";

export const formulaCategories: FormulaCategory[] = [
  {
    id: "core",
    title: "Grunnleggende elkraft",
    description: "Basisforhold for spenning, strøm, motstand, effekt og energi.",
    order: 1
  },
  {
    id: "systems",
    title: "Systemer og nett",
    description: "Nett-typer, spenningsnivåer og kortslutningsberegninger.",
    order: 2
  },
  {
    id: "machines",
    title: "Motorer og generatorer",
    description: "Enkle sammenhenger for roterende maskiner.",
    order: 3
  }
];

/**
 * Enkel, tekstbasert formelsyntaks (stil B), f.eks.:
 * - "U = R * I"
 * - "P = U * I * cosphi"
 * - "E = P * t"
 *
 * Motoren vil senere tolke symbolene og gjøre pen visning + beregning.
 */
export const formulas: Formula[] = [
  {
    id: "ohm",
    categoryId: "core",
    name: "Ohms lov",
    shortName: "Ohm",
    description: "Sammenhengen mellom spenning, strøm og motstand i en leder.",
    baseExpression: "U = R * I",
    variables: [
      {
        id: "U",
        symbol: "U",
        name: "Spenning",
        unit: "V",
        role: "output",
        description: "Elektrisk spenning over komponenten."
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input",
        description: "Strøm gjennom komponenten."
      },
      {
        id: "R",
        symbol: "R",
        name: "Motstand",
        unit: "Ω",
        role: "input",
        description: "Elektrisk motstand i kretsen."
      }
    ],
    variants: [
      {
        id: "ohm-U",
        label: "Løs for U",
        solveFor: "U",
        expression: "U = R * I"
      },
      {
        id: "ohm-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = U / R"
      },
      {
        id: "ohm-R",
        label: "Løs for R",
        solveFor: "R",
        expression: "R = U / I"
      }
    ],
    tags: ["U, I, R"]
  },
  {
    id: "power",
    categoryId: "core",
    name: "Effekt (enfaset)",
    shortName: "P = U · I · cosφ",
    description:
      "Aktiv effekt i enfaset vekselstrømskrets med faseforskyvning (cosφ).",
    baseExpression: "P = U * I * cosphi",
    variables: [
      {
        id: "P",
        symbol: "P",
        name: "Effekt",
        unit: "W",
        role: "output",
        description: "Levert aktiv effekt."
      },
      {
        id: "U",
        symbol: "U",
        name: "Spenning",
        unit: "V",
        role: "input"
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input"
      },
      {
        id: "cosphi",
        symbol: "cosφ",
        name: "Effektfaktor",
        role: "input",
        description: "cosφ, mellom 0 og 1."
      }
    ],
    variants: [
      {
        id: "power-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = U * I * cosphi"
      },
      {
        id: "power-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = P / (U * cosphi)"
      },
      {
        id: "power-U",
        label: "Løs for U",
        solveFor: "U",
        expression: "U = P / (I * cosphi)"
      }
    ],
    tags: ["P, U, I, cosφ"]
  },
  {
    id: "energy",
    categoryId: "core",
    name: "Energi",
    shortName: "E = P · t",
    description:
      "Sammenheng mellom effekt, tid og energi. Typisk brukt i kWh-beregninger.",
    baseExpression: "E = P * t",
    variables: [
      {
        id: "E",
        symbol: "E",
        name: "Energi",
        unit: "Wh",
        role: "output",
        description: "Forbrukt eller levert energi."
      },
      {
        id: "P",
        symbol: "P",
        name: "Effekt",
        unit: "W",
        role: "input"
      },
      {
        id: "t",
        symbol: "t",
        name: "Tid",
        unit: "h",
        role: "input"
      }
    ],
    variants: [
      {
        id: "energy-E",
        label: "Løs for E",
        solveFor: "E",
        expression: "E = P * t"
      },
      {
        id: "energy-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = E / t"
      },
      {
        id: "energy-t",
        label: "Løs for t",
        solveFor: "t",
        expression: "t = E / P"
      }
    ],
    tags: ["E, P, t"]
  }
];

/**
 * Hjelper til visning: grupper formler etter kategori, sortert pr. order.
 * Brukes bl.a. i Sidebar.
 */
export function getFormulasGroupedByCategory(): {
  category: FormulaCategory;
  formulas: Formula[];
}[] {
  return formulaCategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      formulas: formulas.filter((f) => f.categoryId === category.id)
    }))
    .filter((group) => group.formulas.length > 0);
}

/**
 * Enkel oppslagshjelper – nyttig senere for formelvisning/kalkulatorer.
 */
export function getFormulaById(id: FormulaId): Formula | undefined {
  return formulas.find((f) => f.id === id);
}
