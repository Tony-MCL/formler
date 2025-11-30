import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvernerklæring – Digital Formelsamling",
  description:
    "Personvernerklæring for Digital Formelsamling fra Mathisens Morning Coffee Labs."
};

export default function PersonvernPage() {
  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <h1 style={{ marginBottom: "0.75rem" }}>
        Personvernerklæring – Digital Formelsamling
      </h1>
      <p
        style={{
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--mcl-muted)"
        }}
      >
        Denne personvernerklæringen beskriver hvordan{" "}
        <strong>Mathisens Morning Coffee Labs</strong> behandler
        personopplysninger i tilknytning til tjenesten Digital Formelsamling.
        Erklæringen er ment som en praktisk oversikt; ved behov for juridisk
        tolkning av regelverket anbefaler vi at du innhenter egen rådgivning.
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>1. Behandlingsansvarlig</h2>
        <p>
          Behandlingsansvarlig for personopplysninger i Digital Formelsamling er{" "}
          <strong>Mathisens Morning Coffee Labs</strong>. Organisasjonsnummer
          vil bli oppdatert når registreringen er fullført (
          <em>“Org.nr kommer – oppdateres senere”</em>).
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>2. Hvilke opplysninger vi behandler</h2>
        <p>
          Vi behandler i hovedsak følgende typer personopplysninger i
          tilknytning til Digital Formelsamling:
        </p>
        <ul>
          <li>
            <strong>Kontaktinformasjon</strong>: e-postadresse, navn og
            eventuell kontaktperson.
          </li>
          <li>
            <strong>Bedriftsinformasjon</strong>: firmanavn, organisasjonsnummer
            og land for bedriftskunder.
          </li>
          <li>
            <strong>Lisens- og kjøpsdata</strong>: lisens-type, periode
            (måned/år), om det er abonnement eller engangskjøp, tidspunkt for
            kjøp og tekniske referanser til betaling (Stripe-ID-er).
          </li>
          <li>
            <strong>Brukerpreferanser</strong>: språkvalg, tema (lys/mørk) og
            eventuelle lokale innstillinger lagret i nettleseren.
          </li>
        </ul>
        <p>
          Vi lagrer <strong>ikke</strong> fullstendige betalingskortnummer i
          våre systemer. Betalingsinformasjon håndteres av vår
          betalingsleverandør Stripe.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>3. Formål og behandlingsgrunnlag</h2>
        <h3 style={{ fontSize: "1rem" }}>3.1 Levering av tjenesten</h3>
        <p>
          Vi behandler personopplysninger for å kunne:
        </p>
        <ul>
          <li>Identifisere deg som lisenskunde</li>
          <li>Gi deg tilgang til betalt funksjonalitet</li>
          <li>Håndtere prøveperioder og lisensstatus</li>
          <li>Oppfylle våre forpliktelser etter kjøpsavtalen</li>
        </ul>
        <p>
          Behandlingsgrunnlaget er{" "}
          <strong>avtale</strong> (GDPR artikkel 6 nr. 1 bokstav b) – det er
          nødvendig for å oppfylle avtalen med deg eller virksomheten du
          representerer.
        </p>

        <h3 style={{ fontSize: "1rem", marginTop: "0.9rem" }}>
          3.2 Fakturering, regnskap og revisjon
        </h3>
        <p>
          Kjøps- og lisensdata lagres i våre systemer for å:
        </p>
        <ul>
          <li>Kunne dokumentere kjøp og lisensforhold</li>
          <li>Oppfylle bokførings- og skatteregler</li>
          <li>Gi oversikt over historikk ved eventuelle spørsmål eller tvister</li>
        </ul>
        <p>
          Behandlingsgrunnlaget er{" "}
          <strong>rettslig forpliktelse</strong> (GDPR artikkel 6 nr. 1 bokstav
          c), samt <strong>berettiget interesse</strong> (artikkel 6 nr. 1
          bokstav f) for å ha et fungerende lisens- og regnskapssystem.
        </p>

        <h3 style={{ fontSize: "1rem", marginTop: "0.9rem" }}>
          3.3 Drift og forbedring av tjenesten
        </h3>
        <p>
          Vi kan bruke tekniske logger og aggregerte opplysninger til å forbedre
          ytelse, sikkerhet og brukeropplevelse i tjenesten. Der dette gjøres
          på en måte som innebærer behandling av personopplysninger, er
          grunnlaget vår <strong>berettigede interesse</strong> i å forbedre og
          sikre tjenesten.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>4. Lagring og oppbevaringstid</h2>
        <p>
          Vi lagrer personopplysninger så lenge det er nødvendig for formålene
          beskrevet over:
        </p>
        <ul>
          <li>
            Lisens- og kjøpsdata lagres så lenge det er nødvendig for regnskap,
            dokumentasjon og oppfølging, og i tråd med gjeldende krav til
            oppbevaringstid.
          </li>
          <li>
            Opplysninger knyttet til aktive lisenser lagres så lenge lisensen
            er aktiv og i en periode etterpå for å håndtere eventuell
            reaktivering, historikk og support.
          </li>
          <li>
            Tekniske logger kan lagres i kortere perioder der det er nødvendig
            for feilsøking og sikkerhet.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>5. Databehandlere og tredjepart</h2>
        <p>
          Vi benytter underleverandører (databehandlere) for å levere tjenesten.
          Dette kan blant annet omfatte:
        </p>
        <ul>
          <li>
            <strong>Stripe</strong> – betalingsformidling og håndtering av
            betalingsdata
          </li>
          <li>
            <strong>Google Cloud / Firebase</strong> – lagring av lisens- og
            konfigurasjonsdata
          </li>
          <li>
            Andre driftsleverandører for hosting, sikkerhet og logganalyse
          </li>
        </ul>
        <p>
          Vi inngår nødvendige databehandleravtaler der dette kreves, og er
          opptatt av at dine opplysninger behandles sikkert og i tråd med
          personvernregelverket.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>6. Dine rettigheter</h2>
        <p>
          Som registrert har du rettigheter etter personvernregelverket, blant
          annet:
        </p>
        <ul>
          <li>Rett til innsyn i hvilke opplysninger vi har om deg</li>
          <li>Rett til korrigering av uriktige eller ufullstendige opplysninger</li>
          <li>
            I noen tilfeller: rett til sletting eller begrensning av behandling
          </li>
          <li>
            Rett til å protestere på behandling som skjer på grunnlag av
            berettiget interesse
          </li>
          <li>Rett til dataportabilitet i enkelte tilfeller</li>
        </ul>
        <p>
          For å utøve rettighetene dine kan du kontakte oss. Vi vil svare så
          raskt som mulig og senest innen lovpålagte frister.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>7. Informasjonskapsler (cookies)</h2>
        <p>
          Selve Digital Formelsamling-appen er bygget for å bruke{" "}
          <strong>minimalt med cookies</strong>. Enkelte tekniske
          cookies og lokale lagringsmekanismer kan likevel benyttes for:
        </p>
        <ul>
          <li>Språkvalg</li>
          <li>Lagring av lokale brukerpreferanser</li>
          <li>Håndtering av prøveperiode og lisensstatus i nettleseren</li>
        </ul>
        <p>
          Eventuelle analyseverktøy eller tredjepartsløsninger som innføres
          senere vil beskrives nærmere i oppdatert versjon av denne
          erklæringen.
        </p>
      </section>

      <section>
        <h2>8. Endringer i personvernerklæringen</h2>
        <p>
          Vi kan oppdatere denne personvernerklæringen ved behov. Ved større
          endringer vil vi informere aktive lisenskunder gjennom appen eller via
          e-post der det er naturlig.
        </p>
        <p style={{ marginTop: "0.6rem" }}>
          Spørsmål om personvern kan rettes til Mathisens Morning Coffee Labs.
          Kontaktinformasjon vil publiseres på vår nettside.
        </p>
      </section>
    </main>
  );
}
