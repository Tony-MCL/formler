// lib/types.ts

// I stedet for manuelle union-typer ( "ohm" | "power" | ... )
// bruker vi string for å slippe å vedlikeholde listen hver gang
// vi legger til en ny formel-id eller kategori-id.

export type FormulaId = string;
export type FormulaCategoryId = string;

export type VariableId = string;

export type VariableRole = "input" | "output" | "intermediate";

export type FormulaVariable = {
  /** Intern ID, ofte lik symbol, f.eks. "U" eller "cosphi" */
  id: VariableId;
  /** Kort matematisk symbol: U, I, R, P, E, cosφ, osv. */
  symbol: string;
  /** Navn i klartekst: "Spenning", "Strøm", ... */
  name: string;
  /** Enhet, f.eks. "V", "A", "Ω", "W", "kWh", "h" */
  unit?: string;
  /** Om variabelen typisk er input, output eller mellomledd */
  role?: VariableRole;
  /** Kort forklaring til brukeren */
  description?: string;
};

export type SolveForId = VariableId;

/**
 * Variant er f.eks. "Løs for U" eller "Løs for I".
 * expression er i enkel tekstsyntaks (stil B), f.eks. "U = R * I".
 */
export type FormulaVariant = {
  id: string;
  label: string;
  solveFor: SolveForId;
  /** Tekstbasert uttrykk som motoren senere parser, f.eks. "U = R * I" */
  expression: string;
  note?: string;
};

export type FormulaCategory = {
  id: FormulaCategoryId;
  title: string;
  description?: string;
  /** Sorteringsrekkefølge i UI */
  order: number;
};

/**
 * Grunnstruktur for én formel i samlingen.
 * baseExpression er "kanonisk" uttrykk (typisk én måte å skrive formelen på),
 * mens variants brukes når vi vil ha ferdige "løst for X"-varianter.
 */
export type Formula = {
  id: FormulaId;
  categoryId: FormulaCategoryId;
  name: string;
  shortName?: string;
  description?: string;
  /** Hoveduttrykk, f.eks. "U = R * I" (enkel tekst, ikke LaTeX) */
  baseExpression: string;
  variables: FormulaVariable[];
  variants?: FormulaVariant[];
  /** Fritekstagger, f.eks. "U, I, R" eller "P, U, I, cosphi" – brukt bl.a. i sidebar-hint */
  tags?: string[];
/** Gruppér enfase/trefase osv. i samme «familie» */
  familyId?: string;          // f.eks. "active_power"
  modeLabel?: string;         // f.eks. "1-fase", "3-fase"
  isPrimaryInFamily?: boolean; // Hvilken som skal vises i menyen (dersom flere i samme kategori)
};

/**
 * Typisk struktur for et beregningsresultat fra motoren (fase 4).
 * Ikke i bruk enda, men klart for senere.
 */
export type SolveResult = {
  formulaId: FormulaId;
  variantId: string;
  solveFor: SolveForId;
  value: number;
  unit?: string;
  formatted: string;
};
