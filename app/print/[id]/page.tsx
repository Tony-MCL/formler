// app/print/[id]/page.tsx

import PrintLayout from "../../components/print/PrintLayout";
import PrintButton from "../../components/print/PrintButton";
import type { PrintData } from "../../lib/print/types";
import { resolvePrintBranding } from "../../lib/print/branding";
import { getFormulasGroupedByCategory } from "../../lib/formulas";
import type { FormulaId } from "../../lib/types";

type Props = {
  params: { id: FormulaId };
};

// Denne trengs for output: "export" – bygger statiske sider for alle formler
export function generateStaticParams() {
  const groups = getFormulasGroupedByCategory();
  const allFormulas = groups.flatMap((g) => g.formulas);

  return allFormulas.map((f) => ({
    id: f.id
  }));
}

export default function FormulaPrintPage({ params }: Props) {
  const formulaId = params.id;

  const groups = getFormulasGroupedByCategory();
  const allFormulas = groups.flatMap((g) => g.formulas);
  const formula = allFormulas.find((f) => f.id === formulaId);

  if (!formula) {
    // Fallback – skal egentlig aldri skje når generateStaticParams brukes
    return (
      <main>
        <div className="pe-root">
          <div className="pe-page">
            <h1>Fant ikke formel</h1>
            <p>ID: {String(formulaId)}</p>
          </div>
        </div>
      </main>
    );
  }

  const printData: PrintData = {
    title: formula.name,
    subtitle: formula.description,
    meta: [
      {
        label: "Kategori",
        value: (formula as any).categoryName ?? ""
      },
      {
        label: "Formel ID",
        value: String(formula.id)
      }
    ].filter((item) => item.value),

    sections: [
      {
        id: "expression",
        title: "Grunnuttrykk",
        content: [
          {
            type: "paragraph",
            text: (formula as any).baseExpression ?? ""
          }
        ]
      },
      {
        id: "variables",
        title: "Variabler",
        content: [
          {
            type: "table",
            headers: ["Symbol", "Navn", "Enhet", "Beskrivelse"],
            rows: (formula.variables ?? []).map((v) => ({
              id: String(v.id),
              cells: [
                String((v as any).symbol ?? ""),
                String((v as any).name ?? ""),
                (v as any).unit ? String((v as any).unit) : "",
                (v as any).description ? String((v as any).description) : ""
              ]
            }))
          }
        ]
      }
    ]
  };

  const branding = resolvePrintBranding({ mode: "mcl" });

  return (
    <main>
      {/* Selve rapporten (går til PDF/skriv ut) */}
      <PrintLayout {...printData} {...branding} />

      {/* Verktøylinje / knapp som ikke skal med på papir */}
      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
