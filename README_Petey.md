┌────────────────────────────────────────────────────────────┐
│                       1. Bruker åpner app                  │
└────────────────────────────────────────────────────────────┘
                 │
                 ▼
      ┌─────────────────────────────┐
      │   Lokal lisens sjekkes      │
      │   (token i localStorage)    │
      └─────────────────────────────┘
                 │
      ┌──────────┼──────────┐
      ▼                     ▼
[GYLDIG TOKEN]       [INGEN / UGYLDIG TOKEN]
      │                       │
      ▼                       ▼
Fullversjon åpnes       Gratisversjon åpnes
                          (kalkulator/PDF låst)
                          │
                          ▼
                Bruker åpner Lisensdialog
                          │
                          ▼
     ┌───────────────────────────────────────────┐
     │         2. Bruker velger lisens:          │
     │   - Abonnement (måned / år)               │
     │   - Engangskjøp (måned / år)              │
     └───────────────────────────────────────────┘
                          │
                          ▼
          ┌────────────────────────────────┐
          │      3. Stripe Checkout        │
          └────────────────────────────────┘
                          │
                          ▼
           Betaling gjennomføres i Stripe
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Stripe Webhook → Cloudflare Worker → Firestore License  │
│    - Kjøp registreres                                      │
│    - Utløpsdato settes                                     │
│    - Token genereres                                       │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
      ┌──────────────────────────────────────┐
      │5. App returnerer med ?status=success │
      └──────────────────────────────────────┘
                          │
                          ▼
              App kjører license.refresh()
                          │
                          ▼
           Ny lisens hentes fra Firestore
                          │
                          ▼
     Token lagres lokalt (localStorage → persistent)
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│                     FULLVERSJON ÅPNET                         │
│   - Kalkulator aktiv                                          │
│   - PDF uten watermark                                        │
│   - Klart for fremtidige MCL-apptokens                        │
└───────────────────────────────────────────────────────────────┘

                             Fornyelsesflyt:

┌────────────────────┐
│  App åpnes         │
└────────────────────┘
          │
          ▼
   Sjekk token expiry
          │
     ┌────┴─────┐
     ▼          ▼
  Ikke utløpt   Utløpt
     │          │
     ▼          ▼
     OK      license.refresh()
               │
     ┌─────────┼─────────┐
     ▼                   ▼
Stripe aktiv      Stripe inaktiv / kjøp utløpt
     │                   │
     ▼                   ▼
Forny token       Gå tilbake til gratisversjon
