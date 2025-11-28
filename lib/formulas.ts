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
{
  id: "motorstart",
  title: "Motorstart",
  description:
    "Formler for startstrøm, spenningsfall ved start, Y/D start, mykstarter og frekvensomformer.",
  order: 7
},
{
  id: "power_quality",
  title: "Spenningskvalitet",
  description:
    "Formler knyttet til spenningsavvik, spenningsubalanse og harmonisk forvrengning (THD).",
  order: 8
},
{
  id: "cables",
  title: "Kabler og korreksjonsfaktorer",
  description: "Korreksjonsfaktorer og strømføringsevne i henhold til NEK 400.",
  order: 9
},
{
  id: "earthing",
  title: "Jording og beskyttelsesleder",
  description: "Sløyfeimpedans, berøringsspenning og dimensjonering av PE/FE.",
  order: 10
},
{
  id: "transformers",
  title: "Transformatorer",
  description: "Grunnleggende transformatorberegninger, kortslutning og tapsvurderinger.",
  order: 11
},
  {
    id: "solar_pv",
    title: "Solceller (PV)",
    description:
      "Formler for dimensjonering og vurdering av solcelleanlegg (PV).",
    order: 12
  },
  {
    id: "batteries",
    title: "Batterisystemer",
    description:
      "Energiinnhold, C-rate, utlading og autonomitid for batterisystemer.",
    order: 13
  },
  {
    id: "ups_backup",
    title: "UPS og reservekraft",
    description:
      "Autonomitid, batteridimensjonering og generatorstrømmer for reservekraft.",
    order: 14
  },
  {
    id: "emc",
    title: "EMC",
    description:
      "Enkle formler for skjerming, koblingsfaktorer og støyreduksjon.",
    order: 15
  },
  {
    id: "sound_level",
    title: "Lydnivå / decibel",
    description:
      "Sammenhenger for lydnivå i dB, effektnivå og summering av støykilder.",
    order: 16
  },
  {
    id: "thermal",
    title: "Termiske beregninger",
    description:
      "Varmeutvikling, temperaturøkning og termisk dimensjonering.",
    order: 17
  },
  {
    id: "efficiency_losses",
    title: "Virkningsgrad og tap",
    description:
      "Utvidede sammenhenger for virkningsgrad, tap og energiforbruk.",
    order: 18
  },
  {
    id: "windpower",
    title: "Vindkraft",
    description:
      "Grunnleggende formler for vindenergi, tipphastighetsforhold og kapasitetsfaktor.",
    order: 19
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
   * MOTORSTART
   * ======================================================================= */
  {
  id: "motor_start_current",
  categoryId: "motorstart",
  name: "Startstrøm – direkte start (DOL)",
  description:
    "Startstrøm ved direkte start (DOL) av asynkronmotor. Forholdstallet k varierer typisk mellom 4 og 8.",
  baseExpression: "I_{start} = k · I_n",
  variables: [
    {
      id: "k",
      symbol: "k",
      name: "Startstrømsfaktor",
      unit: "",
      description: "Typisk 4–8 for asynkronmotorer."
    },
    {
      id: "I_n",
      symbol: "I_n",
      name: "Merkestrøm",
      unit: "A"
    },
    {
      id: "I_start",
      symbol: "I_{start}",
      name: "Startstrøm",
      unit: "A"
    }
  ],
  variants: [
    {
      id: "motor_startcalc_In",
      label: "Løs for I_n",
      solveFor: "I_n",
      expression: "I_n = I_{start} / k"
    },
    {
      id: "motor_startcalc_k",
      label: "Løs for k",
      solveFor: "k",
      expression: "k = I_{start} / I_n"
    }
  ],
  tags: ["motor, startstrøm, DOL"]
},
{
  id: "motor_start_yd",
  categoryId: "motorstart",
  name: "Startstrøm – Y/D-start",
  description:
    "Startstrøm ved stjerne/trekant-start. Strømmen reduseres til 1/√3 av direkte start.",
  baseExpression: "I_{start,YD} = I_{start,DOL} / √3",
  variables: [
    {
      id: "I_start_dol",
      symbol: "I_{start,DOL}",
      name: "Startstrøm direkte start",
      unit: "A"
    },
    {
      id: "I_start_yd",
      symbol: "I_{start,YD}",
      name: "Startstrøm Y/D",
      unit: "A"
    }
  ],
  variants: [
    {
      id: "motor_start_yd_solve_dol",
      label: "Løs for I_{start,DOL}",
      solveFor: "I_start_dol",
      expression: "I_{start,DOL} = I_{start,YD} · √3"
    }
  ],
  tags: ["motor, y/d, stjerne/trekant"]
},
{
  id: "motor_voltage_drop_single",
  categoryId: "motorstart",
  name: "Spenningsfall ved motorstart (1-fase)",
  description:
    "Spenningsfall under motorstart i enfase kurs. Bruker startstrøm og kabelens R/X.",
  baseExpression: "ΔU = 2 · I_{start} · (R · cosφ + X · sinφ)",
  variables: [
    { id: "I_start", symbol: "I_{start}", name: "Startstrøm", unit: "A" },
    { id: "R", symbol: "R", name: "Resistans", unit: "Ω" },
    { id: "X", symbol: "X", name: "Reaktans", unit: "Ω" },
    { id: "cosphi", symbol: "cos φ", name: "Effektfaktor", unit: "" },
    { id: "sphi", symbol: "sin φ", name: "Reaktiv faktor", unit: "" },
    { id: "dU", symbol: "ΔU", name: "Spenningsfall", unit: "V" }
  ],
  tags: ["spenningsfall, motorstart, enfase"]
},
{
  id: "motor_voltage_drop_three",
  categoryId: "motorstart",
  name: "Spenningsfall ved motorstart (3-fase)",
  description:
    "Spenningsfall under motorstart i trefase kurs. Bruker startstrøm og kabelens R/X.",
  baseExpression: "ΔU = √3 · I_{start} · (R · cosφ + X · sinφ)",
  variables: [
    { id: "I_start", symbol: "I_{start}", name: "Startstrøm", unit: "A" },
    { id: "R", symbol: "R", name: "Resistans", unit: "Ω" },
    { id: "X", symbol: "X", name: "Reaktans", unit: "Ω" },
    { id: "cosphi", symbol: "cos φ", name: "Effektfaktor", unit: "" },
    { id: "sphi", symbol: "sin φ", name: "Reaktiv faktor", unit: "" },
    { id: "dU", symbol: "ΔU", name: "Spenningsfall", unit: "V" }
  ],
  tags: ["spenningsfall, motorstart, trefase"]
},
{
  id: "motor_vfd_start_current",
  categoryId: "motorstart",
  name: "Startstrøm – frekvensomformer",
  description:
    "Typisk startstrøm ved bruk av frekvensomformer. Ligger vanligvis rundt 1.1–1.3 · I_n.",
  baseExpression: "I_{start} = k · I_n",
  variables: [
    { id: "k", symbol: "k", name: "Startstrømsfaktor", unit: "", description: "Typisk 1.1–1.3." },
    { id: "I_n", symbol: "I_n", name: "Merkestrøm", unit: "A" },
    { id: "I_start", symbol: "I_{start}", name: "Startstrøm", unit: "A" }
  ],
  tags: ["motor, frekvensomformer, start"]
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
  },
   {
    id: "overload_protection_basic",
    categoryId: "protection",
    name: "Overbelastningsvern – grunnregel",
    description:
      "Kravet for vern av kabel mot overbelastning. Må oppfylle NEK 400-4-43.",
    baseExpression: "I_b ≤ I_n ≤ I_z",
    variables: [
      {
        id: "I_b",
        symbol: "I_b",
        name: "Belastningsstrøm",
        unit: "A",
        description: "Forventet maksimal strøm i kursen."
      },
      {
        id: "I_n",
        symbol: "I_n",
        name: "Vernets merkestrøm",
        unit: "A",
        description: "Vernets merkestrøm eller innstilling."
      },
      {
        id: "I_z",
        symbol: "I_z",
        name: "Tillatt strømføringsevne",
        unit: "A",
        description:
          "Kabelens strømføringsevne etter tabell og korreksjonsfaktorer."
      }
    ],
    tags: ["I_b, I_n, I_z"]
  },

  {
    id: "fault_disconnection_loop_impedance",
    categoryId: "protection",
    name: "Utkobling ved feil – sløyfeimpedans",
    description:
      "Maksimalt tillatt sløyfeimpedans for å sikre automatisk utkobling innenfor kravene i NEK 400-4-41.",
    baseExpression: "Z_s ≤ U_0 / I_a",
    variables: [
      {
        id: "Z_s",
        symbol: "Z_s",
        name: "Sløyfeimpedans",
        unit: "Ω",
        description: "Samlet impedans i fase- og beskyttelsesleder."
      },
      {
        id: "U_0",
        symbol: "U_0",
        name: "Fasespenning",
        unit: "V",
        description: "Normalt 230 V i norske IT-/TN-anlegg."
      },
      {
        id: "I_a",
        symbol: "I_a",
        name: "Utløsningsstrøm",
        unit: "A",
        description: "Strøm som utløser vernet innenfor tillatt tid."
      }
    ],
    variants: [
      {
        id: "fault_disconnection_zs",
        label: "Løs for Z_s",
        solveFor: "Z_s",
        expression: "Z_s = U_0 / I_a"
      },
      {
        id: "fault_disconnection_Ia",
        label: "Løs for I_a",
        solveFor: "I_a",
        expression: "I_a = U_0 / Z_s"
      }
    ],
    tags: ["Z_s, U_0, I_a"]
  },

  {
    id: "selectivity_time",
    categoryId: "protection",
    name: "Tidsselektivitet",
    description:
      "Selektivitet basert på tidsforskjeller mellom oppstrøms- og nedstrømsvern.",
    baseExpression: "t_1 < t_2",
    variables: [
      {
        id: "t_1",
        symbol: "t_1",
        name: "Utløsningstid nedstrøms",
        unit: "s",
        description: "Tiden vernet nærmest feilen bruker på å løse ut."
      },
      {
        id: "t_2",
        symbol: "t_2",
        name: "Utløsningstid oppstrøms",
        unit: "s",
        description:
          "Må være lengre enn t_1 for å unngå at begge vern løser samtidig."
      }
    ],
    tags: ["t_1, t_2"]
  },

  {
    id: "selectivity_current",
    categoryId: "protection",
    name: "Strømselektivitet",
    description:
      "Selektivitet basert på at oppstrøms vern har høyere utløsestrømmer enn vern nedstrøms.",
    baseExpression: "I_{2, oppstrøms} > I_{2, nedstrøms}",
    variables: [
      {
        id: "I2_up",
        symbol: "I_{2, oppstrøms}",
        name: "Utløsningsstrøm oppstrøms",
        unit: "A",
        description: "Utløsningsstrøm i kortslutningsområdet for oppstrøms vern."
      },
      {
        id: "I2_down",
        symbol: "I_{2, nedstrøms}",
        name: "Utløsningsstrøm nedstrøms",
        unit: "A",
        description: "Utløsningsstrøm for vernet nærmest feilen."
      }
    ],
    tags: ["I_{2, oppstrøms}, I_{2, nedstrøms}"]
  },

  {
    id: "selectivity_energy",
    categoryId: "protection",
    name: "Energi-selektivitet (I²t)",
    description:
      "Selektivitet basert på at energien som slipper gjennom vernet (I²t) er lavere nedstrøms enn oppstrøms.",
    baseExpression: "I_1^2 · t_1 < I_2^2 · t_2",
    variables: [
      {
        id: "I_1",
        symbol: "I_1",
        name: "Strøm nedstrøms",
        unit: "A"
      },
      {
        id: "t_1",
        symbol: "t_1",
        name: "Utløsningstid nedstrøms",
        unit: "s"
      },
      {
        id: "I_2",
        symbol: "I_2",
        name: "Strøm oppstrøms",
        unit: "A"
      },
      {
        id: "t_2",
        symbol: "t_2",
        name: "Utløsningstid oppstrøms",
        unit: "s"
      }
    ],
    tags: ["I_1, t_1, I_2, t_2"]
  },
  /* =======================================================================
   * SPENNINGSFALL
   * ======================================================================= */
  {
  id: "voltdrop_single_phase",
  categoryId: "voltdrop",
  name: "Spenningsfall 1-fase",
  shortName: "ΔU = 2 · I · (R·cosφ + X·sinφ) · L",
  description:
    "Standardformel for spenningsfall i enfaset kabel. Basert på ledermotstand og induktans pr. meter etter NEK 400.",
  baseExpression: "ΔU = 2 · I · (R·cosφ + X·sinφ) · L",
  variables: [
    {
      id: "dU",
      symbol: "ΔU",
      name: "Spenningsfall",
      unit: "V",
      role: "output",
      description: "Beregnet spenningsfall i volt mellom kilde og last."
    },
    {
      id: "I",
      symbol: "I",
      name: "Strøm",
      unit: "A",
      role: "input",
      description: "Laststrøm i kabelen (beregnet eller dimensjonerende strøm)."
    },
    {
      id: "R",
      symbol: "R",
      name: "Resistans per meter",
      unit: "Ω/m",
      role: "input",
      description:
        "Lederresistans pr. meter. Hentes fra kabeltabell (Ω/km) for valgt tverrsnitt og materiale og deles på 1000. Bruk verdier for aktuell driftstemperatur (NEK 400 kabeltabeller)."
    },
    {
      id: "X",
      symbol: "X",
      name: "Reaktans per meter",
      unit: "Ω/m",
      role: "input",
      description:
        "Induktiv reaktans pr. meter. Hentes fra kabeltabell (Ω/km) og deles på 1000. For vanlige 1 kV-kabler er X som regel liten, men bør tas med ved lange strekk eller høye strømmer."
    },
    {
      id: "cosphi",
      symbol: "cosφ",
      name: "Effektfaktor",
      unit: "–",
      role: "input",
      description:
        "Effektfaktor for lasten (0–1). Typisk 0,8–0,95 for motorlaster. Bruk dimensjonerende cosφ i henhold til prosjekt/NEK 400."
    },
    {
      id: "sinphi",
      symbol: "sinφ",
      name: "Sinus til effektvinkel",
      unit: "–",
      role: "input",
      description:
        "sinφ tilhørende valgt cosφ. Kan beregnes som sinφ = √(1 − cos²φ) dersom den ikke er oppgitt direkte."
    },
    {
      id: "L",
      symbol: "L",
      name: "Lengde kabel",
      unit: "m",
      role: "input",
      description:
        "Enkeltkabelens én-veislengde i meter. For 1-fase regnes det allerede med tur/retur i faktoren 2 i formelen."
    }
  ],
  variants: [
    {
      id: "voltdrop_single_phase-dU",
      label: "Løs for ΔU",
      solveFor: "dU",
      expression: "dU = 2 * I * (R*cosphi + X*sinphi) * L"
    }
  ],
  tags: ["spenningsfall", "kabel", "1-fase", "NEK400"]
},
{
  id: "voltdrop_three_phase",
  categoryId: "voltdrop",
  name: "Spenningsfall 3-fase",
  shortName: "ΔU = √3 · I · (R·cosφ + X·sinφ) · L",
  description:
    "Standardformel for spenningsfall i trefaset kabel. Basert på ledermotstand og induktans pr. meter etter NEK 400.",
  baseExpression: "ΔU = √3 · I · (R·cosφ + X·sinφ) · L",
  variables: [
    {
      id: "dU",
      symbol: "ΔU",
      name: "Spenningsfall",
      unit: "V",
      role: "output",
      description:
        "Beregnet spenningsfall i volt mellom transformator/forsyning og last i trefasesystemet."
    },
    {
      id: "I",
      symbol: "I",
      name: "Strøm",
      unit: "A",
      role: "input",
      description:
        "Fase-/linjestrøm i kabelen (dimensjonerende belastningsstrøm)."
    },
    {
      id: "R",
      symbol: "R",
      name: "Resistans per meter",
      unit: "Ω/m",
      role: "input",
      description:
        "Lederresistans pr. meter. Hentes fra kabeltabell (Ω/km) for valgt tverrsnitt/materiale og deles på 1000. Bruk verdier for aktuell driftstemperatur (NEK 400 kabeltabeller)."
    },
    {
      id: "X",
      symbol: "X",
      name: "Reaktans per meter",
      unit: "Ω/m",
      role: "input",
      description:
        "Induktiv reaktans pr. meter. Hentes fra kabeltabell (Ω/km) og deles på 1000. For vanlige 3-fase 1 kV-kabler ligger X ofte rundt noen 0,0x Ω/km – slå opp korrekt verdi for valgt kabeltype."
    },
    {
      id: "cosphi",
      symbol: "cosφ",
      name: "Effektfaktor",
      unit: "–",
      role: "input",
      description:
        "Effektfaktor for lasten (0–1). Bruk dimensjonerende cosφ for aktuell lasttype (f.eks. motor, omformer)."
    },
    {
      id: "sinphi",
      symbol: "sinφ",
      name: "Sinus til effektvinkel",
      unit: "–",
      role: "input",
      description:
        "sinφ tilhørende valgt cosφ. Kan beregnes som sinφ = √(1 − cos²φ) dersom verdien ikke er oppgitt."
    },
    {
      id: "L",
      symbol: "L",
      name: "Lengde kabel",
      unit: "m",
      role: "input",
      description:
        "Én-veislengde i meter fra kilde til last (ikke tur/retur). √3-faktoren i formelen håndterer systemgeometrien for trefase."
    }
  ],
  variants: [
    {
      id: "voltdrop_three_phase-dU",
      label: "Løs for ΔU",
      solveFor: "dU",
      expression: "dU = 1.732 * I * (R*cosphi + X*sinphi) * L"
    }
  ],
  tags: ["spenningsfall", "kabel", "3-fase", "NEK400"]
},
/* =======================================================================
   * SSPENNINGSKVALITET
   * ======================================================================= */
 {
  id: "voltage_deviation_percent",
  categoryId: "power_quality",
  name: "Spenningsavvik i prosent",
  shortName: "ΔU_% = (U − U_n) / U_n · 100",
  description:
    "Spenningsavvik i prosent i forhold til merkespenning. Brukes bl.a. mot krav i EN 50160/NEK 400.",
  baseExpression: "ΔU_% = (U - U_n) / U_n * 100",
  variables: [
    {
      id: "U",
      symbol: "U",
      name: "Målt spenning",
      unit: "V",
      role: "input"
    },
    {
      id: "U_n",
      symbol: "U_n",
      name: "Merkespenning",
      unit: "V",
      role: "input"
    },
    {
      id: "dU_percent",
      symbol: "ΔU_%",
      name: "Spenningsavvik i prosent",
      unit: "%",
      role: "output",
      description:
        "Positiv verdi betyr høyere spenning enn nominell, negativ betyr lavere."
    }
  ],
  variants: [
    {
      id: "voltage_deviation_percent-dU_percent",
      label: "Løs for ΔU_%",
      solveFor: "dU_percent",
      expression: "dU_percent = (U - U_n) / U_n * 100"
    },
    {
      id: "voltage_deviation_percent-U",
      label: "Løs for U",
      solveFor: "U",
      expression: "U = U_n * (1 + dU_percent / 100)"
    },
    {
      id: "voltage_deviation_percent-U_n",
      label: "Løs for U_n",
      solveFor: "U_n",
      expression: "U_n = U / (1 + dU_percent / 100)"
    }
  ],
  tags: ["spenningsavvik, EN 50160, NEK 400"]
},
 {
  id: "voltage_unbalance_percent",
  categoryId: "power_quality",
  name: "Spenningsubalanse i trefasesystem",
  shortName: "k_U = (U_max − U_min) / U_avg · 100",
  description:
    "Enkel ubalansefaktor i prosent basert på største forskjell mellom fase- og gjennomsnittsspenning.",
  baseExpression: "k_U = (U_max - U_min) / U_avg * 100",
  variables: [
    {
      id: "U_max",
      symbol: "U_max",
      name: "Høyeste fasespenning",
      unit: "V",
      role: "input"
    },
    {
      id: "U_min",
      symbol: "U_min",
      name: "Laveste fasespenning",
      unit: "V",
      role: "input"
    },
    {
      id: "U_avg",
      symbol: "U_avg",
      name: "Gjennomsnittlig fasespenning",
      unit: "V",
      role: "input",
      description: "Typisk (U_R + U_S + U_T) / 3."
    },
    {
      id: "k_U",
      symbol: "k_U",
      name: "Spenningsubalanse",
      unit: "%",
      role: "output",
      description:
        "Spenningsubalanse i prosent. Små verdier (få prosent) er normalt akseptable."
    }
  ],
  variants: [
    {
      id: "voltage_unbalance_percent-k_U",
      label: "Løs for k_U",
      solveFor: "k_U",
      expression: "k_U = (U_max - U_min) / U_avg * 100"
    },
    {
      id: "voltage_unbalance_percent-U_max",
      label: "Løs for U_max",
      solveFor: "U_max",
      expression: "U_max = k_U * U_avg / 100 + U_min"
    },
    {
      id: "voltage_unbalance_percent-U_min",
      label: "Løs for U_min",
      solveFor: "U_min",
      expression: "U_min = U_max - k_U * U_avg / 100"
    }
  ],
  tags: ["ubalanse, trefase, spenningskvalitet"]
},
{
  id: "current_thd_percent",
  categoryId: "power_quality",
  name: "Total harmonisk forvrengning – strøm (THD_I)",
  shortName: "THD_I = I_h / I_1 · 100",
  description:
    "Total harmonisk forvrengning i strøm. I_h er RMS-sum av alle harmoniske komponenter utenom grunnkomponenten.",
  baseExpression: "THD_I = I_h / I_1 * 100",
  variables: [
    {
      id: "I_h",
      symbol: "I_h",
      name: "Harmonisk strøm (RMS)",
      unit: "A",
      role: "input",
      description:
        "RMS-sum av harmoniske komponenter (2., 3., 5., …), utenom grunnkomponenten."
    },
    {
      id: "I_1",
      symbol: "I_1",
      name: "Grunnkomponent strøm",
      unit: "A",
      role: "input"
    },
    {
      id: "THD_I",
      symbol: "THD_I",
      name: "Total harmonisk forvrengning (strøm)",
      unit: "%",
      role: "output",
      description: "THD_I i prosent av grunnkomponenten."
    }
  ],
  variants: [
    {
      id: "current_thd_percent-THD_I",
      label: "Løs for THD_I",
      solveFor: "THD_I",
      expression: "THD_I = I_h / I_1 * 100"
    },
    {
      id: "current_thd_percent-I_h",
      label: "Løs for I_h",
      solveFor: "I_h",
      expression: "I_h = THD_I * I_1 / 100"
    },
    {
      id: "current_thd_percent-I_1",
      label: "Løs for I_1",
      solveFor: "I_1",
      expression: "I_1 = I_h * 100 / THD_I"
    }
  ],
  tags: ["THD, harmoniske, strøm"]
},
{
  id: "voltage_thd_percent",
  categoryId: "power_quality",
  name: "Total harmonisk forvrengning – spenning (THD_U)",
  shortName: "THD_U = U_h / U_1 · 100",
  description:
    "Total harmonisk forvrengning i spenning. U_h er RMS-sum av alle harmoniske komponenter utenom grunnkomponenten.",
  baseExpression: "THD_U = U_h / U_1 * 100",
  variables: [
    {
      id: "U_h",
      symbol: "U_h",
      name: "Harmonisk spenning (RMS)",
      unit: "V",
      role: "input"
    },
    {
      id: "U_1",
      symbol: "U_1",
      name: "Grunnkomponent spenning",
      unit: "V",
      role: "input"
    },
    {
      id: "THD_U",
      symbol: "THD_U",
      name: "Total harmonisk forvrengning (spenning)",
      unit: "%",
      role: "output"
    }
  ],
  variants: [
    {
      id: "voltage_thd_percent-THD_U",
      label: "Løs for THD_U",
      solveFor: "THD_U",
      expression: "THD_U = U_h / U_1 * 100"
    },
    {
      id: "voltage_thd_percent-U_h",
      label: "Løs for U_h",
      solveFor: "U_h",
      expression: "U_h = THD_U * U_1 / 100"
    },
    {
      id: "voltage_thd_percent-U_1",
      label: "Løs for U_1",
      solveFor: "U_1",
      expression: "U_1 = U_h * 100 / THD_U"
    }
  ],
  tags: ["THD, harmoniske, spenning"]
},
/* =======================================================================
   * KABLER
   * ======================================================================= */
{
  id: "cable_temp_correction",
  categoryId: "cables",
  name: "Korreksjonsfaktor for omgivelsestemperatur",
  shortName: "I_z = I_nom · k_t",
  description:
    "Korrigert strømføringsevne basert på omgivelsestemperatur. Verdier for k_t tas fra NEK 400 tabeller.",
  baseExpression: "I_z = I_nom * k_t",
  variables: [
    { id: "I_nom", symbol: "I_nom", name: "Tabellverdi (strømføringsevne)", unit: "A", role: "input" },
    { id: "k_t", symbol: "k_t", name: "Temperaturfaktor", unit: "", role: "input" },
    { id: "I_z", symbol: "I_z", name: "Korrigert strømføringsevne", unit: "A", role: "output" }
  ],
  variants: [
    {
      id: "cable_temp_correction-I_z",
      label: "Løs for I_z",
      solveFor: "I_z",
      expression: "I_z = I_nom * k_t"
    },
    {
      id: "cable_temp_correction-I_nom",
      label: "Løs for I_nom",
      solveFor: "I_nom",
      expression: "I_nom = I_z / k_t"
    },
    {
      id: "cable_temp_correction-k_t",
      label: "Løs for k_t",
      solveFor: "k_t",
      expression: "k_t = I_z / I_nom"
    }
  ],
  tags: ["kabel", "temperatur", "NEK 400", "korreksjonsfaktor"]
},
{
  id: "cable_group_correction",
  categoryId: "cables",
  name: "Korreksjonsfaktor for antall belastede ledere",
  shortName: "I_z = I_nom · k_n",
  description:
    "Korreksjon for antall belastede ledere i flerlederkabler. k_n hentes fra NEK 400 tabeller.",
  baseExpression: "I_z = I_nom * k_n",
  variables: [
    { id: "I_nom", symbol: "I_nom", name: "Tabellverdi (strømføringsevne)", unit: "A", role: "input" },
    { id: "k_n", symbol: "k_n", name: "Faktor for belastede ledere", unit: "", role: "input" },
    { id: "I_z", symbol: "I_z", name: "Korrigert strømføringsevne", unit: "A", role: "output" }
  ],
  variants: [
    {
      id: "cable_group_correction-I_z",
      label: "Løs for I_z",
      solveFor: "I_z",
      expression: "I_z = I_nom * k_n"
    },
    {
      id: "cable_group_correction-I_nom",
      label: "Løs for I_nom",
      solveFor: "I_nom",
      expression: "I_nom = I_z / k_n"
    },
    {
      id: "cable_group_correction-k_n",
      label: "Løs for k_n",
      solveFor: "k_n",
      expression: "k_n = I_z / I_nom"
    }
  ],
  tags: ["kabel", "belastede ledere", "NEK 400", "korreksjonsfaktor"]
},
{
  id: "cable_total_correction",
  categoryId: "cables",
  name: "Total korrigert strømføringsevne",
  shortName: "I_z = I_nom · k_t · k_n",
  description:
    "Kombinert korreksjon for temperatur og antall belastede ledere. Verdier hentes fra NEK 400 tabeller.",
  baseExpression: "I_z = I_nom * k_t * k_n",
  variables: [
    { id: "I_nom", symbol: "I_nom", name: "Tabellverdi (strømføringsevne)", unit: "A", role: "input" },
    { id: "k_t", symbol: "k_t", name: "Temperaturfaktor", unit: "", role: "input" },
    { id: "k_n", symbol: "k_n", name: "Faktor belastede ledere", unit: "", role: "input" },
    { id: "I_z", symbol: "I_z", name: "Korrigert strømføringsevne", unit: "A", role: "output" }
  ],
  variants: [
    {
      id: "cable_total_correction-I_z",
      label: "Løs for I_z",
      solveFor: "I_z",
      expression: "I_z = I_nom * k_t * k_n"
    },
    {
      id: "cable_total_correction-I_nom",
      label: "Løs for I_nom",
      solveFor: "I_nom",
      expression: "I_nom = I_z / (k_t * k_n)"
    },
    {
      id: "cable_total_correction-k_t",
      label: "Løs for k_t",
      solveFor: "k_t",
      expression: "k_t = I_z / (I_nom * k_n)"
    },
    {
      id: "cable_total_correction-k_n",
      label: "Løs for k_n",
      solveFor: "k_n",
      expression: "k_n = I_z / (I_nom * k_t)"
    }
  ],
  tags: ["kabel", "strømføringsevne", "NEK 400", "korreksjonsfaktorer"]
},
/* =======================================================================
   * NY KATEGORI
   * ======================================================================= */
{
  id: "fault_loop_impedance",
  categoryId: "earthing",
  name: "Sløyfeimpedans – krav til utløsning",
  shortName: "Z_s ≤ U_0 / I_a",
  description:
    "Kontroll av at automatisk utkobling skjer tidsnok (NEK 400-4-41): sløyfeimpedansen må være lav nok til å gi utløsningsstrøm I_a.",
  baseExpression: "Z_s = U_0 / I_a",
  variables: [
    {
      id: "Zs",
      symbol: "Z_s",
      name: "Sløyfeimpedans",
      unit: "Ω",
      role: "output",
      description: "Total impedans i feilsløyfen fase–beskyttelsesleder."
    },
    {
      id: "U0",
      symbol: "U_0",
      name: "Merkespenning mot jord",
      unit: "V",
      role: "input"
    },
    {
      id: "Ia",
      symbol: "I_a",
      name: "Utløsningsstrøm for vern",
      unit: "A",
      role: "input",
      description: "Strøm som sikring/vern må nå for å koble ut innen krav."
    }
  ],
  variants: [
    {
      id: "fault_loop_impedance-Zs",
      label: "Løs for Z_s",
      solveFor: "Zs",
      expression: "Zs = U0 / Ia"
    },
    {
      id: "fault_loop_impedance-U0",
      label: "Løs for U_0",
      solveFor: "U0",
      expression: "U0 = Zs * Ia"
    },
    {
      id: "fault_loop_impedance-Ia",
      label: "Løs for I_a",
      solveFor: "Ia",
      expression: "Ia = U0 / Zs"
    }
  ],
  tags: ["Z_s", "U_0", "I_a", "sløyfeimpedans", "utkobling", "NEK 400"]
},
{
  id: "touch_voltage",
  categoryId: "earthing",
  name: "Berøringsspenning ved jordfeil",
  shortName: "U_c = I_d · R_A",
  description:
    "Enkel vurdering av berøringsspenning ved jordfeil. Brukes sammen med grenseverdier i NEK 400-4-41.",
  baseExpression: "U_c = I_d * R_A",
  variables: [
    {
      id: "Uc",
      symbol: "U_c",
      name: "Berøringsspenning",
      unit: "V",
      role: "output",
      description: "Spenning som kan opptre mellom utsatt del og jord."
    },
    {
      id: "Id",
      symbol: "I_d",
      name: "Feilstrøm mot jord",
      unit: "A",
      role: "input",
      description: "Strøm ved jordfeil (avhenger av systemtype og impedanser)."
    },
    {
      id: "RA",
      symbol: "R_A",
      name: "Jordmotstand",
      unit: "Ω",
      role: "input",
      description: "Sum av jordelektrode og beskyttelsesleder frem til utsatt del."
    }
  ],
  variants: [
    {
      id: "touch_voltage-Uc",
      label: "Løs for U_c",
      solveFor: "Uc",
      expression: "Uc = Id * RA"
    },
    {
      id: "touch_voltage-Id",
      label: "Løs for I_d",
      solveFor: "Id",
      expression: "Id = Uc / RA"
    },
    {
      id: "touch_voltage-RA",
      label: "Løs for R_A",
      solveFor: "RA",
      expression: "RA = Uc / Id"
    }
  ],
  tags: ["U_c", "I_d", "R_A", "berøringsspenning", "jordfeil"]
},
{
  id: "protective_conductor_sizing",
  categoryId: "earthing",
  name: "Dimensjonering av beskyttelsesleder",
  shortName: "S = I · √t / k",
  description:
    "Adiabatisk formel for minste tverrsnitt på PE/FE basert på feilstrøm, utkoblingstid og materialkonstant k (NEK 400-5-54).",
  baseExpression: "S = I * √t / k",
  variables: [
    {
      id: "S",
      symbol: "S",
      name: "Tverrsnitt beskyttelsesleder",
      unit: "mm²",
      role: "output",
      description: "Minste nødvendige tverrsnitt for PE/FE."
    },
    {
      id: "I",
      symbol: "I",
      name: "Feilstrøm",
      unit: "A",
      role: "input",
      description: "Forventet feilstrøm gjennom lederen."
    },
    {
      id: "t",
      symbol: "t",
      name: "Utkoblingstid",
      unit: "s",
      role: "input"
    },
    {
      id: "k",
      symbol: "k",
      name: "Materialkonstant k",
      unit: "A·s^0.5/mm²",
      role: "input",
      description: "Avhenger av materiale og isolasjon (se NEK 400-5-54 tabeller)."
    }
  ],
  variants: [
    {
      id: "protective_conductor_sizing-S",
      label: "Løs for S",
      solveFor: "S",
      expression: "S = I * (t ** 0.5) / k"
    },
    {
      id: "protective_conductor_sizing-I",
      label: "Løs for I",
      solveFor: "I",
      expression: "I = S * k / (t ** 0.5)"
    },
    {
      id: "protective_conductor_sizing-t",
      label: "Løs for t",
      solveFor: "t",
      expression: "t = (S * k / I) ** 2"
    },
    {
      id: "protective_conductor_sizing-k",
      label: "Løs for k",
      solveFor: "k",
      expression: "k = I * (t ** 0.5) / S"
    }
  ],
  tags: ["PE", "FE", "kabeltverrsnitt", "adiabatisk", "NEK 400-5-54"]
},
/* =======================================================================
   * TRANSFORMATORER
   * ======================================================================= */
  {
  id: "trafo_short_circuit_current",
  categoryId: "transformers",
  name: "Kortslutningsstrøm fra transformator",
  shortName: "Iₖ₃ = 100·Sₙ / (√3·Uₙ·uₖ%)",
  description:
    "Prospektiv 3-fase kortslutningsstrøm på transformatorens sekundærside basert på ytelse Sₙ, spenningsnivå Uₙ og kortslutningsspenning uₖ%.",
  baseExpression: "I_k3 = (100 * S_n) / (√3 * U_n * u_k_pct)",
  variables: [
    { id: "Ik3", symbol: "I_k3", name: "3-fase kortslutningsstrøm", unit: "A", role: "output" },
    { id: "Sn", symbol: "S_n", name: "Merkeytelse", unit: "VA", role: "input" },
    { id: "Un", symbol: "U_n", name: "Merkespenning", unit: "V", role: "input" },
    { id: "ukpct", symbol: "u_k%", name: "Kortslutningsspenning", unit: "%", role: "input" }
  ],
  variants: [
    { id: "trafo_sc-Ik3", label: "Løs for I_k3", solveFor: "Ik3", expression: "Ik3 = (100 * Sn) / (1.732 * Un * ukpct)" },
    { id: "trafo_sc-Sn", label: "Løs for S_n", solveFor: "Sn", expression: "Sn = (Ik3 * 1.732 * Un * ukpct) / 100" },
    { id: "trafo_sc-Un", label: "Løs for U_n", solveFor: "Un", expression: "Un = (100 * Sn) / (1.732 * Ik3 * ukpct)" },
    { id: "trafo_sc-ukpct", label: "Løs for u_k%", solveFor: "ukpct", expression: "ukpct = (100 * Sn) / (1.732 * Un * Ik3)" }
  ],
  tags: ["Ik", "kortslutning", "trafo", "u_k%", "NEK"]
},
{
  id: "trafo_no_load_loss",
  categoryId: "transformers",
  name: "Tomgangstap i transformator",
  shortName: "P₀ = Uₙ · I₀ · cosφ₀",
  description:
    "Tomgangstap beregnes vanligvis ved merkespenningsprøve og er i hovedsak avhengig av jernkvalitet og magnetisering.",
  baseExpression: "P_0 = U_n * I_0 * cosphi_0",
  variables: [
    { id: "P0", symbol: "P_0", name: "Tomgangstap", unit: "W", role: "output" },
    { id: "Un", symbol: "U_n", name: "Spenning", unit: "V", role: "input" },
    { id: "I0", symbol: "I_0", name: "Tomgangsstrøm", unit: "A", role: "input" },
    { id: "cosphi0", symbol: "cosφ_0", name: "Tomgang cos φ", unit: undefined, role: "input" }
  ],
  variants: [
    { id: "trafo_nl-P0", label: "Løs for P₀", solveFor: "P0", expression: "P0 = Un * I0 * cosphi0" },
    { id: "trafo_nl-Un", label: "Løs for Uₙ", solveFor: "Un", expression: "Un = P0 / (I0 * cosphi0)" },
    { id: "trafo_nl-I0", label: "Løs for I₀", solveFor: "I0", expression: "I0 = P0 / (Un * cosphi0)" },
    { id: "trafo_nl-cosphi0", label: "Løs for cosφ₀", solveFor: "cosphi0", expression: "cosphi0 = P0 / (Un * I0)" }
  ],
  tags: ["trafo", "tomgangstap", "jern", "effekt"]
},
{
  id: "trafo_load_loss",
  categoryId: "transformers",
  name: "Lasttap i transformator",
  shortName: "Pₖ = Iₙ² · Rₜ",
  description:
    "Lasttap (kobbertap) som oppstår i viklingene ved merkestrøm. Verdiene refererer normalt til 75°C viklingstemperatur.",
  baseExpression: "P_k = I_n^2 * R_t",
  variables: [
    { id: "Pk", symbol: "P_k", name: "Lasttap", unit: "W", role: "output" },
    { id: "In", symbol: "I_n", name: "Merkestrøm", unit: "A", role: "input" },
    { id: "Rt", symbol: "R_t", name: "Total viklingsresistans", unit: "Ω", role: "input" }
  ],
  variants: [
    { id: "trafo_ll-Pk", label: "Løs for Pₖ", solveFor: "Pk", expression: "Pk = In ** 2 * Rt" },
    { id: "trafo_ll-In", label: "Løs for Iₙ", solveFor: "In", expression: "In = (Pk / Rt) ** 0.5" },
    { id: "trafo_ll-Rt", label: "Løs for Rₜ", solveFor: "Rt", expression: "Rt = Pk / (In ** 2)" }
  ],
  tags: ["trafo", "kobbertap", "lasttap", "effekt"]
},
  /* =======================================================================
   * SOLCELLER (PV)
   * ======================================================================= */
  {
    id: "pv_dc_power",
    categoryId: "solar_pv",
    name: "DC-effekt fra solcellefelt",
    shortName: "P_DC = U_DC · I_DC",
    description:
      "Øyeblikkelig DC-effekt fra et solcellefelt basert på DC-spenning og DC-strøm.",
    baseExpression: "P_DC = U_DC * I_DC",
    variables: [
      {
        id: "P_DC",
        symbol: "P_DC",
        name: "DC-effekt",
        unit: "W",
        role: "output",
        description: "Levert DC-effekt fra solcellefeltet."
      },
      {
        id: "U_DC",
        symbol: "U_DC",
        name: "DC-spenning",
        unit: "V",
        role: "input"
      },
      {
        id: "I_DC",
        symbol: "I_DC",
        name: "DC-strøm",
        unit: "A",
        role: "input"
      }
    ],
    variants: [
      {
        id: "pv_dc_power-P",
        label: "Løs for P_DC",
        solveFor: "P_DC",
        expression: "P_DC = U_DC * I_DC"
      },
      {
        id: "pv_dc_power-U",
        label: "Løs for U_DC",
        solveFor: "U_DC",
        expression: "U_DC = P_DC / I_DC"
      },
      {
        id: "pv_dc_power-I",
        label: "Løs for I_DC",
        solveFor: "I_DC",
        expression: "I_DC = P_DC / U_DC"
      }
    ],
    tags: ["solcelle", "PV", "DC-effekt"]
  },
  {
    id: "pv_string_voltage",
    categoryId: "solar_pv",
    name: "Strengspenning for solceller",
    shortName: "U_string ≈ n_mod · U_mpp",
    description:
      "Tilnærmet strengspenning ved MPP basert på antall moduler i serie og modulens MPP-spenning.",
    baseExpression: "U_string = n_mod * U_mpp",
    variables: [
      {
        id: "U_string",
        symbol: "U_string",
        name: "Strengspenning",
        unit: "V",
        role: "output"
      },
      {
        id: "n_mod",
        symbol: "n_mod",
        name: "Antall moduler i serie",
        unit: "–",
        role: "input"
      },
      {
        id: "U_mpp",
        symbol: "U_mpp",
        name: "MPP-spenning per modul",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "pv_string_voltage-Ustring",
        label: "Løs for U_string",
        solveFor: "U_string",
        expression: "U_string = n_mod * U_mpp"
      },
      {
        id: "pv_string_voltage-nmod",
        label: "Løs for n_mod",
        solveFor: "n_mod",
        expression: "n_mod = U_string / U_mpp"
      },
      {
        id: "pv_string_voltage-Umpp",
        label: "Løs for U_mpp",
        solveFor: "U_mpp",
        expression: "U_mpp = U_string / n_mod"
      }
    ],
    tags: ["streng", "U_string", "U_mpp"]
  },
  {
    id: "pv_specific_yield",
    categoryId: "solar_pv",
    name: "Spesifikt utbytte for PV-anlegg",
    shortName: "Y_f = E_år / P_inst",
    description:
      "Spesifikt energiproduksjon (kWh/kWp) per år. Nyttig for å sammenligne ulike anlegg og lokasjoner.",
    baseExpression: "Y_f = E_year / P_inst",
    variables: [
      {
        id: "Y_f",
        symbol: "Y_f",
        name: "Spesifikt utbytte",
        unit: "kWh/kWp",
        role: "output"
      },
      {
        id: "E_year",
        symbol: "E_år",
        name: "Årsproduksjon",
        unit: "kWh",
        role: "input"
      },
      {
        id: "P_inst",
        symbol: "P_inst",
        name: "Installert effekt (STC)",
        unit: "kWp",
        role: "input"
      }
    ],
    variants: [
      {
        id: "pv_specific_yield-Yf",
        label: "Løs for Y_f",
        solveFor: "Y_f",
        expression: "Y_f = E_year / P_inst"
      },
      {
        id: "pv_specific_yield-Eyear",
        label: "Løs for E_år",
        solveFor: "E_year",
        expression: "E_year = Y_f * P_inst"
      },
      {
        id: "pv_specific_yield-Pinst",
        label: "Løs for P_inst",
        solveFor: "P_inst",
        expression: "P_inst = E_year / Y_f"
      }
    ],
    tags: ["Y_f", "kWh/kWp", "PV"]
  },
  {
    id: "pv_performance_ratio",
    categoryId: "solar_pv",
    name: "Performance Ratio (PR) for PV-anlegg",
    shortName: "PR = Y_f / Y_ref",
    description:
      "Performance Ratio (PR) som uttrykk for systemets samlede tap og effektivitet sammenlignet med referanseproduksjon.",
    baseExpression: "PR = Y_f / Y_ref",
    variables: [
      {
        id: "PR",
        symbol: "PR",
        name: "Performance Ratio",
        unit: "–",
        role: "output"
      },
      {
        id: "Y_f",
        symbol: "Y_f",
        name: "Spesifikt utbytte",
        unit: "kWh/kWp",
        role: "input"
      },
      {
        id: "Y_ref",
        symbol: "Y_ref",
        name: "Referanseutbytte",
        unit: "kWh/kWp",
        role: "input",
        description:
          "Teoretisk eller modellert energiproduksjon for gitt lokasjon."
      }
    ],
    variants: [
      {
        id: "pv_pr-PR",
        label: "Løs for PR",
        solveFor: "PR",
        expression: "PR = Y_f / Y_ref"
      },
      {
        id: "pv_pr-Yf",
        label: "Løs for Y_f",
        solveFor: "Y_f",
        expression: "Y_f = PR * Y_ref"
      },
      {
        id: "pv_pr-Yref",
        label: "Løs for Y_ref",
        solveFor: "Y_ref",
        expression: "Y_ref = Y_f / PR"
      }
    ],
    tags: ["PR", "performance ratio", "PV"]
  },

  /* =======================================================================
   * BATTERISYSTEMER
   * ======================================================================= */
  {
    id: "battery_energy_kwh",
    categoryId: "batteries",
    name: "Energiinnhold i batteri",
    shortName: "E_kWh = U_n · C_Ah / 1000",
    description:
      "Tilnærmet energiinnhold i et batteri basert på merkesspenning og kapasitet i Ah.",
    baseExpression: "E_kWh = U_n * C_Ah / 1000",
    variables: [
      {
        id: "E_kWh",
        symbol: "E_kWh",
        name: "Energiinnhold",
        unit: "kWh",
        role: "output"
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "Merkespenning",
        unit: "V",
        role: "input"
      },
      {
        id: "C_Ah",
        symbol: "C_Ah",
        name: "Kapasitet",
        unit: "Ah",
        role: "input"
      }
    ],
    variants: [
      {
        id: "battery_energy-E",
        label: "Løs for E_kWh",
        solveFor: "E_kWh",
        expression: "E_kWh = U_n * C_Ah / 1000"
      },
      {
        id: "battery_energy-Un",
        label: "Løs for U_n",
        solveFor: "U_n",
        expression: "U_n = (E_kWh * 1000) / C_Ah"
      },
      {
        id: "battery_energy-C",
        label: "Løs for C_Ah",
        solveFor: "C_Ah",
        expression: "C_Ah = (E_kWh * 1000) / U_n"
      }
    ],
    tags: ["batteri", "energi", "kWh"]
  },
  {
    id: "battery_runtime_hours",
    categoryId: "batteries",
    name: "Autonomitid fra batteribank",
    shortName: "t = E_kWh · η / P_last",
    description:
      "Omtrentlig autonomitid for et batterisystem basert på tilgjengelig energi, virkningsgrad og last.",
    baseExpression: "t_h = E_kWh * eta / P_load",
    variables: [
      {
        id: "t_h",
        symbol: "t",
        name: "Autonomitid",
        unit: "h",
        role: "output"
      },
      {
        id: "E_kWh",
        symbol: "E_kWh",
        name: "Tilgjengelig energi",
        unit: "kWh",
        role: "input"
      },
      {
        id: "P_load",
        symbol: "P_last",
        name: "Last",
        unit: "kW",
        role: "input"
      },
      {
        id: "eta",
        symbol: "η",
        name: "Virkningsgrad",
        unit: "–",
        role: "input",
        description: "Samlet virkningsgrad for omformer/batteri (0–1)."
      }
    ],
    variants: [
      {
        id: "battery_runtime-th",
        label: "Løs for t",
        solveFor: "t_h",
        expression: "t_h = E_kWh * eta / P_load"
      },
      {
        id: "battery_runtime-E",
        label: "Løs for E_kWh",
        solveFor: "E_kWh",
        expression: "E_kWh = t_h * P_load / eta"
      },
      {
        id: "battery_runtime-P",
        label: "Løs for P_last",
        solveFor: "P_load",
        expression: "P_load = E_kWh * eta / t_h"
      }
    ],
    tags: ["autonomitid", "batteri", "UPS"]
  },
  {
    id: "battery_c_rate",
    categoryId: "batteries",
    name: "C-rate for batteri",
    shortName: "C-rate = I / C_n",
    description:
      "C-rate som uttrykk for hvor hardt et batteri belastes i forhold til nominell kapasitet.",
    baseExpression: "C_rate = I / C_n",
    variables: [
      {
        id: "C_rate",
        symbol: "C-rate",
        name: "C-rate",
        unit: "–",
        role: "output"
      },
      {
        id: "I",
        symbol: "I",
        name: "Strøm",
        unit: "A",
        role: "input"
      },
      {
        id: "C_n",
        symbol: "C_n",
        name: "Nominell kapasitet",
        unit: "Ah",
        role: "input"
      }
    ],
    variants: [
      {
        id: "battery_c_rate-Crate",
        label: "Løs for C-rate",
        solveFor: "C_rate",
        expression: "C_rate = I / C_n"
      },
      {
        id: "battery_c_rate-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = C_rate * C_n"
      },
      {
        id: "battery_c_rate-Cn",
        label: "Løs for C_n",
        solveFor: "C_n",
        expression: "C_n = I / C_rate"
      }
    ],
    tags: ["batteri", "C-rate"]
  },
  {
    id: "battery_dod",
    categoryId: "batteries",
    name: "Utlading (Depth of Discharge)",
    shortName: "DOD_% = Q_ut / Q_n · 100",
    description:
      "Dybde på utlading (Depth of Discharge) i prosent av nominell kapasitet.",
    baseExpression: "DOD_percent = Q_out / Q_n * 100",
    variables: [
      {
        id: "DOD_percent",
        symbol: "DOD_%",
        name: "Utlading (DOD)",
        unit: "%",
        role: "output"
      },
      {
        id: "Q_out",
        symbol: "Q_ut",
        name: "Avgitt kapasitet",
        unit: "Ah",
        role: "input"
      },
      {
        id: "Q_n",
        symbol: "Q_n",
        name: "Nominell kapasitet",
        unit: "Ah",
        role: "input"
      }
    ],
    variants: [
      {
        id: "battery_dod-dod",
        label: "Løs for DOD_%",
        solveFor: "DOD_percent",
        expression: "DOD_percent = Q_out * 100 / Q_n"
      },
      {
        id: "battery_dod-Qout",
        label: "Løs for Q_ut",
        solveFor: "Q_out",
        expression: "Q_out = DOD_percent * Q_n / 100"
      },
      {
        id: "battery_dod-Qn",
        label: "Løs for Q_n",
        solveFor: "Q_n",
        expression: "Q_n = Q_out * 100 / DOD_percent"
      }
    ],
    tags: ["batteri", "DOD", "utlading"]
  },

  /* =======================================================================
   * UPS OG RESERVEKRAFT
   * ======================================================================= */
  {
    id: "ups_autonomy_time",
    categoryId: "ups_backup",
    name: "Autonomitid for UPS",
    shortName: "t = U_n · C_Ah · η / P_last",
    description:
      "Omtrentlig autonomitid for en UPS basert på DC-systems­penning, batterikapasitet, virkningsgrad og last.",
    baseExpression: "t_h = U_n * C_Ah * eta / (P_load * 1000)",
    variables: [
      {
        id: "t_h",
        symbol: "t",
        name: "Autonomitid",
        unit: "h",
        role: "output"
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "DC-systemspenning",
        unit: "V",
        role: "input"
      },
      {
        id: "C_Ah",
        symbol: "C_Ah",
        name: "Batterikapasitet",
        unit: "Ah",
        role: "input"
      },
      {
        id: "P_load",
        symbol: "P_last",
        name: "Last",
        unit: "kW",
        role: "input"
      },
      {
        id: "eta",
        symbol: "η",
        name: "Virkningsgrad",
        unit: "–",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ups_autonomy-th",
        label: "Løs for t",
        solveFor: "t_h",
        expression: "t_h = (U_n * C_Ah * eta) / (P_load * 1000)"
      },
      {
        id: "ups_autonomy-C",
        label: "Løs for C_Ah",
        solveFor: "C_Ah",
        expression: "C_Ah = (t_h * P_load * 1000) / (U_n * eta)"
      },
      {
        id: "ups_autonomy-P",
        label: "Løs for P_last",
        solveFor: "P_load",
        expression: "P_load = (U_n * C_Ah * eta) / (t_h * 1000)"
      }
    ],
    tags: ["UPS", "autonomitid", "batteri"]
  },
  {
    id: "ups_required_capacity",
    categoryId: "ups_backup",
    name: "Nødvendig batterikapasitet for UPS",
    shortName: "C_Ah = P_last · t · 1000 / (U_n · η)",
    description:
      "Dimensjonering av batterikapasitet for ønsket autonomitid og last.",
    baseExpression: "C_Ah = P_load * t_h * 1000 / (U_n * eta)",
    variables: [
      {
        id: "C_Ah",
        symbol: "C_Ah",
        name: "Kapasitet",
        unit: "Ah",
        role: "output"
      },
      {
        id: "P_load",
        symbol: "P_last",
        name: "Last",
        unit: "kW",
        role: "input"
      },
      {
        id: "t_h",
        symbol: "t",
        name: "Autonomitid",
        unit: "h",
        role: "input"
      },
      {
        id: "U_n",
        symbol: "U_n",
        name: "DC-systemspenning",
        unit: "V",
        role: "input"
      },
      {
        id: "eta",
        symbol: "η",
        name: "Virkningsgrad",
        unit: "–",
        role: "input"
      }
    ],
    variants: [
      {
        id: "ups_capacity-C",
        label: "Løs for C_Ah",
        solveFor: "C_Ah",
        expression: "C_Ah = P_load * t_h * 1000 / (U_n * eta)"
      },
      {
        id: "ups_capacity-P",
        label: "Løs for P_last",
        solveFor: "P_load",
        expression: "P_load = C_Ah * U_n * eta / (t_h * 1000)"
      },
      {
        id: "ups_capacity-t",
        label: "Løs for t",
        solveFor: "t_h",
        expression: "t_h = C_Ah * U_n * eta / (P_load * 1000)"
      }
    ],
    tags: ["UPS", "batteri", "dimensjonering"]
  },
  {
    id: "genset_current_three_phase",
    categoryId: "ups_backup",
    name: "Generatorstrøm fra aktiv effekt",
    shortName: "I = P / (√3 · U_L · cosφ)",
    description:
      "Trefasestrøm fra en generator basert på levert effekt, spenning og effektfaktor.",
    baseExpression: "I = P_kW * 1000 / (1.732 * U_L * cosphi)",
    variables: [
      {
        id: "I",
        symbol: "I",
        name: "Linjestrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "P_kW",
        symbol: "P",
        name: "Aktiv effekt",
        unit: "kW",
        role: "input"
      },
      {
        id: "U_L",
        symbol: "U_L",
        name: "Linjespenning",
        unit: "V",
        role: "input"
      },
      {
        id: "cosphi",
        symbol: "cosφ",
        name: "Effektfaktor",
        unit: "–",
        role: "input"
      }
    ],
    variants: [
      {
        id: "genset_current-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = P_kW * 1000 / (1.732 * U_L * cosphi)"
      },
      {
        id: "genset_current-P",
        label: "Løs for P",
        solveFor: "P_kW",
        expression: "P_kW = I * 1.732 * U_L * cosphi / 1000"
      }
    ],
    tags: ["reservekraft", "generator", "trefase"]
  },

  /* =======================================================================
   * EMC
   * ======================================================================= */
  {
    id: "emc_shielding_effectiveness",
    categoryId: "emc",
    name: "Skjermingseffektivitet fra nivåforskjell",
    shortName: "SE = L_før − L_etter",
    description:
      "Enkel skjermingseffektivitet i dB basert på forskjell i felt- eller spenningnivå før og etter skjerm.",
    baseExpression: "SE_dB = L_before - L_after",
    variables: [
      {
        id: "SE_dB",
        symbol: "SE",
        name: "Skjermingseffektivitet",
        unit: "dB",
        role: "output"
      },
      {
        id: "L_before",
        symbol: "L_før",
        name: "Nivå før skjerm",
        unit: "dB",
        role: "input"
      },
      {
        id: "L_after",
        symbol: "L_etter",
        name: "Nivå etter skjerm",
        unit: "dB",
        role: "input"
      }
    ],
    variants: [
      {
        id: "emc_shield-SE",
        label: "Løs for SE",
        solveFor: "SE_dB",
        expression: "SE_dB = L_before - L_after"
      },
      {
        id: "emc_shield-Lbefore",
        label: "Løs for L_før",
        solveFor: "L_before",
        expression: "L_before = SE_dB + L_after"
      },
      {
        id: "emc_shield-Lafter",
        label: "Løs for L_etter",
        solveFor: "L_after",
        expression: "L_after = L_before - SE_dB"
      }
    ],
    tags: ["EMC", "skjerming", "dB"]
  },
  {
    id: "emc_coupling_factor",
    categoryId: "emc",
    name: "Koblingsfaktor mellom kretser",
    shortName: "k = U_ind / U_kilde",
    description:
      "Enkel koblingsfaktor som uttrykker hvor stor andel av kildeamplituden som kobles over til en følsom krets.",
    baseExpression: "k = U_ind / U_src",
    variables: [
      {
        id: "k",
        symbol: "k",
        name: "Koblingsfaktor",
        unit: "–",
        role: "output"
      },
      {
        id: "U_ind",
        symbol: "U_ind",
        name: "Indusert spenning",
        unit: "V",
        role: "input"
      },
      {
        id: "U_src",
        symbol: "U_kilde",
        name: "Kildespenning",
        unit: "V",
        role: "input"
      }
    ],
    variants: [
      {
        id: "emc_coupling-k",
        label: "Løs for k",
        solveFor: "k",
        expression: "k = U_ind / U_src"
      },
      {
        id: "emc_coupling-Uind",
        label: "Løs for U_ind",
        solveFor: "U_ind",
        expression: "U_ind = k * U_src"
      },
      {
        id: "emc_coupling-Usrc",
        label: "Løs for U_kilde",
        solveFor: "U_src",
        expression: "U_src = U_ind / k"
      }
    ],
    tags: ["EMC", "kobling", "støy"]
  },
  {
    id: "emc_filter_attenuation",
    categoryId: "emc",
    name: "Demping i EMC-filter",
    shortName: "A = L_inn − L_ut",
    description:
      "Demping i dB fra et filter basert på inn- og utgangsnivå i dB. Kan være spenning-, strøm- eller effektnivå.",
    baseExpression: "A_dB = L_in - L_out",
    variables: [
      {
        id: "A_dB",
        symbol: "A",
        name: "Demping",
        unit: "dB",
        role: "output"
      },
      {
        id: "L_in",
        symbol: "L_inn",
        name: "Nivå inn",
        unit: "dB",
        role: "input"
      },
      {
        id: "L_out",
        symbol: "L_ut",
        name: "Nivå ut",
        unit: "dB",
        role: "input"
      }
    ],
    variants: [
      {
        id: "emc_filter-A",
        label: "Løs for A",
        solveFor: "A_dB",
        expression: "A_dB = L_in - L_out"
      },
      {
        id: "emc_filter-Lin",
        label: "Løs for L_inn",
        solveFor: "L_in",
        expression: "L_in = A_dB + L_out"
      },
      {
        id: "emc_filter-Lout",
        label: "Løs for L_ut",
        solveFor: "L_out",
        expression: "L_out = L_in - A_dB"
      }
    ],
    tags: ["EMC", "filter", "demping"]
  },

  /* =======================================================================
   * LYDNIVÅ / DECIBEL
   * (referanseformler – uten kalkulator-støtte foreløpig)
   * ======================================================================= */
  {
    id: "sound_pressure_level",
    categoryId: "sound_level",
    name: "Lydtrykknivå",
    shortName: "L_p = 20 · log10(p / p₀)",
    description:
      "Definisjon av lydtrykknivå i dB, der p₀ = 20 µPa er referanselydtrykk i luft.",
    baseExpression: "L_p = 20 * log10(p / p0)",
    variables: [
      {
        id: "L_p",
        symbol: "L_p",
        name: "Lydtrykknivå",
        unit: "dB",
        role: "output"
      },
      {
        id: "p",
        symbol: "p",
        name: "Lydtrykk",
        unit: "Pa",
        role: "input"
      },
      {
        id: "p0",
        symbol: "p₀",
        name: "Referanselydtrykk",
        unit: "Pa",
        role: "input",
        description: "Normalt 20 µPa = 2e-5 Pa i luft."
      }
    ],
    tags: ["lyd", "dB", "L_p"]
  },
  {
    id: "sound_power_level",
    categoryId: "sound_level",
    name: "Lydkraftnivå",
    shortName: "L_W = 10 · log10(P / P₀)",
    description:
      "Definisjon av lydkraftnivå i dB basert på forholdet mellom effekt og referanseeffekt.",
    baseExpression: "L_W = 10 * log10(P / P0)",
    variables: [
      {
        id: "L_W",
        symbol: "L_W",
        name: "Lydkraftnivå",
        unit: "dB",
        role: "output"
      },
      {
        id: "P",
        symbol: "P",
        name: "Effekt",
        unit: "W",
        role: "input"
      },
      {
        id: "P0",
        symbol: "P₀",
        name: "Referanseeffekt",
        unit: "W",
        role: "input",
        description: "Typisk 1 pW = 1e-12 W."
      }
    ],
    tags: ["lyd", "dB", "L_W"]
  },
  {
    id: "sound_level_sum_two_sources",
    categoryId: "sound_level",
    name: "Summert lydnivå – to kilder",
    shortName: "L_tot = 10 · log10(10^{L1/10} + 10^{L2/10})",
    description:
      "Summert lydnivå når to uavhengige støykilder med nivå L1 og L2 virker samtidig.",
    baseExpression: "L_tot = 10 * log10(10^(L1/10) + 10^(L2/10))",
    variables: [
      {
        id: "L_tot",
        symbol: "L_tot",
        name: "Summert lydnivå",
        unit: "dB",
        role: "output"
      },
      {
        id: "L1",
        symbol: "L1",
        name: "Lydnivå kilde 1",
        unit: "dB",
        role: "input"
      },
      {
        id: "L2",
        symbol: "L2",
        name: "Lydnivå kilde 2",
        unit: "dB",
        role: "input"
      }
    ],
    tags: ["lyd", "dB", "summering"]
  },

  /* =======================================================================
   * TERMISKE BEREGNINGER
   * ======================================================================= */
  {
    id: "thermal_power_from_resistance",
    categoryId: "thermal",
    name: "Effekttap i leder (termisk)",
    shortName: "P_tap = I² · R",
    description:
      "Effekttap i en leder eller komponent som gir varmeutvikling, basert på strøm og resistans.",
    baseExpression: "P_tap = I * I * R",
    variables: [
      {
        id: "P_tap",
        symbol: "P_tap",
        name: "Effekttap",
        unit: "W",
        role: "output"
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
        name: "Resistans",
        unit: "Ω",
        role: "input"
      }
    ],
    variants: [
      {
        id: "thermal_loss-P",
        label: "Løs for P_tap",
        solveFor: "P_tap",
        expression: "P_tap = I * I * R"
      },
      {
        id: "thermal_loss-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = (P_tap / R) ** 0.5"
      },
      {
        id: "thermal_loss-R",
        label: "Løs for R",
        solveFor: "R",
        expression: "R = P_tap / (I * I)"
      }
    ],
    tags: ["termisk", "P_tap", "I²R"]
  },
  {
    id: "thermal_temperature_rise",
    categoryId: "thermal",
    name: "Temperaturøkning fra effekttap",
    shortName: "ΔT = P_tap · R_th",
    description:
      "Enkel modell for temperaturøkning basert på effekttap og termisk motstand (K/W).",
    baseExpression: "dT = P_tap * R_th",
    variables: [
      {
        id: "dT",
        symbol: "ΔT",
        name: "Temperaturøkning",
        unit: "K",
        role: "output"
      },
      {
        id: "P_tap",
        symbol: "P_tap",
        name: "Effekttap",
        unit: "W",
        role: "input"
      },
      {
        id: "R_th",
        symbol: "R_th",
        name: "Termisk motstand",
        unit: "K/W",
        role: "input"
      }
    ],
    variants: [
      {
        id: "thermal_dT",
        label: "Løs for ΔT",
        solveFor: "dT",
        expression: "dT = P_tap * R_th"
      },
      {
        id: "thermal_Rth",
        label: "Løs for R_th",
        solveFor: "R_th",
        expression: "R_th = dT / P_tap"
      }
    ],
    tags: ["temperatur", "termisk motstand"]
  },
  {
    id: "thermal_equivalent_current",
    categoryId: "thermal",
    name: "Termisk ekvivalentstrøm (RMS over intervaller)",
    shortName: "I_eq = √(Σ I_i² · t_i / Σ t_i)",
    description:
      "Termisk ekvivalentstrøm over flere lastintervaller, nyttig for vurdering mot I²t og strømføringsevne.",
    baseExpression: "I_eq = ((I1*I1*t1 + I2*I2*t2) / (t1 + t2)) ** 0.5",
    variables: [
      {
        id: "I_eq",
        symbol: "I_eq",
        name: "Ekvivalentstrøm",
        unit: "A",
        role: "output"
      },
      {
        id: "I1",
        symbol: "I1",
        name: "Strøm intervall 1",
        unit: "A",
        role: "input"
      },
      {
        id: "t1",
        symbol: "t1",
        name: "Tid intervall 1",
        unit: "s",
        role: "input"
      },
      {
        id: "I2",
        symbol: "I2",
        name: "Strøm intervall 2",
        unit: "A",
        role: "input"
      },
      {
        id: "t2",
        symbol: "t2",
        name: "Tid intervall 2",
        unit: "s",
        role: "input"
      }
    ],
    tags: ["I_eq", "termisk", "RMS"]
  },

  /* =======================================================================
   * VIRKNINGSGRAD OG TAP
   * ======================================================================= */
  {
    id: "efficiency_percent",
    categoryId: "efficiency_losses",
    name: "Virkningsgrad i prosent",
    shortName: "η_% = P_ut / P_inn · 100",
    description:
      "Virkningsgrad uttrykt i prosent, basert på inn- og uteffekt.",
    baseExpression: "eta_percent = P_out / P_in * 100",
    variables: [
      {
        id: "eta_percent",
        symbol: "η_%",
        name: "Virkningsgrad",
        unit: "%",
        role: "output"
      },
      {
        id: "P_out",
        symbol: "P_ut",
        name: "Uteffekt",
        unit: "W",
        role: "input"
      },
      {
        id: "P_in",
        symbol: "P_inn",
        name: "Inneffekt",
        unit: "W",
        role: "input"
      }
    ],
    variants: [
      {
        id: "eff_percent-eta",
        label: "Løs for η_%",
        solveFor: "eta_percent",
        expression: "eta_percent = P_out * 100 / P_in"
      },
      {
        id: "eff_percent-Pout",
        label: "Løs for P_ut",
        solveFor: "P_out",
        expression: "P_out = eta_percent * P_in / 100"
      },
      {
        id: "eff_percent-Pin",
        label: "Løs for P_inn",
        solveFor: "P_in",
        expression: "P_in = P_out * 100 / eta_percent"
      }
    ],
    tags: ["virkningsgrad", "η", "tap"]
  },
  {
    id: "loss_power_difference",
    categoryId: "efficiency_losses",
    name: "Effekttap som differanse",
    shortName: "P_tap = P_inn − P_ut",
    description:
      "Enkel sammenheng mellom inn-effekt, ut-effekt og effekttap i et system.",
    baseExpression: "P_tap = P_in - P_out",
    variables: [
      {
        id: "P_tap",
        symbol: "P_tap",
        name: "Effekttap",
        unit: "W",
        role: "output"
      },
      {
        id: "P_in",
        symbol: "P_inn",
        name: "Inneffekt",
        unit: "W",
        role: "input"
      },
      {
        id: "P_out",
        symbol: "P_ut",
        name: "Uteffekt",
        unit: "W",
        role: "input"
      }
    ],
    variants: [
      {
        id: "loss_diff-Ptap",
        label: "Løs for P_tap",
        solveFor: "P_tap",
        expression: "P_tap = P_in - P_out"
      },
      {
        id: "loss_diff-Pin",
        label: "Løs for P_inn",
        solveFor: "P_in",
        expression: "P_in = P_tap + P_out"
      },
      {
        id: "loss_diff-Pout",
        label: "Løs for P_ut",
        solveFor: "P_out",
        expression: "P_out = P_in - P_tap"
      }
    ],
    tags: ["tap", "P_inn", "P_ut"]
  },
  {
    id: "energy_loss_over_time",
    categoryId: "efficiency_losses",
    name: "Energimengde som går tapt",
    shortName: "E_tap = P_tap · t",
    description:
      "Energitap over tid basert på konstant effekttap og varighet.",
    baseExpression: "E_tap = P_tap * t_h",
    variables: [
      {
        id: "E_tap",
        symbol: "E_tap",
        name: "Energimengde tapt",
        unit: "Wh",
        role: "output"
      },
      {
        id: "P_tap",
        symbol: "P_tap",
        name: "Effekttap",
        unit: "W",
        role: "input"
      },
      {
        id: "t_h",
        symbol: "t",
        name: "Tid",
        unit: "h",
        role: "input"
      }
    ],
    variants: [
      {
        id: "energy_loss-E",
        label: "Løs for E_tap",
        solveFor: "E_tap",
        expression: "E_tap = P_tap * t_h"
      },
      {
        id: "energy_loss-P",
        label: "Løs for P_tap",
        solveFor: "P_tap",
        expression: "P_tap = E_tap / t_h"
      }
    ],
    tags: ["energitap", "P_tap", "Wh"]
  },

  /* =======================================================================
   * VINDKRAFT
   * ======================================================================= */
  {
    id: "wind_power_ideal",
    categoryId: "windpower",
    name: "Teoretisk vindkraft på rotor",
    shortName: "P_vind = ½ · ρ · A · v³",
    description:
      "Teoretisk effekt i vindstrømmen over rotorarealet. Reell turbin vil ha virkningsgrad og Cp-faktor < 1.",
    baseExpression: "P_vind = 0.5 * rho * A * v * v * v",
    variables: [
      {
        id: "P_vind",
        symbol: "P_vind",
        name: "Vindkraft",
        unit: "W",
        role: "output"
      },
      {
        id: "rho",
        symbol: "ρ",
        name: "Lufttetthet",
        unit: "kg/m³",
        role: "input",
        description: "Typisk ca. 1,225 kg/m³ ved havnivå."
      },
      {
        id: "A",
        symbol: "A",
        name: "Rotorareal",
        unit: "m²",
        role: "input"
      },
      {
        id: "v",
        symbol: "v",
        name: "Vindhastighet",
        unit: "m/s",
        role: "input"
      }
    ],
    variants: [
      {
        id: "wind_power-P",
        label: "Løs for P_vind",
        solveFor: "P_vind",
        expression: "P_vind = 0.5 * rho * A * v * v * v"
      }
    ],
    tags: ["vind", "P_vind", "A", "v"]
  },
  {
    id: "wind_turbine_power_output",
    categoryId: "windpower",
    name: "Turbin-effekt med Cp og virkningsgrad",
    shortName: "P_el = ½ · ρ · A · v³ · C_p · η",
    description:
      "Elektrisk uteffekt fra vindturbin med hensyn til aerodynamisk virkningsgrad (C_p) og samlet virkningsgrad η.",
    baseExpression: "P_el = 0.5 * rho * A * v * v * v * C_p * eta",
    variables: [
      {
        id: "P_el",
        symbol: "P_el",
        name: "Elektrisk effekt",
        unit: "W",
        role: "output"
      },
      {
        id: "rho",
        symbol: "ρ",
        name: "Lufttetthet",
        unit: "kg/m³",
        role: "input"
      },
      {
        id: "A",
        symbol: "A",
        name: "Rotorareal",
        unit: "m²",
        role: "input"
      },
      {
        id: "v",
        symbol: "v",
        name: "Vindhastighet",
        unit: "m/s",
        role: "input"
      },
      {
        id: "C_p",
        symbol: "C_p",
        name: "Effektkoeffisient",
        unit: "–",
        role: "input",
        description: "Aerodynamisk koeffisient (Betz-grense ~0,59)."
      },
      {
        id: "eta",
        symbol: "η",
        name: "Samlet virkningsgrad",
        unit: "–",
        role: "input",
        description: "Mek./elektrisk virkningsgrad (gear, generator, omformer)."
      }
    ],
    variants: [
      {
        id: "wind_turbine-Pel",
        label: "Løs for P_el",
        solveFor: "P_el",
        expression: "P_el = 0.5 * rho * A * v * v * v * C_p * eta"
      }
    ],
    tags: ["vindturbin", "C_p", "P_el"]
  },
  {
    id: "wind_tip_speed_ratio",
    categoryId: "windpower",
    name: "Tipphastighetsforhold",
    shortName: "λ = ω · R / v",
    description:
      "Forholdet mellom bladspisshastighet og vindhastighet. Viktig for optimal driftspunkt for turbin.",
    baseExpression: "lambda = omega * R / v",
    variables: [
      {
        id: "lambda",
        symbol: "λ",
        name: "Tipphastighetsforhold",
        unit: "–",
        role: "output"
      },
      {
        id: "omega",
        symbol: "ω",
        name: "Vinkelhastighet",
        unit: "rad/s",
        role: "input"
      },
      {
        id: "R",
        symbol: "R",
        name: "Rotorradius",
        unit: "m",
        role: "input"
      },
      {
        id: "v",
        symbol: "v",
        name: "Vindhastighet",
        unit: "m/s",
        role: "input"
      }
    ],
    variants: [
      {
        id: "wind_lambda-lambda",
        label: "Løs for λ",
        solveFor: "lambda",
        expression: "lambda = omega * R / v"
      },
      {
        id: "wind_lambda-omega",
        label: "Løs for ω",
        solveFor: "omega",
        expression: "omega = lambda * v / R"
      }
    ],
    tags: ["vind", "tipphastighet", "λ"]
  },
  {
    id: "wind_capacity_factor",
    categoryId: "windpower",
    name: "Kapasitetsfaktor for vindkraftverk",
    shortName: "CF = E_år / (P_n · 8760)",
    description:
      "Kapasitetsfaktor som uttrykker forholdet mellom faktisk årlig produksjon og teoretisk maksimalproduksjon.",
    baseExpression: "CF = E_year / (P_n * 8760)",
    variables: [
      {
        id: "CF",
        symbol: "CF",
        name: "Kapasitetsfaktor",
        unit: "–",
        role: "output"
      },
      {
        id: "E_year",
        symbol: "E_år",
        name: "Årsproduksjon",
        unit: "MWh",
        role: "input"
      },
      {
        id: "P_n",
        symbol: "P_n",
        name: "Installert effekt",
        unit: "MW",
        role: "input"
      }
    ],
    variants: [
      {
        id: "wind_CF-CF",
        label: "Løs for CF",
        solveFor: "CF",
        expression: "CF = E_year / (P_n * 8760)"
      },
      {
        id: "wind_CF-E",
        label: "Løs for E_år",
        solveFor: "E_year",
        expression: "E_year = CF * P_n * 8760"
      }
    ],
    tags: ["vindkraft", "kapasitetsfaktor"]
  },

  /* =======================================================================
   * NY KATEGORI
   * ======================================================================= */
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
