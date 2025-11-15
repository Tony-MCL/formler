// /app/print/[id]/page.tsx

import PrintLayout from "../../../components/print/PrintLayout";
import PrintButton from "../../../components/print/PrintButton";
import { mapFormulaToPrint } from "../../../lib/print/mapFormulaToPrint";
import { resolvePrintBranding } from "../../../lib/print/branding";
import type { FormulaId } from "../../../lib/types";

type Props = {
  params: { id: string };
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function FormulaPrintPage({ params }: Props) {
  const formulaId = params.id as FormulaId;

  // 1. Bygg PrintData fra formel
  const printData = mapFormulaToPrint(formulaId);

  // 2. Branding – LITE/demo med full MCL-branding
  const branding = resolvePrintBranding({
    mode: "mcl",
    basePath
  });

  return (
    <main>
      {/* Selve rapporten som skal skrives ut */}
      <PrintLayout {...printData} {...branding} />

      {/* UI som ikke skal printes */}
      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.75rem"
            }}
          >
            <a
              href={basePath + "/"}
              className="button"
              aria-label="Tilbake til appen"
            >
              ← Tilbake
            </a>
            <PrintButton />
          </div>
        </div>
      </div>
    </main>
  );
}
