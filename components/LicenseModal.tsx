"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { useLicense } from "../lib/license";

type LicenseModalProps = {
  open: boolean;
  onClose: () => void;
};

type Plan = "month" | "year";

const workerUrl =
  process.env.NEXT_PUBLIC_STRIPE_WORKER_URL as string | undefined;

const PRODUCT_ID = "formelsamling";

export default function LicenseModal({ open, onClose }: LicenseModalProps) {
  const { basePath } = useI18n();
  const license = useLicense();

  const [selectedPlan, setSelectedPlan] = useState<Plan>("month");
  const [email, setEmail] = useState("");
  // IKKE abonnement som default – bruker må selv krysse av
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Nullstill state hver gang modalen åpnes
  useEffect(() => {
    if (open) {
      setBusy(false);
      setError(null);
      // Vi lar valgt plan bli stående, men sørger for at brukeren
      // alltid aktivt må skru på abonnement på nytt.
      setIsSubscription(false);
    }
  }, [open]);

  if (!open) return null;

  const handleGoToCheckout = async () => {
    setError(null);

    const trimmedEmail = (email || "").trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Skriv inn e-postadressen din før du går til betaling.");
      return;
    }

    // Knytt e-posten til lisenssystemet før vi sender brukeren til Stripe
    license.linkEmail(trimmedEmail);

    if (!workerUrl) {
      setError(
        "Stripe Worker URL mangler (NEXT_PUBLIC_STRIPE_WORKER_URL)."
      );
      return;
    }

    try {
      setBusy(true);

      const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Viktig: Vi sender origin: "app" + eksplisitte success/cancel-URLer
        body: JSON.stringify({
          product: PRODUCT_ID,
          billingPeriod: selectedPlan,
          autoRenew: isSubscription,
          origin: "app",
          successUrl:
            typeof window !== "undefined"
              ? `${window.location.origin}${window.location.pathname}?status=success`
              : undefined,
          cancelUrl:
            typeof window !== "undefined"
              ? `${window.location.origin}${window.location.pathname}#license`
              : undefined
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Worker error:", text);
        throw new Error(
          `Kunne ikke opprette Checkout-session (HTTP ${response.status}).`
        );
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error("Mottok ingen betalingslenke fra serveren.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Noe gikk galt ved opprettelse av betaling. Prøv igjen senere."
      );
      setBusy(false);
    }
  };

  const planLabel = (plan: Plan) =>
    plan === "month" ? "Månedslisens" : "Årslisens";

  const planPrice = (plan: Plan) =>
    plan === "month" ? "49,- per måned" : "490,- per år";

  return (
    <div
      className="no-print"
      aria-modal="true"
      role="dialog"
      aria-labelledby="license-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          position: "relative",
          maxWidth: "520px",
          width: "100%",
          padding: "1.5rem",
          borderRadius: 16,
          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
          background: "var(--mcl-surface)",
          color: "var(--mcl-text)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close-knapp */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk"
          className="button"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            borderRadius: 999,
            paddingInline: "0.6rem",
            paddingBlock: "0.2rem",
            fontSize: "0.8rem",
            lineHeight: 1
          }}
        >
          ✕
        </button>

        {/* Tittel + logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem"
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background:
                "radial-gradient(circle at 30% 20%, #fde68a, #f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
            }}
          >
            <img
              src={`${basePath}/images/mcl-logo-round.png`}
              alt="Mathisens Morning Coffee Labs"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>
          <h2
            id="license-modal-title"
            style={{ margin: 0, fontSize: "1.2rem" }}
          >
            Oppgrader til fullversjon
          </h2>
        </div>

        <p style={{ fontSize: "0.9rem", marginTop: 0, marginBottom: "0.75rem" }}>
          Med fullversjon får du:
        </p>
        <ul
          style={{
            fontSize: "0.85rem",
            marginTop: 0,
            marginBottom: "1rem",
            paddingLeft: "1.2rem"
          }}
        >
          <li>Åpen kalkulator for alle formler</li>
          <li>Utskrifter uten vannmerke</li>
          <li>Løpende oppdateringer og nye formler</li>
        </ul>

        {/* E-post som lisensen knyttes til */}
        <div
          style={{
            marginBottom: "0.9rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}
        >
          <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            E-postadresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din.epost@firma.no"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--mcl-outline)",
              background: "var(--mcl-bg)",
              color: "var(--mcl-text)",
              fontSize: "0.9rem"
            }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              margin: 0,
              color: "var(--mcl-muted)"
            }}
          >
            Vi bruker denne e-posten til å finne lisensen din etter kjøp. Den
            må være den samme som du skriver inn i Stripe-betalingen.
          </p>
        </div>

        {/* Planvalg */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
            marginBottom: "0.9rem"
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedPlan("month")}
            style={{
              borderRadius: 12,
              border:
                selectedPlan === "month"
                  ? "2px solid var(--mcl-brand)"
                  : "1px solid var(--mcl-outline)",
              padding: "0.75rem",
              textAlign: "left",
              cursor: "pointer",
              background:
                selectedPlan === "month"
                  ? "rgba(139, 92, 246, 0.08)"
                  : "var(--mcl-bg)"
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.25rem",
                fontSize: "0.95rem"
              }}
            >
              Månedslisens
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "0.15rem" }}>
              49,- per måned
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--mcl-muted)" }}>
              Fleksibelt – passer hvis du vil teste over tid.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("year")}
            style={{
              borderRadius: 12,
              border:
                selectedPlan === "year"
                  ? "2px solid var(--mcl-brand)"
                  : "1px solid var(--mcl-outline)",
              padding: "0.75rem",
              textAlign: "left",
              cursor: "pointer",
              background:
                selectedPlan === "year"
                  ? "rgba(139, 92, 246, 0.08)"
                  : "var(--mcl-bg)"
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.25rem",
                fontSize: "0.95rem"
              }}
            >
              Årslisens
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "0.15rem" }}>
              490,- per år
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--mcl-muted)" }}>
              Best verdi hvis du bruker appen jevnlig.
            </div>
          </button>
        </div>

        {/* Abonnement vs engangskjøp */}
        <div
          style={{
            marginBottom: "0.9rem",
            fontSize: "0.85rem"
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.45rem",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={isSubscription}
              onChange={(e) => setIsSubscription(e.target.checked)}
              style={{ marginTop: "0.15rem" }}
            />
            <span>
              <strong>Abonnement</strong> – fornyes automatisk hver{" "}
              {selectedPlan === "month" ? "måned" : "år"}. Du kan si opp når som
              helst via Stripe-kvitteringen.
              <br />
              Når denne boksen ikke er krysset av, blir kjøpet behandlet som et{" "}
              <strong>enkeltkjøp</strong>.
            </span>
          </label>
        </div>

        {/* Lovpålagt info – kortversjon */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--mcl-muted)",
            marginBottom: "0.75rem",
            lineHeight: 1.4
          }}
        >
          <p style={{ margin: 0, marginBottom: "0.35rem" }}>
            Leverandør: <strong>Mathisens Morning Coffee Labs</strong>.
          </p>
          <p style={{ margin: 0, marginBottom: "0.35rem" }}>
            Priser er inkl. MVA. Betaling håndteres av Stripe.
          </p>
          <p style={{ margin: 0, marginBottom: "0.35rem" }}>
            Ved kjøp av digitalt innhold som leveres umiddelbart, samtykker du
            til at angreretten faller bort når betalingen er fullført.
          </p>
          <p style={{ margin: 0 }}>
            Les{" "}
            <a
              href={`${basePath}/vilkar`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              kjøpsvilkår
            </a>
            ,{" "}
            <a
              href={`${basePath}/angrerett`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              informasjon om angrerett
            </a>{" "}
            og{" "}
            <a
              href={`${basePath}/personvern`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              personvernerklæring
            </a>
            .
          </p>
        </div>

        {error && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--mcl-error, #b91c1c)",
              marginBottom: "0.75rem"
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "0.5rem"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="button"
            style={{
              borderRadius: 999,
              paddingInline: "0.9rem",
              fontSize: "0.9rem"
            }}
            disabled={busy}
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleGoToCheckout}
            className="button"
            style={{
              borderRadius: 999,
              paddingInline: "1.2rem",
              fontSize: "0.9rem",
              background: "var(--mcl-brand)",
              color: "#fff",
              opacity: busy ? 0.8 : 1
            }}
            disabled={busy}
          >
            {busy ? "Sender deg til betaling …" : "Gå til betaling"}
          </button>
        </div>
      </div>
    </div>
  );
}
