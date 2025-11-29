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

export default function LicenseModal({ open, onClose }: LicenseModalProps) {
  const { basePath } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("month");
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
        // Viktig: Vi sender origin: "app" for å få riktig success/cancel-url
        body: JSON.stringify({
          product: PRODUCT_ID,
          billingPeriod: selectedPlan,
          autoRenew: isSubscription,
          origin: "app"
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk"
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
              Passer hvis du vil teste appen over tid.
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
              style={{ marginTop: "0.1rem" }}
            />
            <span>
              Gjør dette til et <strong>abonnement</strong> (fornyes automatisk
              via Stripe).
              <br />
              Når denne boksen ikke er krysset av, blir kjøpet behandlet som et{" "}
              <strong>enkeltkjøp</strong>.
            </span>
          </label>
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
              fontSize: "0.85rem"
            }}
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleGoToCheckout}
            className="button"
            disabled={busy}
            style={{
              borderRadius: 999,
              paddingInline: "1.1rem",
              fontSize: "0.9rem",
              background: "var(--mcl-brand)",
              color: "#fff",
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "wait" : "pointer"
            }}
          >
            {busy
              ? "Sender deg til betaling..."
              : `Gå til betaling – ${planLabel(selectedPlan)} (${planPrice(
                  selectedPlan
                )})`}
          </button>
        </div>
      </div>
    </div>
  );
}
