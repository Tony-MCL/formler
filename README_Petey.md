┌────────────────────────────────────────────────────────────┐
│                        1. Bruker åpner app                 │
└────────────────────────────────────────────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Lokal lisens sjekkes │  (localStorage token)
      └──────────────────────┘
                 │
      ┌──────────┼───────────┐
      ▼                      ▼
[GYLDIG TOKEN]        [INGEN/UGYLDIG TOKEN]
      │                      │
      ▼                      ▼
Fullversjon åpnes      Gratisversjon vises
                        (kalkulator/PDF låst)
                        │
                        ▼
             Bruker åpner Lisensdialog
                        │
                        ▼
      ┌──────────────────────────────────────┐
      │  2. Bruker velger:                   │
      │   - Abonnement (måned/år)            │
      │   - Engangskjøp (måned/år)           │
      └──────────────────────────────────────┘
                        │
                        ▼
        ┌────────────────────────────────┐
        │    3. Stripe Checkout åpnes    │
        └────────────────────────────────┘
                        │
                        ▼
           Bruker gjennomfører betaling
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│  4. Stripe → Cloudflare Worker → Firestore licens opprettes │
│         (Stripe webhook + signert lisens-token)            │
└────────────────────────────────────────────────────────────┘
                        │
                        ▼
      ┌──────────────────────────────────┐
      │  5. App reloads med ?status=success │
      └──────────────────────────────────┘
                        │
                        ▼
           App kaller license.refresh()
                        │
                        ▼
          Ny lisens hentes fra Firestore
                        │
                        ▼
     Token lagres lokalt (localStorage)
                        │
                        ▼
   ┌────────────────────────────────────────────┐
   │             FULLVERSJON ÅPEN             │
   │  - Kalkulator aktiv                      │
   │  - PDF uten watermark                    │
   │  - Fremtidige MCL-apper kan unlockes     │
   └────────────────────────────────────────────┘
