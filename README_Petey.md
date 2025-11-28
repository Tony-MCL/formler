🟩 OPPSTARTSMELDING – FORMELSAMLING v2 (RENT REPO)

(Lim hele denne inn i en ny tråd)

Hei!
Vi starter Formelsamling-appen helt på nytt i et rent repo, og bygger en ryddig, stabil, profesjonell versjon med:

✔ Next.js 14 (App Router)
✔ Firebase Auth (email/pass, hold-på-samme-enhet-login)
✔ Firestore (trial + paid-lisenssystem)
✔ Stripe-integrasjon via den eksisterende Cloudflare-workeren
✔ MCL-design, inkludert watermark for gratisversjon
✔ Kalkulator bak lisenskontroll
✔ Komplett "FormelVisning + Kalkulator + Info"-layout
✔ Progressiv flyt:

Trial (10 dager) → Free (uten kalkulator) → Paid (full)

Dette skal være min hoved-app, med ren, oversiktlig struktur, der jeg forstår hva som skjer og kan bygge videre selv.

🎯 Mål for prosjektet

Bygge hele app-strukturen ferdig i Next.js 14 App Router

Legge inn Firebase-klient, Auth-provider og lisens-system

Sette inn Formler, FormelVisning, Kalkulator

Bygge lisensstyring rundt kalkulatoren

Lage Watermark print-mode for free users

Lage ferdig layouts, sidebar, navigasjon og responsivt UI

Når alt er stabilt → koble Stripe-kjøp inn i appen (Oppgrader-knapper)

📦 App-struktur jeg ønsker (lag denne ved start)
/app
  /layout.tsx
  /page.tsx        (forside / formelvelger)
/components
  FormelVisning.tsx
  Kalkulator.tsx
  Sidebar.tsx
  LicensedKalkulator.tsx
  LicenseGate.tsx
/lib
  firebaseClient.ts
  formulas.ts       (alle formler, kategorier)
  types.ts
  license.ts        (helpers for Firestore-lisenser)
/styles
  globals.css
  mcl-theme.css     (MCL standardpalett)

🔐 Lisensmodell vi skal implementere
Trial

Opprettes automatisk når bruker logger inn for første gang

Varer i 10 dager

Full tilgang (kalkulator + ren print)

Free

Etter trial → gratis modus

Alle formler tilgjengelige

Kalkulator låst

PDF/print får vannmerke

Paid

Hvis Stripe-lisens i Firestore (status: active, paid: true)

Full tilgang uansett trial-status

Print uten watermark

Filtrering skjer slik:
hasPaid → "paid_full"
else if hasActiveTrial → "trial_full"
else → "free"

🔑 Login-modell

Firebase Auth

Email + passord

Pålogget beholdes per enhet

På ny enhet må bruker logge inn på nytt

Dette skal fungere 100% stabilt

🧩 Hva jeg ønsker at første leveranse i ny tråd skal inneholde

I første melding skal du bygge:

✔ Ren Next.js 14 App Router struktur
✔ Global layout + sidebar + enkel formelvisning placeholder
✔ Firebase-klient (firebaseClient.ts) ferdig satt opp
✔ Auth-provider (useAuth + AuthContext)
✔ Lisens-system (LicenseGate)
✔ Trial-opprettelse (10 dager)
✔ Access-level beregning (free / trial_full / paid_full)
✔ LicensedKalkulator wrapper
✔ Placeholder for Kalkulator som bare sier “Kalkulator (låst / åpen)”
✔ Stylet i MCL mørk tema med watermark i free mode

Altså: hele fundamentet klart før vi legger inn faktiske formler.

🛠 Videre steg etter første leveranse

Når fundamentet er levert:

Deretter legger vi inn:

FormelVisning med faktisk innhold

Kalkulatoren (ekte)

MathText

Mobilvisning

PrintEngine med watermark-støtte

Stripe-knapp for “Oppgrader”

📝 Tiltak for å unngå rot fra nå av

I dette nye prosjektet skal du:

Alltid levere ferdige komplette filer

Aldri gjøre “halv patches”

Alltid sørge for at repoet bygger uten feil før vi går videre

Alltid sjekke import-paths og filstrukturer før du leverer

Kontrollere alt vi bygger modul for modul

Ingen tilfeldige ekstra filer

Holde strukturen identisk hver gang
