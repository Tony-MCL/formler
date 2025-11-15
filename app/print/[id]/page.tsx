// /app/print/[id]/page.tsx

import PrintLayout from "../../components/print/PrintLayout";
import PrintButton from "../../components/print/PrintButton";
import {
  mapFormulaToPrint,
  type FormulaLike,
  type CalcState
} from "../../lib/print/mapFormulaToPrint";
import { resolvePrintBranding } from "../../lib/print/branding";

type Props = {
  params: { id: string };
};

// Midlertidige "datakilder" – disse kan senere byttes ut med ekte data
function getFormulaSomehow(id: string): FormulaLike {
  return {
    id,
    name: `Formel ${id}`,
    description: undefined,
    categoryName: undefined,
    baseExpression: ""
  };
}

function getCalcStateSomehow(_id: string): CalcState {
  return {
    values: []
  };
}

export default function FormulaPrintPage({ params }: Props) {
  const formulaId = params.id;

  // 1. Hent data (foreløpig dummy-funksjoner)
  const formula = getFormulaSomehow(formulaId);
  const calcState = getCalcStateSomehow(formulaId);

  // 2. Map til PrintData
  const printData = mapFormulaToPrint(formula, calcState);

  // 3. Bestem branding (kan senere styres av lisens)
  const branding = resolvePrintBranding({ mode: "mcl" });

  return (
    <main>
      {/* Selve rapporten som skal skrives ut */}
      <PrintLayout {...printData} {...branding} />

      {/* UI som ikke skal skrives ut (pe-no-print skjules i @media print) */}
      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
