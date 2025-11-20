// lib/formulas.ts
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
    description:
      "Basisforhold for spenning, strøm, motstand, effekt, energi og tap.",
    order: 1
  },
  {
    id: "systems",
    title: "Systemer og nett",
    description:
      "Nett-typer, spenningsnivåer, spenningsfall og sammenhenger i trefasesystemer.",
    order: 2
  },
  {
    id: "machines",
    title: "Motorer og generatorer",
    description:
      "Synkronhastighet, slip, moment og virkningsgrad for roterende maskiner.",
    order: 3
  },
  {
    id: "shortcircuit",
    title: "Kortslutning og feilstrøm",
    description:
      "Enkle formler for beregning av kortslutnings- og feilstrømmer i henhold til NEK 400.",
    order: 4
  },
  {
    id: "protection",
    title: "Vern og selektivitet",
    description:
      "Dimensjonering av vern, automatisk utkobling, termisk bestandighet og enkel selektivitetskontroll.",
    order: 5
  },
  {
  id: "voltdrop",
  title: "Spenningsfall",
  description: 
    "Standardformler for spenningsfall i kabler etter NEK 400.",
  order:6
},

];

// Formler som skal være tilgjengelige i motoren, men IKKE vises som egne linjer i sidebaren
const HIDDEN_IN_SIDEBAR: FormulaId[] = [
  "three_phase_apparent",
  "three_phase_active"
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
  /* =======================================================================
   * GRUNNLEGGENDE ELKRAFT
   * ======================================================================= */
  {
    id: "ohm",
    categoryId: "core",
    name: "Ohms lov",
    shortName: "U = R · I",
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
    name: "Effekt",
    shortName: "P = U · I · cosφ",
    description:
      "Aktiv effekt i vekselstrømskrets (en- eller trefase) med faseforskyvning (cosφ).",
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
    tags: ["P, U, I, cosφ"],
    familyId: "active_power",
    modeLabel: "1-fase",
    isPrimaryInFamily: true
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
  },
  {
    id: "power_dc",
    categoryId: "core",
    name: "Effekt (likespenning)",
    shortName: "P = U · I (DC)",
    description: "Aktiv effekt i ren likestrømskrets.",
    baseExpression: "P = U * I",
    variables: [
      {
        id: "P",
        symbol: "P",
        name: "Effekt",
        unit: "W",
        role: "output",
        description: "Levert effekt i likestrømskretsen."
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
      }
    ],
    variants: [
      {
        id: "power_dc-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = U * I"
      },
      {
        id: "power_dc-U",
        label: "Løs for U",
        solveFor: "U",
        expression: "U = P / I"
      },
      {
        id: "power_dc-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = P / U"
      }
    ],
    tags: ["P, U, I, likespenning"]
  },
  {
    id: "series_resistors",
    categoryId: "core",
    name: "Seriekobling av motstander",
    shortName: "R_tot = R_1 + R_2",
    description: "Total motstand for to seriekoblede motstander.",
    baseExpression: "R_tot = R_1 + R_2",
    variables: [
      {
        id: "R_tot",
        symbol: "R_tot",
        name: "Total motstand",
        unit: "Ω",
        role: "output"
      },
      {
        id: "R_1",
        symbol: "R_1",
        name: "Motstand 1",
        unit: "Ω",
        role: "input"
      },
      {
        id: "R_2",
        symbol: "R_2",
        name: "Motstand 2",
        unit: "Ω",
        role: "input"
      }
    ],
    variants: [
      {
        id: "series_resistors-Rtot",
        label: "Løs for R_tot",
        solveFor: "R_tot",
        expression: "R_tot = R_1 + R_2"
      },
      {
        id: "series_resistors-R1",
        label: "Løs for R_1",
        solveFor: "R_1",
        expression: "R_1 = R_tot - R_2"
      },
      {
        id: "series_resistors-R2",
        label: "Løs for R_2",
        solveFor: "R_2",
        expression: "R_2 = R_tot - R_1"
      }
    ],
    tags: ["R_tot, R_1, R_2"]
  },
  {
    id: "ohmic_loss",
    categoryId: "core",
    name: "Effekttap i motstand",
    shortName: "P_tap = I² · R",
    description:
      "Effekttap (varmetap) i en motstand eller leder ved kjent strøm og motstand.",
    baseExpression: "P_tap = I * I * R",
    variables: [
      {
        id: "P_tap",
        symbol: "P_tap",
        name: "Effekttap",
        unit: "W",
        role: "output",
        description: "Tapt effekt (varme) i komponenten."
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input"
      },
      {
        id: "R",
        symbol: "R",
        name: "Motstand",
        unit: "Ω",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ohmic_loss-P_tap",
        label: "Løs for P_tap",
        solveFor: "P_tap",
        expression: "P_tap = I * I * R"
      },
      {
        id: "ohmic_loss-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = (P_tap / R) ** 0.5"
      },
      {
        id: "ohmic_loss-R",
        label: "Løs for R",
        solveFor: "R",
        expression: "R = P_tap / (I * I)"
      }
    ],
    tags: ["P_tap, I, R"]
  },
  {
    id: "charge",
    categoryId: "core",
    name: "Ladning",
    shortName: "Q = I · t",
    description: "Sammenheng mellom strøm, tid og elektrisk ladning.",
    baseExpression: "Q = I * t",
    variables: [
      {
        id: "Q",
        symbol: "Q",
        name: "Ladning",
        unit: "C",
        role: "output",
        description: "Elektrisk ladning (coulomb)."
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input"
      },
      {
        id: "t",
        symbol: "t",
        name: "Tid",
        unit: "s",
        role: "input"
      }
    ],
    variants: [
      {
        id: "charge-Q",
        label: "Løs for Q",
        solveFor: "Q",
        expression: "Q = I * t"
      },
      {
        id: "charge-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = Q / t"
      },
      {
        id: "charge-t",
        label: "Løs for t",
        solveFor: "t",
        expression: "t = Q / I"
      }
    ],
    tags: ["Q, I, t"]
  },
  {
    id: "cap_energy",
    categoryId: "core",
    name: "Energilagring i kondensator",
    shortName: "W_C = ½ · C · U²",
    description:
      "Energi lagret i en kondensator ved gitt kapasitans og spenning.",
    baseExpression: "W_C = 0.5 * C * U^2",
    variables: [
      {
        id: "W_C",
        symbol: "W_C",
        name: "Energi i kondensator",
        unit: "J",
        role: "output"
      },
      {
        id: "C",
        symbol: "C",
        name: "Kapasitans",
        unit: "F",
        role: "input"
      },
      {
        id: "U",
        symbol: "U",
        name: "Spenning",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "cap_energy-W_C",
        label: "Løs for W_C",
        solveFor: "W_C",
        expression: "W_C = 0.5 * C * U * U"
      },
      {
        id: "cap_energy-U",
        label: "Løs for U",
        solveFor: "U",
        expression: "U = (2 * W_C / C) ** 0.5"
      },
      {
        id: "cap_energy-C",
        label: "Løs for C",
        solveFor: "C",
        expression: "C = 2 * W_C / (U * U)"
      }
    ],
    tags: ["W_C, C, U"]
  },
  {
    id: "power_factor",
    categoryId: "core",
    name: "Effektfaktor",
    shortName: "cosφ = P / S",
    description:
      "Sammenhengen mellom aktiv effekt og tilsynelatende effekt i AC-systemer.",
    baseExpression: "cosφ = P / S",
    variables: [
      {
        id: "cosphi",
        symbol: "cosφ",
        name: "Effektfaktor",
        role: "output",
        description: "Forholdet P / S, mellom 0 og 1."
      },
      {
        id: "P",
        symbol: "P",
        name: "Aktiv effekt",
        unit: "W",
        role: "input"
      },
      {
        id: "S",
        symbol: "S",
        name: "Tilsynelatende effekt",
        unit: "VA",
        role: "input"
      }
    ],
    variants: [
      {
        id: "power_factor-cosphi",
        label: "Løs for cosφ",
        solveFor: "cosphi",
        expression: "cosphi = P / S"
      },
      {
        id: "power_factor-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = S * cosphi"
      },
      {
        id: "power_factor-S",
        label: "Løs for S",
        solveFor: "S",
        expression: "S = P / cosphi"
      }
    ],
    tags: ["cosφ, P, S"]
  },
  {
    id: "single_phase_apparent",
    categoryId: "core",
    name: "Tilsynelatende effekt",
    shortName: "S = U · I",
    description:
      "Tilsynelatende effekt basert på spenning og strøm (en- eller trefasesystem).",
    baseExpression: "S = U * I",
    variables: [
      {
        id: "S",
        symbol: "S",
        name: "Tilsynelatende effekt",
        unit: "VA",
        role: "output"
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
      }
    ],
    variants: [
      {
        id: "single_phase_apparent-S",
        label: "Løs for S",
        solveFor: "S",
        expression: "S = U * I"
      },
      {
        id: "single_phase_apparent-U",
        label: "Løs for U",
        solveFor: "U",
        expression: "U = S / I"
      },
      {
        id: "single_phase_apparent-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = S / U"
      }
    ],
    tags: ["S, U, I"],
    familyId: "apparent_power",
    modeLabel: "1-fase",
    isPrimaryInFamily: true
  },

  /* =======================================================================
   * SYSTEMER OG NETT
   * ======================================================================= */
  {
    id: "voltage_drop",
    categoryId: "systems",
    name: "Spennings­tap i ren motstand",
    shortName: "ΔU = I · R",
    description:
      "Enkel modell for spenningsfall over en ren motstand eller kabel med kjent resistans.",
    baseExpression: "ΔU = I * R",
    variables: [
      {
        id: "dU",
        symbol: "ΔU",
        name: "Spenningsfall",
        unit: "V",
        role: "output",
        description: "Forskjell mellom nominell og faktisk spenning."
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input"
      },
      {
        id: "R",
        symbol: "R",
        name: "Motstand",
        unit: "Ω",
        role: "input",
        description: "Total resistans i den aktuelle strekningen."
      }
    ],
    variants: [
      {
        id: "voltage_drop-dU",
        label: "Løs for ΔU",
        solveFor: "dU",
        expression: "dU = I * R"
      },
      {
        id: "voltage_drop-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = dU / R"
      },
      {
        id: "voltage_drop-R",
        label: "Løs for R",
        solveFor: "R",
        expression: "R = dU / I"
      }
    ],
    tags: ["ΔU, I, R"]
  },
  {
    id: "voltage_drop_percent",
    categoryId: "systems",
    name: "Spenningsfall i prosent",
    shortName: "ΔU_% = (ΔU / U_n) · 100",
    description: "Spenningsfall uttrykt i prosent av nominell spenning.",
    baseExpression: "ΔU_% = (ΔU / U_n) * 100",
    variables: [
      {
        id: "dU_percent",
        symbol: "ΔU_%",
        name: "Spenningsfall i prosent",
        unit: "%",
        role: "output"
      },
      {
        id: "dU",
        symbol: "ΔU",
        name: "Spenningsfall",
        unit: "V",
        role: "input"
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "Nominell spenning",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "voltage_drop_percent-dU_percent",
        label: "Løs for ΔU_%",
        solveFor: "dU_percent",
        expression: "dU_percent = (dU / U_n) * 100"
      },
      {
        id: "voltage_drop_percent-dU",
        label: "Løs for ΔU",
        solveFor: "dU",
        expression: "dU = dU_percent * U_n / 100"
      },
      {
        id: "voltage_drop_percent-U_n",
        label: "Løs for U_n",
        solveFor: "U_n",
        expression: "U_n = dU * 100 / dU_percent"
      }
    ],
    tags: ["ΔU, U_n, %"]
  },
  {
    id: "line_phase_voltage",
    categoryId: "systems",
    name: "Linje- og fasespenning (trefase)",
    shortName: "U_L = √3 · U_f",
    description:
      "Sammenheng mellom linjespenning og fasespenning i et symmetrisk trefasesystem.",
    baseExpression: "U_L = √3 · U_f",
    variables: [
      {
        id: "U_L",
        symbol: "U_L",
        name: "Linjespenning",
        unit: "V",
        role: "output"
      },
      {
        id: "U_f",
        symbol: "U_f",
        name: "Fasespenning",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "line_phase_voltage-U_L",
        label: "Løs for U_L",
        solveFor: "U_L",
        expression: "U_L = 1.732 * U_f"
      },
      {
        id: "line_phase_voltage-U_f",
        label: "Løs for U_f",
        solveFor: "U_f",
        expression: "U_f = U_L / 1.732"
      }
    ],
    tags: ["U_L, U_f, √3"]
  },
  {
    id: "three_phase_apparent",
    categoryId: "systems",
    name: "Trefase tilsynelatende effekt",
    shortName: "S = √3 · U_L · I_L",
    description:
      "Tilsynelatende effekt i et symmetrisk trefasesystem basert på linjespenning og linjestrøm.",
    baseExpression: "S = √3 · U_L · I_L",
    variables: [
      {
        id: "S",
        symbol: "S",
        name: "Tilsynelatende effekt",
        unit: "VA",
        role: "output",
        description: "Tilsynelatende effekt (VA) sett fra nettet."
      },
      {
        id: "U_L",
        symbol: "U_L",
        name: "Linjespenning",
        unit: "V",
        role: "input"
      },
      {
        id: "I_L",
        symbol: "I_L",
        name: "Linjestrøm",
        unit: "A",
        role: "input"
      }
    ],
    variants: [
      {
        id: "three_phase_apparent-S",
        label: "Løs for S",
        solveFor: "S",
        expression: "S = 1.732 * U_L * I_L"
      },
      {
        id: "three_phase_apparent-U_L",
        label: "Løs for U_L",
        solveFor: "U_L",
        expression: "U_L = S / (1.732 * I_L)"
      },
      {
        id: "three_phase_apparent-I_L",
        label: "Løs for I_L",
        solveFor: "I_L",
        expression: "I_L = S / (1.732 * U_L)"
      }
    ],
    tags: ["S, U_L, I_L"],
    familyId: "apparent_power",
    modeLabel: "3-fase"
  },
  {
    id: "three_phase_active",
    categoryId: "systems",
    name: "Trefase aktiv effekt",
    shortName: "P = √3 · U_L · I_L · cosφ",
    description:
      "Aktiv effekt i et symmetrisk trefasesystem basert på linjespenning, linjestrøm og effektfaktor.",
    baseExpression: "P = √3 · U_L · I_L · cosφ",
    variables: [
      {
        id: "P",
        symbol: "P",
        name: "Aktiv effekt",
        unit: "W",
        role: "output"
      },
      {
        id: "U_L",
        symbol: "U_L",
        name: "Linjespenning",
        unit: "V",
        role: "input"
      },
      {
        id: "I_L",
        symbol: "I_L",
        name: "Linjestrøm",
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
        id: "three_phase_active-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = 1.732 * U_L * I_L * cosphi"
      },
      {
        id: "three_phase_active-U_L",
        label: "Løs for U_L",
        solveFor: "U_L",
        expression: "U_L = P / (1.732 * I_L * cosphi)"
      },
      {
        id: "three_phase_active-I_L",
        label: "Løs for I_L",
        solveFor: "I_L",
        expression: "I_L = P / (1.732 * U_L * cosphi)"
      },
      {
        id: "three_phase_active-cosphi",
        label: "Løs for cosφ",
        solveFor: "cosphi",
        expression: "cosphi = P / (1.732 * U_L * I_L)"
      }
    ],
    tags: ["P, U_L, I_L, cosφ"],
    familyId: "active_power",
    modeLabel: "3-fase"
  },

  /* =======================================================================
   * MOTORER OG GENERATORER
   * ======================================================================= */
  {
    id: "sync_speed",
    categoryId: "machines",
    name: "Synkron hastighet",
    shortName: "n_s = 60 · f / p",
    description:
      "Synkron hastighet for roterende maskiner basert på frekvens og poltall.",
    baseExpression: "n_s = 60 * f / p",
    variables: [
      {
        id: "n_s",
        symbol: "n_s",
        name: "Synkron hastighet",
        unit: "rpm",
        role: "output",
        description: "Teoretisk synkron hastighet på akselen."
      },
      {
        id: "f",
        symbol: "f",
        name: "Frekvens",
        unit: "Hz",
        role: "input"
      },
      {
        id: "p",
        symbol: "p",
        name: "Poltall",
        role: "input",
        description: "Antall polpar i maskinen."
      }
    ],
    variants: [
      {
        id: "sync_speed-ns",
        label: "Løs for n_s",
        solveFor: "n_s",
        expression: "n_s = 60 * f / p"
      },
      {
        id: "sync_speed-f",
        label: "Løs for f",
        solveFor: "f",
        expression: "f = n_s * p / 60"
      },
      {
        id: "sync_speed-p",
        label: "Løs for p",
        solveFor: "p",
        expression: "p = 60 * f / n_s"
      }
    ],
    tags: ["n_s, f, p"]
  },
  {
    id: "torque_from_power",
    categoryId: "machines",
    name: "Moment fra effekt og turtall",
    shortName: "M = 9550 · P / n",
    description:
      "Sammenheng mellom akselmoment, effekt og turtall for roterende maskiner.",
    baseExpression: "M = 9550 * P / n",
    variables: [
      {
        id: "M",
        symbol: "M",
        name: "Moment",
        unit: "Nm",
        role: "output"
      },
      {
        id: "P",
        symbol: "P",
        name: "Mekanisk effekt",
        unit: "kW",
        role: "input"
      },
      {
        id: "n",
        symbol: "n",
        name: "Turtall",
        unit: "rpm",
        role: "input"
      }
    ],
    variants: [
      {
        id: "torque_from_power-M",
        label: "Løs for M",
        solveFor: "M",
        expression: "M = 9550 * P / n"
      },
      {
        id: "torque_from_power-P",
        label: "Løs for P",
        solveFor: "P",
        expression: "P = M * n / 9550"
      },
      {
        id: "torque_from_power-n",
        label: "Løs for n",
        solveFor: "n",
        expression: "n = 9550 * P / M"
      }
    ],
    tags: ["M, P, n, moment, turtall"]
  },
  {
    id: "efficiency",
    categoryId: "machines",
    name: "Virkningsgrad",
    shortName: "η = P_ut / P_inn",
    description: "Sammenheng mellom inn- og uteffekt i maskiner og systemer.",
    baseExpression: "η = P_ut / P_inn",
    variables: [
      {
        id: "eta",
        symbol: "η",
        name: "Virkningsgrad",
        role: "output",
        description: "Forholdet mellom uteffekt og inneffekt (0–1)."
      },
      {
        id: "P_ut",
        symbol: "P_ut",
        name: "Uteffekt",
        unit: "W",
        role: "input"
      },
      {
        id: "P_inn",
        symbol: "P_inn",
        name: "Inneffekt",
        unit: "W",
        role: "input"
      }
    ],
    variants: [
      {
        id: "efficiency-eta",
        label: "Løs for η",
        solveFor: "eta",
        expression: "eta = P_ut / P_inn"
      },
      {
        id: "efficiency-P_ut",
        label: "Løs for P_ut",
        solveFor: "P_ut",
        expression: "P_ut = eta * P_inn"
      },
      {
        id: "efficiency-P_inn",
        label: "Løs for P_inn",
        solveFor: "P_inn",
        expression: "P_inn = P_ut / eta"
      }
    ],
    tags: ["η, P_ut, P_inn"]
  },
  {
    id: "slip",
    categoryId: "machines",
    name: "Slip",
    shortName: "s = (n_s − n) / n_s",
    description:
      "Relativ slip for asynkrone maskiner basert på synkron og faktisk hastighet.",
    baseExpression: "s = (n_s - n) / n_s",
    variables: [
      {
        id: "s",
        symbol: "s",
        name: "Slip",
        role: "output",
        description: "Relativ slip (0–1)."
      },
      {
        id: "n_s",
        symbol: "n_s",
        name: "Synkron hastighet",
        unit: "rpm",
        role: "input"
      },
      {
        id: "n",
        symbol: "n",
        name: "Målt hastighet",
        unit: "rpm",
        role: "input"
      }
    ],
    variants: [
      {
        id: "slip-s",
        label: "Løs for s",
        solveFor: "s",
        expression: "s = (n_s - n) / n_s"
      },
      {
        id: "slip-n_s",
        label: "Løs for n_s",
        solveFor: "n_s",
        expression: "n_s = n / (1 - s)"
      },
      {
        id: "slip-n",
        label: "Løs for n",
        solveFor: "n",
        expression: "n = n_s * (1 - s)"
      }
    ],
    tags: ["s, n_s, n"]
  },
  {
    id: "motor_start_current_ratio",
    categoryId: "machines",
    name: "Startstrøm fra merkestrøm",
    shortName: "I_start = k_start · I_n",
    description:
      "Forholdet mellom startstrøm og merkestrøm for en motor. Nyttig når datablad oppgir I_start som multippel av I_n.",
    baseExpression: "I_start = k_start · I_n",
    variables: [
      {
        id: "I_start",
        symbol: "I_start",
        name: "Startstrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "I_n",
        symbol: "I_n",
        name: "Merkestrøm motor",
        unit: "A",
        role: "input"
      },
      {
        id: "k_start",
        symbol: "k_start",
        name: "Startstrømsfaktor",
        unit: "–",
        role: "input",
        description:
          "Typisk 4–8 for direkte start, lavere for mykstarter/frekvensomformer."
      }
    ],
    variants: [
      {
        id: "motor_start_current_ratio-Istart",
        label: "Løs for I_start",
        solveFor: "I_start",
        expression: "I_start = k_start * I_n"
      },
      {
        id: "motor_start_current_ratio-In",
        label: "Løs for I_n",
        solveFor: "I_n",
        expression: "I_n = I_start / k_start"
      },
      {
        id: "motor_start_current_ratio-kstart",
        label: "Løs for k_start",
        solveFor: "k_start",
        expression: "k_start = I_start / I_n"
      }
    ],
    tags: ["motorstart", "I_start, I_n, k_start"]
  },
  {
    id: "motor_start_voltage_dip",
    categoryId: "machines",
    name: "Spenningsfall ved motorstart (fra I_k)",
    shortName: "ΔU_% ≈ (I_start / I_k3) · 100",
    description:
      "Tilnærmet spenningsfall ved motorstart basert på forholdet mellom startstrøm og trefase kortslutningsstrøm i tilknytningspunktet.",
    baseExpression: "ΔU_% = (I_start / I_k3) · 100",
    variables: [
      {
        id: "dU_percent",
        symbol: "ΔU_%",
        name: "Spenningsfall i prosent",
        unit: "%",
        role: "output"
      },
      {
        id: "I_start",
        symbol: "I_start",
        name: "Startstrøm motor",
        unit: "A",
        role: "input"
      },
      {
        id: "I_k3",
        symbol: "I_k3",
        name: "Trefase kortslutningsstrøm i punktet",
        unit: "A",
        role: "input"
      }
    ],
    variants: [
      {
        id: "motor_start_voltage_dip-dU_percent",
        label: "Løs for ΔU_%",
        solveFor: "dU_percent",
        expression: "dU_percent = (I_start / I_k3) * 100"
      },
      {
        id: "motor_start_voltage_dip-Istart",
        label: "Løs for I_start",
        solveFor: "I_start",
        expression: "I_start = dU_percent * I_k3 / 100"
      },
      {
        id: "motor_start_voltage_dip-Ik3",
        label: "Løs for I_k3",
        solveFor: "I_k3",
        expression: "I_k3 = I_start * 100 / dU_percent"
      }
    ],
    tags: ["motorstart", "spenningsfall", "I_start, I_k3, ΔU"]
  },
  /* =======================================================================
   * KORTSLUTNING OG FEILSTRØM
   * (enkle NEK 400-nære uttrykk – c_min/c_max brukes som faktorer)
   * ======================================================================= */
  {
    id: "ik3_tn",
    categoryId: "shortcircuit",
    name: "Trefase kortslutningsstrøm – TN",
    shortName: "I_k3 = c_min · U_n / (√3 · Z_s)",
    description:
      "Tilnærmet trefase kortslutningsstrøm i et TN-system basert på spenningsnivå, sløyfeimpedans og korrektionsfaktor c_min.",
    baseExpression: "I_k3 = c_min · U_n / (√3 · Z_s)",
    variables: [
      {
        id: "I_k3",
        symbol: "I_k3",
        name: "Trefase kortslutningsstrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "c_min",
        symbol: "c_min",
        name: "Korreksjonsfaktor (min)",
        unit: "–",
        role: "input",
        description:
          "F.eks. 0,95–1,0 avhengig av spenningsvariasjoner og toleranser."
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "Merkespenning",
        unit: "V",
        role: "input"
      },
      {
        id: "Z_s",
        symbol: "Z_s",
        name: "Sløyfeimpedans",
        unit: "Ω",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ik3_tn-Ik3",
        label: "Løs for I_k3",
        solveFor: "I_k3",
        expression: "I_k3 = c_min * U_n / (1.732 * Z_s)"
      },
      {
        id: "ik3_tn-Zs",
        label: "Løs for Z_s",
        solveFor: "Z_s",
        expression: "Z_s = c_min * U_n / (1.732 * I_k3)"
      },
      {
        id: "ik3_tn-Un",
        label: "Løs for U_n",
        solveFor: "U_n",
        expression: "U_n = I_k3 * 1.732 * Z_s / c_min"
      },
      {
        id: "ik3_tn-cmin",
        label: "Løs for c_min",
        solveFor: "c_min",
        expression: "c_min = I_k3 * 1.732 * Z_s / U_n"
      }
    ],
    tags: ["I_k3, U_n, Z_s, c_min", "kortslutning", "TN"]
  },
  {
    id: "ik1_phase_fault",
    categoryId: "shortcircuit",
    name: "1-fase jordfeilstrøm (enkel modell)",
    shortName: "I_f = c_min · U_0 / Z_s",
    description:
      "Forenklet beregning av 1-fase jordfeilstrøm basert på fasespenning mot jord og sløyfeimpedans.",
    baseExpression: "I_f = c_min · U_0 / Z_s",
    variables: [
      {
        id: "I_f",
        symbol: "I_f",
        name: "Jordfeilstrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "c_min",
        symbol: "c_min",
        name: "Korreksjonsfaktor (min)",
        unit: "–",
        role: "input"
      },
      {
        id: "U_0",
        symbol: "U_0",
        name: "Fasespenning mot jord",
        unit: "V",
        role: "input"
      },
      {
        id: "Z_s",
        symbol: "Z_s",
        name: "Sløyfeimpedans",
        unit: "Ω",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ik1_phase_fault-If",
        label: "Løs for I_f",
        solveFor: "I_f",
        expression: "I_f = c_min * U_0 / Z_s"
      },
      {
        id: "ik1_phase_fault-Zs",
        label: "Løs for Z_s",
        solveFor: "Z_s",
        expression: "Z_s = c_min * U_0 / I_f"
      },
      {
        id: "ik1_phase_fault-U0",
        label: "Løs for U_0",
        solveFor: "U_0",
        expression: "U_0 = I_f * Z_s / c_min"
      },
      {
        id: "ik1_phase_fault-cmin",
        label: "Løs for c_min",
        solveFor: "c_min",
        expression: "c_min = I_f * Z_s / U_0"
      }
    ],
    tags: ["I_f, U_0, Z_s, c_min", "jordfeil", "kortslutning"]
  },
  {
    id: "ik3_max_source",
    categoryId: "shortcircuit",
    name: "Maksimal trefase kortslutningsstrøm",
    shortName: "I_k3,max = c_max · S_k / (√3 · U_n)",
    description:
      "Enkel sammenheng mellom nettets kortslutningsytelse S_k og maksimal trefase kortslutningsstrøm i tilknytningspunktet.",
    baseExpression: "I_k3,max = c_max · S_k / (√3 · U_n)",
    variables: [
      {
        id: "I_k3_max",
        symbol: "I_k3,max",
        name: "Maks trefase kortslutningsstrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "c_max",
        symbol: "c_max",
        name: "Korreksjonsfaktor (max)",
        unit: "–",
        role: "input",
        description: "F.eks. 1,05–1,1 ved høy spenning og gunstige toleranser."
      },
      {
        id: "S_k",
        symbol: "S_k",
        name: "Kortslutningsytelse",
        unit: "VA",
        role: "input"
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "Merkespenning",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ik3_max_source-Ik3max",
        label: "Løs for I_k3,max",
        solveFor: "I_k3_max",
        expression: "I_k3_max = c_max * S_k / (1.732 * U_n)"
      },
      {
        id: "ik3_max_source-Sk",
        label: "Løs for S_k",
        solveFor: "S_k",
        expression: "S_k = I_k3_max * 1.732 * U_n / c_max"
      },
      {
        id: "ik3_max_source-Un",
        label: "Løs for U_n",
        solveFor: "U_n",
        expression: "U_n = c_max * S_k / (1.732 * I_k3_max)"
      },
      {
        id: "ik3_max_source-cmax",
        label: "Løs for c_max",
        solveFor: "c_max",
        expression: "c_max = I_k3_max * 1.732 * U_n / S_k"
      }
    ],
    tags: ["I_k3,max, S_k, U_n, c_max", "kortslutningsytelse"]
  },

  /* =======================================================================
   * VERN OG SELEKTIVITET
   * ======================================================================= */
  {
    id: "max_loop_impedance_tn",
    categoryId: "protection",
    name: "Maks sløyfeimpedans – TN",
    shortName: "Z_s,max = U_0 / I_a",
    description:
      "Maksimal sløyfeimpedans for automatisk utkobling i TN-systemer. Brukes til å kontrollere at vernet løser ut innenfor kravene i NEK 400.",
    baseExpression: "Z_s,max = U_0 / I_a",
    variables: [
      {
        id: "Z_s_max",
        symbol: "Z_s,max",
        name: "Maks sløyfeimpedans",
        unit: "Ω",
        role: "output",
        description: "Største tillatte Z_s for valgt vern og utkoblingstid."
      },
      {
        id: "U_0",
        symbol: "U_0",
        name: "Fasespenning mot jord",
        unit: "V",
        role: "input"
      },
      {
        id: "I_a",
        symbol: "I_a",
        name: "Utløserstrøm for vern",
        unit: "A",
        role: "input",
        description:
          "Strømmen som sikrer at vernet kobler ut innenfor tillatt tid (I_a fra fabrikant/kurve)."
      }
    ],
    variants: [
      {
        id: "max_loop_impedance_tn-Zsmax",
        label: "Løs for Z_s,max",
        solveFor: "Z_s_max",
        expression: "Z_s_max = U_0 / I_a"
      },
      {
        id: "max_loop_impedance_tn-Ia",
        label: "Løs for I_a",
        solveFor: "I_a",
        expression: "I_a = U_0 / Z_s_max"
      },
      {
        id: "max_loop_impedance_tn-U0",
        label: "Løs for U_0",
        solveFor: "U_0",
        expression: "U_0 = Z_s_max * I_a"
      }
    ],
    tags: ["Z_s,max, U_0, I_a", "automatisk utkobling", "TN"]
  },
  {
    id: "i2t_energy",
    categoryId: "protection",
    name: "I²t – energi fra kortslutning",
    shortName: "I²t = I_k² · t",
    description:
      "Energi fra en kortslutning basert på feilstrøm og varighet. Brukes mot kablers og verns termiske tåleevne.",
    baseExpression: "I²t = I_k² · t",
    variables: [
      {
        id: "I2t",
        symbol: "I²t",
        name: "Energiintegral",
        unit: "A²s",
        role: "output",
        description: "I²t-verdi som sammenlignes mot vern/kabel-data."
      },
      {
        id: "I_k",
        symbol: "I_k",
        name: "Kortslutningsstrøm",
        unit: "A",
        role: "input"
      },
      {
        id: "t",
        symbol: "t",
        name: "Varighet",
        unit: "s",
        role: "input"
      }
    ],
    variants: [
      {
        id: "i2t_energy-I2t",
        label: "Løs for I²t",
        solveFor: "I2t",
        expression: "I2t = I_k * I_k * t"
      },
      {
        id: "i2t_energy-Ik",
        label: "Løs for I_k",
        solveFor: "I_k",
        expression: "I_k = (I2t / t) ** 0.5"
      },
      {
        id: "i2t_energy-t",
        label: "Løs for t",
        solveFor: "t",
        expression: "t = I2t / (I_k * I_k)"
      }
    ],
    tags: ["I²t, I_k, t", "energi", "vern", "kabel"]
  },
  {
    id: "thermal_withstand_cable",
    categoryId: "protection",
    name: "Termisk kortslutningsbestandighet (k²·S² = I²·t)",
    shortName: "k² · S² = I_k² · t",
    description:
      "Kontroll av at lederen tåler kortslutningen termisk i henhold til k²·S² ≥ I²·t.",
    baseExpression: "k² · S² = I_k² · t",
    variables: [
      {
        id: "k",
        symbol: "k",
        name: "Materialkonstant",
        unit: "√(A²s)/mm²",
        role: "input",
        description:
          "Avhengig av ledermateriale og isolasjon (f.eks. CU/PEX, CU/PVC)."
      },
      {
        id: "S",
        symbol: "S",
        name: "Leder-tverrsnitt",
        unit: "mm²",
        role: "output"
      },
      {
        id: "I_k",
        symbol: "I_k",
        name: "Kortslutningsstrøm",
        unit: "A",
        role: "input"
      },
      {
        id: "t",
        symbol: "t",
        name: "Kortslutningsvarighet",
        unit: "s",
        role: "input"
      }
    ],
    variants: [
      {
        id: "thermal_withstand_cable-S",
        label: "Løs for S (minste tverrsnitt)",
        solveFor: "S",
        expression: "S = (I_k * (t ** 0.5)) / k"
      },
      {
        id: "thermal_withstand_cable-Ik",
        label: "Løs for I_k (maks tillatt)",
        solveFor: "I_k",
        expression: "I_k = k * S / (t ** 0.5)"
      },
      {
        id: "thermal_withstand_cable-t",
        label: "Løs for t (maks varighet)",
        solveFor: "t",
        expression: "t = (k * k * S * S) / (I_k * I_k)"
      }
    ],
    tags: ["k, S, I_k, t", "termisk", "kortslutning", "kabel"]
  },
  {
    id: "cable_rating_min",
    categoryId: "protection",
    name: "Min. kabelstrømføringsevne for vern",
    shortName: "I_z ≥ k · I_n",
    description:
      "Sammenheng mellom vernets merkestrøm og nødvendig strømføringsevne til kabelen. k kan settes til f.eks. 1,0–1,45 avhengig av type vern og metode.",
    baseExpression: "I_z = k_dim · I_n",
    variables: [
      {
        id: "I_z",
        symbol: "I_z",
        name: "Strømføringsevne kabel",
        unit: "A",
        role: "output"
      },
      {
        id: "I_n",
        symbol: "I_n",
        name: "Vernets merkestrøm",
        unit: "A",
        role: "input"
      },
      {
        id: "k_dim",
        symbol: "k",
        name: "Dimensjoneringsfaktor",
        unit: "–",
        role: "input",
        description:
          "F.eks. 1,0–1,45 avhengig av verntype, kabling og forlegningsmåte."
      }
    ],
    variants: [
      {
        id: "cable_rating_min-Iz",
        label: "Løs for I_z (min kabel)",
        solveFor: "I_z",
        expression: "I_z = k_dim * I_n"
      },
      {
        id: "cable_rating_min-In",
        label: "Løs for I_n (maks vern)",
        solveFor: "I_n",
        expression: "I_n = I_z / k_dim"
      },
      {
        id: "cable_rating_min-kdim",
        label: "Løs for k",
        solveFor: "k_dim",
        expression: "k_dim = I_z / I_n"
      }
    ],
    tags: ["I_z, I_n, k", "vern", "kabel", "dimensjonering"]
  },
  {
    id: "selectivity_factor",
    categoryId: "protection",
    name: "Selektivitetsfaktor mellom to vern",
    shortName: "k_sel = I_2 / I_1",
    description:
      "Enkel selektivitetskontroll mellom to vern basert på forholdet mellom strømnivåer oppstrøms og nedstrøms.",
    baseExpression: "k_sel = I_2 / I_1",
    variables: [
      {
        id: "k_sel",
        symbol: "k_sel",
        name: "Selektivitetsfaktor",
        unit: "–",
        role: "output",
        description:
          "Forholdet I_2 / I_1. Kan sammenlignes mot anbefalt grense (for eksempel ≥ 1,3)."
      },
      {
        id: "I_1",
        symbol: "I_1",
        name: "Nedstrøms vern-nivå",
        unit: "A",
        role: "input",
        description: "Strøm der nedstrøms vern forventes å løse ut."
      },
      {
        id: "I_2",
        symbol: "I_2",
        name: "Oppstrøms vern-nivå",
        unit: "A",
        role: "input",
        description: "Strøm der oppstrøms vern forventes å løse ut."
      }
    ],
    variants: [
      {
        id: "selectivity_factor-ksel",
        label: "Løs for k_sel",
        solveFor: "k_sel",
        expression: "k_sel = I_2 / I_1"
      },
      {
        id: "selectivity_factor-I2",
        label: "Løs for I_2 (krav til oppstrøms vern)",
        solveFor: "I_2",
        expression: "I_2 = k_sel * I_1"
      },
      {
        id: "selectivity_factor-I1",
        label: "Løs for I_1 (nedstrøms nivå)",
        solveFor: "I_1",
        expression: "I_1 = I_2 / k_sel"
      }
    ],
    tags: ["selektivitet", "I_1, I_2, k_sel", "vern"]
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
      formulas: formulas.filter(
        (f) =>
          f.categoryId === category.id &&
          !HIDDEN_IN_SIDEBAR.includes(f.id as FormulaId)
      )
    }))
    .filter((group) => group.formulas.length > 0);
}

/**
 * Enkel oppslagshjelper – nyttig senere for formelvisning/kalkulatorer.
 */
export function getFormulaById(id: FormulaId): Formula | undefined {
  return formulas.find((f) => f.id === id);
}
