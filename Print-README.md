# MCL PrintEngine – README

Denne modulen er laget for å kunne gjenbrukes på tvers av alle Morning Coffee Labs-applikasjoner
(Formelsamling, Gantt/ManageProgress, Befaringsapp, osv.) som en felles utskriftsmotor.

Målet er:

- Forutsigbar, pen utskriftslayout (A4-fokus)
- Ett sett komponenter og CSS som brukes i alle apper
- Skille mellom:
  - **Innholdslag** (rapporten)
  - **Branding-lag** (logo og vannmerke)
- Klart for lisenslogikk (f.eks. fjerne vannmerke, bytte logo til kundelogo)

---

## 1. Filstruktur og hva som hører til PrintEngine

### 1.1. Kjernefiler (må være med i alle apper som skal bruke PrintEngine)

**TypeScript / logikk**

Disse filene er selve “motoren”:

```txt
/lib/print/types.ts         # Generelle typer (PrintData, PrintSection, tabeller osv.)
/lib/print/branding.ts      # Branding-motor (logo/vannmerke og lisens-modes)
React-komponenter

txt
Kopier kode
/components/print/PrintLayout.tsx    # Hoved-layout for rapporten (tittel, meta, innhold, vannmerke, logo)
/components/print/PrintSection.tsx   # Fleksibel seksjonskomponent brukt av PrintLayout
/components/print/PrintButton.tsx    # Liten knapp som kaller window.print()
/components/print/PrintOverlay.tsx   # (Valgfritt) ekstra overlay-lag for vannmerke/logo på tvers av sider
CSS

txt
Kopier kode
/styles/print.css            # All print-spesifikk styling (A4, marger, @media print, .pe-root, .pe-no-print, osv.)
Merk: Det antas at appen allerede har MCL-standard:

txt
Kopier kode
/styles/theme.css          # Fargepalett, CSS-variabler, typografi
/app/globals.css           # Importerer theme.css + generelle styles
1.2. Demo-filer (kun som referanse / test)
Disse filer viser hvordan PrintEngine brukes, men er ikke “kjerne” – du kan kopiere eller la være:

txt
Kopier kode
/app/print-demo/page.tsx    # En enkel demo-rapport med kort innhold
/app/print-long/page.tsx    # En lang rapport for å teste fler-siders utskrift
Bruk dem som mal når du lager dine egne print-sider.

2. CSS-integrasjon
2.1. Import av print.css
I Next.js-prosjektet ditt (App Router) har du normalt:

ts
Kopier kode
// /app/globals.css
@import "../styles/theme.css";
@import "../styles/print.css";

/* øvrige globale styles */
Viktig:

print.css inneholder:

@media print-regler

.pe-root / .pe-page – ramme rundt rapporten

.pe-no-print – elementer som ikke skal med på papir (f.eks. verktøylinje, knapper)

Vannmerke- og logo-posisjonering i utskrift

2.2. Nyttige klasser
.pe-root – wrapper for hele print-layouten

.pe-page – selve rapport-området

.pe-no-print – skjules i @media print

.pe-watermark – lag for vannmerke (ligger bak innhold)

.pe-content – hovedinnhold (ligger over vannmerket)

3. Datamodell: PrintData og seksjoner
/lib/print/types.ts definerer den generelle datamodellen som alle apper bruker.

Prinsipp:

Hver app (Formelsamling, Gantt, osv.) bygger sine egne objekter (formel, prosjekt, befaring …)

En adapter-funksjon i appen mapper dette om til PrintData

PrintLayout tar imot PrintData og rendrer ferdig rapport

Forenklet eksempel på PrintData:

ts
Kopier kode
export type PrintMetaItem = {
  label: string;
  value: string;
};

export type PrintContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "keyValueList"; items: { key: string; value: string }[]; columns?: 1 | 2 }
  | { type: "table"; headers: string[]; rows: PrintTableRow[] };

export type PrintSection = {
  id: string;
  title?: string;
  content: PrintContentBlock[];
};

export type PrintData = {
  title: string;
  subtitle?: string;
  meta?: PrintMetaItem[];
  sections: PrintSection[];
};
Poenget er at alle apper gir PrintEngine et objekt av typen PrintData, uansett hva de jobber med.

4. Branding, logo og vannmerke
Branding er skilt ut i en egen modul:

ts
Kopier kode
// /lib/print/branding.ts

export type BrandingMode =
  | "mcl"                    // MCL-logo + MCL-vannmerke (typisk LITE/demo)
  | "mcl-no-watermark"       // MCL-logo, men uten vannmerke (betalt lisens)
  | "customer"               // Kun kundens logo (white-label)
  | "customer-with-watermark"; // Kundens logo + MCL-vannmerke ("Powered by MCL")

export type BrandingInput = {
  mode: BrandingMode;
  basePath?: string;         // DEFAULT: process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  customerLogoUrl?: string;
  customerName?: string;     // alt-tekst for kundelogo
};

export type PrintBranding = {
  logoUrl?: string;
  logoAlt?: string;
  watermarkUrl?: string;
  showWatermark: boolean;
};

export function resolvePrintBranding(input: BrandingInput): PrintBranding {
  // Bygger riktige URLer/flags til PrintLayout
}
4.1. Forventede bilde-filer
Som standard forventer resolvePrintBranding at følgende filer finnes:

txt
Kopier kode
/public/images/mcl-logo.png
/public/images/mcl-watermark.png
Hvis du vil bruke andre filnavn, endrer du én gang inne i branding.ts.

4.2. Hvordan bruke branding i en print-side
Eksempel (fra print-demo):

ts
Kopier kode
import PrintLayout from "../../components/print/PrintLayout";
import PrintButton from "../../components/print/PrintButton";
import type { PrintData } from "../../lib/print/types";
import { resolvePrintBranding } from "../../lib/print/branding";

const demoData: PrintData = { /* ... */ };

export default function PrintDemoPage() {
  const branding = resolvePrintBranding({ mode: "mcl" });

  return (
    <main>
      <PrintLayout
        {...demoData}
        {...branding}
      />

      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
4.3. Branding-modes i praksis
LITE / demo (full MCL-branding):

ts
Kopier kode
const branding = resolvePrintBranding({ mode: "mcl" });
Betalt lisens uten vannmerke (MCL-logo, ingen watermark):

ts
Kopier kode
const branding = resolvePrintBranding({ mode: "mcl-no-watermark" });
White-label kunde (kun kundens logo):

ts
Kopier kode
const branding = resolvePrintBranding({
  mode: "customer",
  customerLogoUrl: `${basePath}/images/customer-acme-logo.png`,
  customerName: "Acme Power"
});
Kundelogo + MCL-vannmerke (“Powered by MCL”):

ts
Kopier kode
const branding = resolvePrintBranding({
  mode: "customer-with-watermark",
  customerLogoUrl: `${basePath}/images/customer-acme-logo.png`,
  customerName: "Acme Power"
});
5. Lisenslogikk – hvor den skal ligge
Selve PrintEngine kjenner ikke til lisenser. Den forventer bare BrandingMode og eventuelt kundelogo.

Lisenslogikken bør ligge i appen (eller i en felles portal). Et typisk oppsett:

ts
Kopier kode
// Eksempel: /lib/print/licenseBranding.ts i appen

import { resolvePrintBranding, BrandingMode } from "./branding";

type LicenseInfo = {
  hasPaidLicense: boolean;
  hasCustomerBranding: boolean;
  customerLogoUrl?: string;
  customerName?: string;
};

export function getBrandingForUser(license: LicenseInfo) {
  let mode: BrandingMode = "mcl";

  if (license.hasCustomerBranding && license.customerLogoUrl) {
    mode = "customer";
  } else if (license.hasPaidLicense) {
    mode = "mcl-no-watermark";
  } else {
    mode = "mcl";
  }

  return resolvePrintBranding({
    mode,
    customerLogoUrl: license.customerLogoUrl,
    customerName: license.customerName
  });
}
I print-siden:

ts
Kopier kode
const license = getLicenseSomehow(); // portal, API, etc.
const branding = getBrandingForUser(license);

<PrintLayout {...printData} {...branding} />;
Poenget: PrintEngine er ferdig lisensklar – du styrer bare mode og logo-URL i appen.

6. Lage en ny print-visning i en app
La oss ta et generelt oppsett du kan bruke overalt.

6.1. Adapter: domeneobjekt → PrintData
Legg i appen, f.eks. i Formelsamling:

ts
Kopier kode
// /lib/print/mapFormulaToPrint.ts

import type { PrintData } from "./types";

export function mapFormulaToPrint(formula: Formula, calcState: CalcState): PrintData {
  return {
    title: formula.name,
    subtitle: formula.description,
    meta: [
      { label: "Kategori", value: formula.categoryName },
      { label: "Formel ID", value: formula.id }
    ],
    sections: [
      {
        id: "expression",
        title: "Grunnuttrykk",
        content: [
          { type: "paragraph", text: formula.baseExpression }
        ]
      },
      {
        id: "values",
        title: "Verdier",
        content: [
          {
            type: "keyValueList",
            items: calcState.values.map(v => ({
              key: v.label,
              value: v.displayValue
            })),
            columns: 1
          }
        ]
      }
      // ev. flere seksjoner
    ]
  };
}
6.2. Print-side (Next.js)
Eksempel for Formelsamling:

ts
Kopier kode
// /app/print/[id]/page.tsx

import PrintLayout from "../../components/print/PrintLayout";
import PrintButton from "../../components/print/PrintButton";
import { mapFormulaToPrint } from "../../lib/print/mapFormulaToPrint";
import { resolvePrintBranding } from "../../lib/print/branding";

type Props = {
  params: { id: string };
};

export default function FormulaPrintPage({ params }: Props) {
  const formulaId = params.id;

  // 1. Hent data (server-side eller client-side)
  const formula = getFormulaSomehow(formulaId);
  const calcState = getCalcStateSomehow(formulaId);

  // 2. Map til PrintData
  const printData = mapFormulaToPrint(formula, calcState);

  // 3. Bestem branding (kan senere styres av lisens)
  const branding = resolvePrintBranding({ mode: "mcl" });

  return (
    <main>
      <PrintLayout
        {...printData}
        {...branding}
      />

      <div className="pe-root pe-no-print">
        <div className="pe-page">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
7. Skjule app-UI ved utskrift
Alt som ikke skal med på papirutskriften legges under .pe-no-print:

tsx
Kopier kode
<div className="pe-root pe-no-print">
  <div className="pe-page">
    <Toolbar />
    <PrintButton />
    {/* andre interaktive elementer */}
  </div>
</div>
print.css sørger for at .pe-no-print blir display: none ved @media print.

Selve rapporten (PrintLayout) ligger utenfor denne wrapperen og blir skrevet ut.

8. Oversikt – steg for steg for en ny app
Når du vil plugge PrintEngine inn i en ny MCL-app:

Kopier kjernefilene til samme steder:

/lib/print/types.ts

/lib/print/branding.ts

/components/print/PrintLayout.tsx

/components/print/PrintSection.tsx

/components/print/PrintButton.tsx

/components/print/PrintOverlay.tsx (valgfritt, kan ligge ubrukt)

/styles/print.css + sørg for at den importeres i /app/globals.css

Legg inn bildene (eller tilpass filnavn i branding.ts):

/public/images/mcl-logo.png

/public/images/mcl-watermark.png

Lag en adapter i appen:

F.eks. /lib/print/mapFormulaToPrint.ts

Mapper domeneobjekt → PrintData

Lag en print-side:

F.eks. /app/print/[id]/page.tsx

Hent domeneobjektet

Kall mapXToPrint(...) for å lage PrintData

Kall resolvePrintBranding(...) for å lage branding

Rendre <PrintLayout {...printData} {...branding} />

Rendre <PrintButton /> inni en .pe-no-print-wrapper

(Senere) Koble lisens:

Lag f.eks. /lib/print/licenseBranding.ts i appen

Bestem BrandingMode fra lisens

Bruk resolvePrintBranding til å gjøre om det til PrintLayout-props
