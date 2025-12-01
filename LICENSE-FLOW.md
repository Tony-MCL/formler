☕ LICENSE-FLOW.md

Morning Coffee Labs – Standard Lisensflyt (Token-basert modell + fallback)
Gjeldende modell for ALLE MCL-apper (2025 →).

📌 Kort forklart

Lisenssystemet i alle apps bruker Stripe → Cloudflare Worker → LicToken → lokal validering.

Primærmodell:
✔ Tokenmodell via Cloudflare Worker
Fallback:
✔ Trial
✔ E-postbasert lisenssjekk via Firestore (legacy)

Dette dokumentet beskriver hvordan dette fungerer og hva som må settes opp hver gang en ny app skal bruke lisenssystemet.

1) Arkitektur (den store sammenhengen)
App  →  LicenseModal  →  Worker (/create-checkout-session)
                                  ↓
                     Stripe Checkout (betaling)
                                  ↓ redirect
App  ←  ?status=success&session_id=... 
                                  ↓
App  → Worker (/issue-lic-token) → TOKEN → localStorage
                                  ↓
App  → Worker (/verify-lic-token) → validering ved oppstart
                                  ↓
App = PRO / TRIAL / FREE


Alt dette skjer uten backend.
Appen ligger på GitHub Pages.
Only Worker + Stripe holder orden på lisensene.

2) Miljøvariabler (ALLTID nødvendig i appen)

I .env.local:

NEXT_PUBLIC_STRIPE_WORKER_URL=https://<worker-url>/create-checkout-session

# brukes kun av e-post fallback:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...


Kun den første er kritisk for token-modellen.

3) Filsett (kopieres inn i hvert nytt prosjekt)

Hver app trenger følgende filer:

✔ lib/license.tsx

Hele lisensmotoren:

tokenhåndtering

trial

fallback

validate token

✔ components/LicenseModal.tsx

Popup med:

kjøp lisens

aktiver lisens via e-post

start trial

✔ components/LicenseDebug.tsx

Viser:

tier

token finnes?

token validering

fallback-status

Obligatorisk når vi utvikler.
Skjules i produksjon.

✔ app/layout.tsx

MÅ wrappe appen i:

<I18nProvider>
  <LicenseProvider>
    {children}
  </LicenseProvider>
</I18nProvider>

✔ app/page.tsx (eller HomePage.jsx)

MÅ ha:

session-capture:

?status=success&session_id=...


kall til /issue-lic-token

lagring av token i localStorage

redirect for å fjerne session_id

visning av LicenseModal

4) Token-håndtering i appen
Token lagres under (per app):
mcl_<appnavn>_licToken_v1


Eksempler:

Formelsamling: mcl_fm_licToken_v1

ManageProgress: mcl_progress_licToken_v1

Befaringsapp: mcl_befaring_licToken_v1

Token valideres ved oppstart:
POST /verify-lic-token
Body: { licToken: "<token>" }


Svar:

{ ok: true, payload: { product: "...", ... } }

5) Flyt i appen (når bruker returnerer fra Stripe)
1) App finner session_id:
const sessionId = url.searchParams.get("session_id")

2) Hvis finnes → kall worker:
POST /issue-lic-token

3) Worker returnerer:
{ ok: true, token: "....", payload: {...} }

4) App lagrer token:
localStorage.setItem(LICENSE_TOKEN_STORAGE_KEY, token)

5) App renser URL:

Fjerner session_id og status.

6) App re-kjører lisensrefresh:
license.refresh();

6) Prioritetsrekkefølge for lisensstatus (standard i alle apper)

Lisensene regnes ut i denne rekkefølgen:

1. Token (PRO)

Gyldig token = Fullversjon

2. Lokal trial (TRIAL)

Trial lagres i localStorage:

mcl_<app>_trial_v1

3. Fallback til Firestore e-post

Brukes hvis:

ingen token

ingen aktiv trial

bruker har lagt inn lisens-e-post

4. Ellers → FREE
7) Cloudflare Worker – hva den må kunne

Worker må ha 3 endepunkter:

POST /create-checkout-session
POST /issue-lic-token
POST /verify-lic-token


Den må ha:

Stripe secret key

Signing key (brukes til å signere tokens)

prodName → “formelsamling” / “progress” / “befaring” osv.

CORS whitelist for GH Pages

8) Hvilke ting jeg MÅ vite når vi skal integrere lisenssystemet i en ny app

Når du starter en ny lisensintegrasjon, gi meg følgende:

✔ 1. Appnavn / produktnavn

Eksempel:

formelsamling

manageprogress

befaring

Brukes i:

token payload

Firestore fallback

storage keys

✔ 2. Token-key prefix

Jeg lager:

mcl_<appnavn>_licToken_v1

✔ 3. Stripe-produkter som gjelder for denne appen

Eksempel:

product = "formelsamling"
product = "manageprogress"
product = "befaring"

✔ 4. URL for lisensportalen (fra nettsiden)

Eksempel:

https://morningcoffeelabs.com/formler/lisens

✔ 5. Stripe Worker URL

Den brukes som:

NEXT_PUBLIC_STRIPE_WORKER_URL=https://.../create-checkout-session

9) Superkort utvikleroppsummering (til ChatGPT når vi jobber)

Når vi skal legge lisensflyt i en ny app:

Her er lisensinfo for denne appen:

APP_NAVN = "<navn>"
PRODUCT_ID = "<stripe/firestore product name>"
LICENSE_KEY = "mcl_<navn>_licToken_v1"
STRIPE_WORKER_URL = "<url>/create-checkout-session"

Bruk standard MCL lisensflyt (token + trial + fallback)
Kopier lisensfiler fra Formelsamling
Oppdater kun produktnavn og storage key

10) Lisens-flyt diagram (ASCII-versjon)
             ┌─────────────────────┐
             │   Bruker i appen    │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │ Kjøp lisens modal   │
             └──────────┬──────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │ Cloudflare Worker (checkout) │
         └───────┬──────────────────────┘
                 │
                 ▼
         ┌──────────────────────────────┐
         │      Stripe Checkout         │
         └───────┬──────────────────────┘
                 │ returnerer
                 ▼ redirect
 ┌───────────────────────────┐
 │ App fanger opp session_id │
 └──────┬────────────────────┘
        │
        ▼
 ┌──────────────────────────────┐
 │ Worker: /issue-lic-token     │
 └──────┬───────────────────────┘
        │ token
        ▼
 ┌───────────────────────────┐
 │ Lagring i localStorage    │
 └──────┬────────────────────┘
        │
        ▼
 ┌───────────────────────────┐
 │ App/Provider → /verify    │
 └──────┬────────────────────┘
        │
        ▼
    ┌─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
  PRO       TRIAL     EMAIL     FREE
(token)  (local trial)(fallback)

