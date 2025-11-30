import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Angrerett og digitale tjenester – Digital Formelsamling",
  description:
    "Informasjon om angrerett ved kjøp av digitalt innhold i Digital Formelsamling."
};

export default function AngrerettPage() {
  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <h1 style={{ marginBottom: "0.75rem" }}>
        Angrerett og digitale tjenester
      </h1>
      <p
        style={{
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--mcl-muted)"
        }}
      >
        Her finner du en kort forklaring av hvordan angrerett fungerer ved kjøp
        av digitalt innhold som Digital Formelsamling. Dette er en forenklet
        oversikt – for full juridisk tolkning må du se lovteksten eller rådføre
        deg med en juridisk rådgiver.
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>1. Angrerett for privatkunder (forbruker)</h2>
        <p>
          Som privatperson har du normalt <strong>14 dagers angrerett</strong> ved
          kjøp av tjenester og digitale produkter som inngås på nett, i henhold
          til angrerettloven.
        </p>
        <p>
          For <strong>digitalt innhold som leveres straks</strong> (som
          Digital Formelsamling) åpner angrerettloven for at angreretten
          kan bortfalle når:
        </p>
        <ul>
          <li>leveringen har startet, og</li>
          <li>
            du som kunde på forhånd har gitt <strong>uttrykkelig samtykke</strong> til dette, og
          </li>
          <li>
            du har fått <strong>klar informasjon</strong> om at angreretten
            bortfaller når leveringen starter.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>2. Hvordan dette er løst i Digital Formelsamling</h2>
        <p>
          Når du kjøper lisens via vår lisensdialog i appen, vil du bli
          informert om at:
        </p>
        <ul>
          <li>Lisensen aktiveres umiddelbart etter gjennomført betaling.</li>
          <li>
            Du får full tilgang til digitalt innhold (kalkulatorer, funksjoner
            og eventuelle PDF-eksporter) med en gang.
          </li>
          <li>
            For å få umiddelbar tilgang må du samtykke til at{" "}
            <strong>angreretten bortfaller</strong> når lisensen tas i bruk.
          </li>
        </ul>
        <p>
          Dette skjer ved at du eksplisitt krysser av i lisensdialogen før du går
          videre til betaling. Uten slikt samtykke ville vi måtte utsette
          aktivering av lisensen, noe som ikke er hensiktsmessig for denne typen
          verktøy.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>3. Bedriftskunder</h2>
        <p>
          For <strong>bedriftskunder</strong> gjelder normalt ikke angrerettloven.
          Kjøpet er bindende fra det tidspunktet avtalen er inngått og lisensen
          er aktivert. Spørsmål om feil, mangler eller andre forhold vil da
          håndteres etter avtalen mellom partene og alminnelig kontraktsrett.
        </p>
      </section>

      <section>
        <h2>4. Spørsmål om angrerett</h2>
        <p>
          Dersom du mener det har oppstått en feil, misforståelse eller det er
          andre spesielle forhold rundt kjøpet, kan du ta kontakt med oss
          (Mathisens Morning Coffee Labs). Vi vil gjøre vårt beste for å finne
          en ryddig løsning innenfor rammene av regelverket.
        </p>
        <p style={{ marginTop: "0.6rem" }}>
          Denne siden er ment som en veiledning. Ved motstrid mellom denne
          teksten og lovverket, er det til enhver tid gjeldende lov som gjelder.
        </p>
      </section>
    </main>
  );
}
