// /app/print/[id]/page.tsx

import PrintLayout from "../../../components/print/PrintLayout";
import PrintButton from "../../../components/print/PrintButton";
import { mapFormulaToPrint } from "../../../lib/print/mapFormulaToPrint";
import { resolvePrintBranding } from "../../../lib/print/branding";
import { getFormulasGroupedByCategory } from "../../../lib/formulas";
import type { FormulaId } from "../../../lib/types";

type Props = {
  params: { id: string };
};

// Kreves for output: "export" + dynamisk route
export function generateStaticParams() {
  const groups = getFormulasGroupedByCategory();
  const ids = groups.flatMap((g) => g.formulas.map((f) => f.id));

  return ids.map((id) => ({
    id: id.toString()
  }));
}

export default function FormulaPrintPage({ params }: Props) {
  const formulaId = params.id as FormulaId;

  // 1. Bygg PrintData fra formel
  const printData = mapFormulaToPrint(formulaId);

  // 2. Branding – LITE/demo med full MCL-branding
  const branding = resolvePrintBranding({ mode: "mcl" });

  return (
    <main>
      <PrintLayout {...printData} {...branding} />

      {/* UI som ikke skal med på papirutskrift */}
      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
