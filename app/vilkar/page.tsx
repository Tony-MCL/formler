import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kjøps- og lisensvilkår – Digital Formelsamling",
  description:
    "Kjøps- og lisensvilkår for Digital Formelsamling fra Mathisens Morning Coffee Labs."
};

export default function VilkarPage() {
  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <h1 style={{ marginBottom: "0.75rem" }}>
        Kjøps- og lisensvilkår – Digital Formelsamling
      </h1>
      <p
        style={{
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--mcl-muted)"
        }}
      >
        Gjelder for bruk av Digital Formelsamling levert av{" "}
        <strong>Mathisens Morning Coffee Labs</strong> (“vi”, “oss” eller
        “leverandøren”). Dette dokumentet er ment som en praktisk
        orientering for brukere og kunder. For detaljerte spørsmål anbefaler vi
        at du kontakter oss eller innhenter juridisk rådgivning.
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>1. Partene</h2>
        <p>
          Tjenesten «Digital Formelsamling» leveres av{" "}
          <strong>Mathisens Morning Coffee Labs</strong>. Organisasjonsnummer
          vil bli oppdatert når registreringen er fullført (
          <em>“Org.nr kommer – oppdateres senere”</em>).
        </p>
        <p>
          Avtalen inngås mellom oss som leverandør og deg som kunde. Kunden kan
          være:
        </p>
        <ul>
          <li>
            <strong>Bedrift / virksomhet</strong> (primærmålgruppe)
          </li>
          <li>
            <strong>Privatperson</strong> (forbruker)
          </li>
        </ul>
        <p>
          For bedrifter gjelder alminnelig kontraktsrett. For privatpersoner
          gjelder blant annet <strong>forbrukerkjøpsloven</strong>,{" "}
          <strong>angrerettloven</strong> og <strong>personvernregelverket</strong> (GDPR).
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>2. Hva lisensen omfatter</h2>
        <p>
          Lisensen gir tilgang til Digital Formelsamling som et{" "}
          <strong>digitalt verktøy</strong> med:
        </p>
        <ul>
          <li>Visning av formler og faglig innhold</li>
          <li>Interaktive kalkulatorer</li>
          <li>Mulighet for eksport til PDF (med eller uten vannmerke)</li>
        </ul>
        <p>
          Lisensen er <strong>ikke</strong> en overføring av opphavsrett.
          Alt innhold, kildekode og design tilhører Mathisens Morning Coffee
          Labs, med mindre annet er uttrykkelig avtalt.
        </p>
        <p>
          Lisensen er personlig og knyttet til den e-postadressen som oppgis ved
          kjøp. Lisensen kan brukes av personen eller virksomheten som står som
          kjøper, i henhold til avtalt omfang (f.eks. enkeltbruker eller
          flerbruker – hvis dette senere innføres).
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>3. Lisensmodeller og pris</h2>
        <p>Vi tilbyr per i dag lisens i følgende hovedvarianter:</p>
        <ul>
          <li>
            <strong>Månedslisens</strong> – enten som engangskjøp eller løpende
            abonnement
          </li>
          <li>
            <strong>Årslisens</strong> – enten som engangskjøp eller løpende
            abonnement
          </li>
        </ul>
        <p>
          Prisene vises alltid <strong>inkludert merverdiavgift (MVA)</strong>{" "}
          før du går videre til betaling i Stripe. Eventuelle kampanjer,
          introduksjonstilbud eller spesialavtaler vil fremgå eksplisitt der det
          er aktuelt.
        </p>
        <p>
          Ved <strong>abonnement</strong> fornyes lisensen automatisk ved
          utløp av perioden (måned/år), inntil abonnementet sies opp. Ved{" "}
          <strong>engangskjøp</strong> utløper lisensen automatisk etter
          perioden du har betalt for, uten automatisk fornyelse.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>4. Bestillingsprosess og betalingsløsning</h2>
        <p>
          Betaling skjer via <strong>Stripe</strong> som vår
          betalingsleverandør. Før du sendes til Stripe:
        </p>
        <ul>
          <li>
            Velger du lisensperiode (måned/år) og om det skal være engangskjøp
            eller abonnement.
          </li>
          <li>
            Du får oppgitt pris inkludert MVA, samt vilkår for abonnement eller
            engangskjøp.
          </li>
          <li>
            Du må gi <strong>samtykke til våre vilkår</strong> og{" "}
            <strong>personvernerklæringen</strong>, og – for privatkunder – til
            at angreretten bortfaller når lisensen tas i bruk.
          </li>
        </ul>
        <p>
          Deretter registrerer du betalingskort og gjennomfører betalingen i
          Stripe. Du mottar kvittering direkte fra Stripe til e-posten du har
          oppgitt. Vi lagrer en kopi av nødvendige kjøpsdata i vårt system for
          lisenshåndtering og regnskapsformål.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>5. Levering av digitalt innhold</h2>
        <p>
          Lisensen aktiveres normalt <strong>umiddelbart</strong> etter at
          Stripe har bekreftet gjennomført betaling. Du sendes tilbake til
          appen, og vi oppdaterer lisensstatusen din automatisk.
        </p>
        <p>
          Siden dette er <strong>digitalt innhold som leveres straks</strong>,
          krever angrerettloven at du som forbruker samtykker til at
          angreretten bortfaller når lisensen tas i bruk. Uten slikt samtykke
          vil vi i utgangspunktet ikke aktivere lisensen før fristen er utløpt,
          men vår løsning er bygget rundt umiddelbar tilgang – derfor innhenter
          vi eksplisitt samtykke i lisensdialogen.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>6. Angrerett og oppsigelse</h2>
        <h3 style={{ fontSize: "1rem" }}>6.1 Privatkunder (forbruker)</h3>
        <p>
          Som privatkunde har du normalt <strong>14 dagers angrerett</strong>{" "}
          ved kjøp av digitale tjenester, jf. angrerettloven. Ved
          umiddelbar levering av digitalt innhold må du samtykke til at
          angreretten bortfaller når leveringen starter.
        </p>
        <p>
          I vår løsning betyr dette at du i lisensdialogen eksplisitt
          bekrefter at du ønsker at lisensen aktiveres umiddelbart, og at du
          forstår at angreretten dermed opphører når lisensen tas i bruk.
        </p>
        <p>
          Du kan lese mer på siden{" "}
          <a href="/angrerett">Angrerett og digitale tjenester</a>.
        </p>

        <h3 style={{ fontSize: "1rem", marginTop: "0.9rem" }}>
          6.2 Bedriftskunder
        </h3>
        <p>
          For bedriftskunder gjelder{" "}
          <strong>ikke angrerettloven</strong>. Kjøpet er bindende fra
          det tidspunktet lisensen er aktivert og betalingsforpliktelsen
          oppstår. Eventuelle avvik eller reklamasjoner behandles etter
          avtale og alminnelig kontraktsrett.
        </p>

        <h3 style={{ fontSize: "1rem", marginTop: "0.9rem" }}>
          6.3 Oppsigelse av abonnement
        </h3>
        <p>
          Ved abonnement kan du når som helst avslutte fornyelse. Lisensen
          vil da være aktiv ut inneværende betalte periode, men ikke fornyes
          videre. Vi vil senere tilby selvbetjent administrasjon av
          abonnement. Inntil dette er på plass kan du kontakte oss for å få
          hjelp til å avslutte fornyelsen.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>7. Brukeransvar og faglig innhold</h2>
        <p>
          Digital Formelsamling er et hjelpemiddel for fagpersoner innen
          elektro og relaterte fagområder. Vi streber etter korrekt og
          oppdatert innhold, men:
        </p>
        <ul>
          <li>
            Du er selv ansvarlig for å kontrollere at beregninger og resultater
            er riktige for det konkrete prosjektet.
          </li>
          <li>
            Tjenesten fritar ikke for plikt til å følge gjeldende forskrifter
            (f.eks. NEK 400, FEL, interne prosedyrer, m.m.).
          </li>
        </ul>
        <p>
          Vi fraskriver oss ansvar for tap som følge av direkte eller indirekte
          bruk av tjenesten, utover det som følger av ufravikelig lovgivning.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>8. Personvern og databehandling</h2>
        <p>
          Vi behandler personopplysninger i tråd med gjeldende regelverk
          (GDPR). Du finner en mer detaljert beskrivelse i vår{" "}
          <a href="/personvern">personvernerklæring</a>.
        </p>
        <p>Typiske personopplysninger vi behandler er blant annet:</p>
        <ul>
          <li>E-postadresse</li>
          <li>Navn og eventuelt firmanavn</li>
          <li>Organisasjonsnummer for bedriftskunder</li>
          <li>
            Kjøps- og lisensinformasjon (produkt, periode, betalingsreferanse)
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>9. Endring av vilkår</h2>
        <p>
          Vi kan oppdatere disse vilkårene ved behov, for eksempel på grunn av
          endringer i lovverk, funksjonalitet eller prismodell. Ved vesentlige
          endringer vil vi informere aktive lisenskunder via e-post eller i
          selve tjenesten.
        </p>
      </section>

      <section>
        <h2>10. Kontakt</h2>
        <p>
          For spørsmål om lisens, kjøp eller vilkår kan du kontakte{" "}
          <strong>Mathisens Morning Coffee Labs</strong>. Kontaktinformasjon
          vil publiseres på vår nettside.
        </p>
      </section>
    </main>
  );
}
