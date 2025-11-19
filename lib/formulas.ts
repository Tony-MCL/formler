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
    description: "Nett-typer, spenningsnivåer, spenningsfall og enkle kortslutningsstørrelser.",
    order: 2
  },
  {
    id: "machines",
    title: "Motorer og generatorer",
    description: "Enkle sammenhenger for roterende maskiner, synkronhastighet og moment.",
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
  /* =======================================================================
   * GRUNNLEGGENDE ELKRAFT
   * =======================================================================
   */
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
    shortName: "Rₜₒₜ = R₁ + R₂",
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

  /* =======================================================================
   * SYSTEMER OG NETT
   * =======================================================================
   */
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
        description:
          "Forskjell mellom nominell og faktisk spenning."
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
        expression: "ΔU = I * R"
      },
      {
        id: "voltage_drop-I",
        label: "Løs for I",
        solveFor: "I",
        expression: "I = ΔU / R"
      },
      {
        id: "voltage_drop-R",
        label: "Løs for R",
        solveFor: "R",
        expression: "R = ΔU / I"
      }
    ],
    tags: ["ΔU, I, R"]
  },

  /* =======================================================================
   * MOTORER OG GENERATORER
   * =======================================================================
   */
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
    name: "Enfaset tilsynelatende effekt",
    shortName: "S = U · I",
    description:
      "Tilsynelatende effekt i enfaset system basert på spenning og strøm.",
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
  {
    id: "efficiency",
    categoryId: "machines",
    name: "Virkningsgrad",
    shortName: "η = P_ut / P_inn",
    description:
      "Sammenheng mellom inn- og uteffekt i maskiner og systemer.",
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
        expression: "eta = P_out / P_in"
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
  }
];

/**
 * Hjelper til visning: grupper formler etter kategori, sortert pr. order.
 * - Hvis flere formler i samme kategori deler familyId, vis kun «primary» i menyen.
 */
export function getFormulasGroupedByCategory(): {
  category: FormulaCategory;
  formulas: Formula[];
}[] {
  return formulaCategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => {
      const inCategory = formulas.filter((f) => f.categoryId === category.id);
      const picked: Formula[] = [];
      const seenFamilies = new Set<string>();

      for (const f of inCategory) {
        if (f.familyId) {
          if (seenFamilies.has(f.familyId)) continue;

          const familyMembers = inCategory.filter(
            (m) => m.familyId === f.familyId
          );
          const primary =
            familyMembers.find((m) => m.isPrimaryInFamily) ?? familyMembers[0];

          if (primary) {
            picked.push(primary);
            seenFamilies.add(f.familyId);
          }
        } else {
          picked.push(f);
        }
      }

      return { category, formulas: picked };
    })
    .filter((group) => group.formulas.length > 0);
}

/**
 * Enkel oppslagshjelper – nyttig senere for formelvisning/kalkulatorer.
 */
export function getFormulaById(id: FormulaId): Formula | undefined {
  return formulas.find((f) => f.id === id);
}
