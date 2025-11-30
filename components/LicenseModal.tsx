// components/LicenseModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";

type LicenseModalProps = {
  open: boolean;
  onClose: () => void;
};

type Plan = "month" | "year";

const workerUrl =
  process.env.NEXT_PUBLIC_STRIPE_WORKER_URL as string | undefined;

const PRODUCT_ID = "formelsamling";

// TODO: Fyll inn faktiske firmadata før produksjon
const SELLER_NAME = "Morning Coffee Labs";
const SELLER_ORGNO = "ORGNR-HER"; // f.eks. 123 456 789
const SELLER_COUNTRY = "Norge";
const SELLER_EMAIL = "post@morningcoffeelabs.no";

export default function LicenseModal({ open, onClose }: LicenseModalProps) {
  const { basePath, lang } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("month");
  // IKKE abonnement som default – bruker må selv krysse av
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedWaiver, setAcceptedWaiver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isNO = lang === "no";

  // Nullstill state hver gang modalen åpnes
  useEffect(() => {
    if (open) {
      setBusy(false);
      setError(null);
      setIsSubscription(false);
      setAcceptedTerms(false);
      setAcceptedWaiver(false);
    }
  }, [open]);

  if (!open) return null;

  const planLabel = (plan: Plan) =>
    plan === "month"
      ? isNO
        ? "Månedslisens"
        : "Monthly license"
      : isNO
      ? "Årslisens"
      : "Yearly license";

  const planPriceLine = (plan: Plan) => {
    if (isNO) {
      return plan === "month"
        ? "49,- per måned (inkl. MVA)"
        : "490,- per år (inkl. MVA)";
    }
    return plan === "month"
      ? "NOK 49 / month (VAT included)"
      : "NOK 490 / year (VAT included)";
  };

  const subscriptionInfo = () => {
    if (!isSubscription) {
      return isNO
        ? "Dette blir et enkeltkjøp uten automatisk fornyelse."
        : "This will be a one-time purchase with no automatic renewal.";
    }
    if (selectedPlan === "month") {
      return isNO
        ? "Abonnementet fornyes automatisk hver måned til samme pris. Du kan stoppe fornyelsen når som helst via Stripe-kvittering eller kontosiden."
        : "The subscription renews automatically every month at the same price. You can cancel renewal at any time via the Stripe receipt or account page.";
    }
    // year
    return isNO
      ? "Abonnementet fornyes automatisk hvert år til samme pris. Du kan stoppe fornyelsen når som helst via Stripe-kvittering eller kontosiden."
      : "The subscription renews automatically every year at the same price. You can cancel renewal at any time via the Stripe receipt or account page.";
  };

  const legalHeading = isNO ? "Viktig informasjon før kjøp" : "Important information before purchase";

  const legalDigitalContent = isNO
    ? "Dette kjøpet gjelder digitalt innhold (programvare) som leveres umiddelbart. Når du ber om at leveringen starter nå, mister du angreretten etter angrerettloven § 22 bokstav n."
    : "This purchase is for digital content (software) that is provided immediately. When you ask us to start delivery now, you waive your right of withdrawal under EU consumer rules for digital content.";

  const waiverLabel = isNO
    ? "Jeg ber om at leveringen starter umiddelbart og forstår at angreretten bortfaller."
    : "I request immediate access and understand that my right of withdrawal will be waived.";

  const termsLabel = isNO
    ? "Jeg har lest og godtar kjøpsvilkår og personvernerklæring."
    : "I have read and accept the terms of purchase and the privacy policy.";

  const termsLinksLabel = isNO
    ? "Les vilkår og personvern:"
    : "Read terms and privacy:";

  const goToCheckoutLabel = () => {
    if (busy) {
      return isNO ? "Sender deg til betaling..." : "Redirecting to checkout...";
    }
    const price = planPriceLine(selectedPlan);
    if (isNO) {
      return `Gå til betaling – ${planLabel(selectedPlan)} (${price})`;
    }
    return `Proceed to checkout – ${planLabel(selectedPlan)} (${price})`;
  };

  const validateBeforeCheckout = (): boolean => {
    if (!acceptedWaiver) {
      setError(
        isNO
          ? "Du må samtykke til at angreretten bortfaller for å kunne gjennomføre kjøpet."
          : "You must consent to waiving the right of withdrawal in order to complete the purchase."
      );
      return false;
    }
    if (!acceptedTerms) {
      setError(
        isNO
          ? "Du må godta kjøpsvilkår og personvernerklæring før du kan gå videre."
          : "You must accept the terms of purchase and the privacy policy before continuing."
      );
      return false;
    }
    return true;
  };

  const handleGoToCheckout = async () => {
    setError(null);

    if (!validateBeforeCheckout()) {
      return;
    }

    if (!workerUrl) {
      setError(
        isNO
          ? "Stripe Worker URL mangler (NEXT_PUBLIC_STRIPE_WORKER_URL)."
          : "Stripe Worker URL is missing (NEXT_PUBLIC_STRIPE_WORKER_URL)."
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
        // Viktig: origin: "app" → worker velger riktig success/cancel-URL
        body: JSON.stringify({
          product: PRODUCT_ID,
          billingPeriod: selectedPlan,
          autoRenew: isSubscription,
          origin: "app",
          language: lang
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Worker error:", text);
        throw new Error(
          (isNO ? "Kunne ikke opprette Checkout-session" : "Could not create Checkout session") +
            ` (HTTP ${response.status}).`
        );
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error(
          isNO
            ? "Mottok ingen betalingslenke fra serveren."
            : "Did not receive a checkout URL from server."
        );
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          (isNO
            ? "Noe gikk galt ved opprettelse av betaling. Prøv igjen senere."
            : "Something went wrong while creating the payment. Please try again later.")
      );
      setBusy(false);
    }
  };

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
          maxWidth: "620px",
          width: "100%",
          padding: "1.5rem",
          borderRadius: 16,
          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
          background: "var(--mcl-surface)",
          color: "var(--mcl-text)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={isNO ? "Lukk" : "Close"}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.6rem",
            border: "none",
            background: "transparent",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "var(--mcl-muted)"
          }}
        >
          ✕
        </button>

        {/* Topp: logo + tittel */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "0.75rem"
          }}
        >
          <img
            src={`${basePath}/images/mcl-logo.png`}
            alt="Morning Coffee Labs"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <h2
            id="license-modal-title"
            style={{ margin: 0, fontSize: "1.2rem" }}
          >
            {isNO ? "Oppgrader til fullversjon" : "Upgrade to full version"}
          </h2>
        </div>

        {/* Hva får du? */}
        <p
          style={{
            fontSize: "0.9rem",
            marginTop: 0,
            marginBottom: "0.75rem"
          }}
        >
          {isNO
            ? "Med fullversjon får du:"
            : "With the full version you get:"}
        </p>
        <ul
          style={{
            fontSize: "0.85rem",
            marginTop: 0,
            marginBottom: "1rem",
            paddingLeft: "1.2rem"
          }}
        >
          <li>
            {isNO
              ? "Åpen kalkulator for alle formler"
              : "Full access to the calculator for all formulas"}
          </li>
          <li>
            {isNO
              ? "Utskrifter uten vannmerke"
              : "PDF exports without watermark"}
          </li>
          <li>
            {isNO
              ? "Løpende oppdateringer og nye formler"
              : "Ongoing updates and new formulas"}
          </li>
        </ul>

        {/* Selger / pris / planvalg */}
        <section
          style={{
            borderRadius: 12,
            padding: "0.75rem 0.9rem",
            background: "var(--mcl-bg-soft, rgba(15,23,42,0.4))",
            marginBottom: "0.9rem",
            fontSize: "0.8rem"
          }}
        >
          <p style={{ margin: 0, marginBottom: "0.2rem" }}>
            <strong>{isNO ? "Selger" : "Seller"}:</strong>{" "}
            {SELLER_NAME}{" "}
            {SELLER_ORGNO
              ? `(org.nr ${SELLER_ORGNO}, ${SELLER_COUNTRY})`
              : `(${SELLER_COUNTRY})`}
          </p>
          <p style={{ margin: 0, marginBottom: "0.2rem" }}>
            <strong>{isNO ? "Kontakt" : "Contact"}:</strong>{" "}
            <a
              href={`mailto:${SELLER_EMAIL}`}
              style={{ textDecoration: "underline" }}
            >
              {SELLER_EMAIL}
            </a>
          </p>
          <p style={{ margin: 0 }}>
            <strong>{isNO ? "Priser" : "Prices"}:</strong>{" "}
            {isNO
              ? "Alle priser vises i NOK og er inkludert merverdiavgift (MVA)."
              : "All prices are in NOK and include VAT."}
          </p>
        </section>

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
              {isNO ? "Månedslisens" : "Monthly license"}
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "0.15rem" }}>
              {planPriceLine("month")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--mcl-muted)" }}>
              {isNO
                ? "Passer hvis du vil teste appen over tid."
                : "Good if you want to test the app over time."}
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
              {isNO ? "Årslisens" : "Yearly license"}
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "0.15rem" }}>
              {planPriceLine("year")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--mcl-muted)" }}>
              {isNO
                ? "Best verdi hvis du bruker appen jevnlig."
                : "Best value if you use the app regularly."}
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
              style={{ marginTop: "0.1rem" }}
            />
            <span>
              {isNO ? (
                <>
                  Gjør dette til et <strong>abonnement</strong> (fornyes
                  automatisk via Stripe).
                  <br />
                  Når denne boksen ikke er krysset av, blir kjøpet behandlet
                  som et <strong>enkeltkjøp</strong> uten automatisk fornyelse.
                </>
              ) : (
                <>
                  Make this a <strong>subscription</strong> (auto-renews via
                  Stripe).
                  <br />
                  When this box is not checked, the purchase is treated as a{" "}
                  <strong>one-time payment</strong> with no automatic renewal.
                </>
              )}
            </span>
          </label>
          <p
            style={{
              marginTop: "0.45rem",
              fontSize: "0.8rem",
              color: "var(--mcl-muted)"
            }}
          >
            {subscriptionInfo()}
          </p>
        </div>

        {/* Juridisk seksjon */}
        <section
          style={{
            borderTop: "1px solid var(--mcl-outline-soft, #e5e7eb)",
            paddingTop: "0.75rem",
            marginTop: "0.5rem",
            marginBottom: "0.75rem"
          }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: "0.35rem",
              fontSize: "0.95rem"
            }}
          >
            {legalHeading}
          </h3>
          <p
            style={{
              fontSize: "0.8rem",
              marginTop: 0,
              marginBottom: "0.4rem"
            }}
          >
            {legalDigitalContent}
          </p>

          {/* Angrerett-samtykke */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.45rem",
              fontSize: "0.8rem",
              marginBottom: "0.4rem",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={acceptedWaiver}
              onChange={(e) => setAcceptedWaiver(e.target.checked)}
              style={{ marginTop: "0.1rem" }}
            />
            <span>{waiverLabel}</span>
          </label>

          {/* Vilkår / personvern */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.45rem",
              fontSize: "0.8rem",
              marginBottom: "0.35rem",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ marginTop: "0.1rem" }}
            />
            <span>{termsLabel}</span>
          </label>

          <p
            style={{
              fontSize: "0.8rem",
              marginTop: 0,
              marginBottom: 0
            }}
          >
            <strong>{termsLinksLabel}</strong>{" "}
            <a
              href={`${basePath}/vilkar/`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {isNO ? "Kjøpsvilkår" : "Terms of purchase"}
            </a>{" "}
            ·{" "}
            <a
              href={`${basePath}/personvern/`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {isNO ? "Personvernerklæring" : "Privacy policy"}
            </a>{" "}
            ·{" "}
            <a
              href={`${basePath}/angrerett/`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {isNO ? "Angrerett" : "Right of withdrawal"}
            </a>
          </p>
        </section>

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

        {/* Knapperad */}
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
              fontSize: "0.85rem"
            }}
          >
            {isNO ? "Avbryt" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleGoToCheckout}
            className="button"
            disabled={busy || !acceptedTerms || !acceptedWaiver}
            style={{
              borderRadius: 999,
              paddingInline: "1.1rem",
              fontSize: "0.9rem",
              background: "var(--mcl-brand)",
              color: "#fff",
              opacity: busy || !acceptedTerms || !acceptedWaiver ? 0.7 : 1,
              cursor:
                busy || !acceptedTerms || !acceptedWaiver
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {goToCheckoutLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
