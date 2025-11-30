"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { useLicense } from "../lib/license";

type LicenseModalProps = {
  open: boolean;
  onClose: () => void;
};

type Plan = "month" | "year";
type BuyerType = "company" | "person";

const workerUrl =
  process.env.NEXT_PUBLIC_STRIPE_WORKER_URL as string | undefined;

const PRODUCT_ID = "formelsamling";

// TODO: Sett korrekt navn og org.nr før produksjon
const SELLER_NAME = "Mathisens Morning Coffee Labs";
const SELLER_ORG_NR = "Org.nr 000 000 000";

type CustomerInfo = {
  buyerType: BuyerType;
  companyName: string;
  orgNumber: string;
  contactName: string;
  personName: string;
  email: string;
  country: string;
  reference: string;
};

export default function LicenseModal({ open, onClose }: LicenseModalProps) {
  const { basePath, lang } = useI18n();
  const license = useLicense();

  const [selectedPlan, setSelectedPlan] = useState<Plan>("month");
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);

  const [acceptedAngrerett, setAcceptedAngrerett] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    buyerType: "company",
    companyName: "",
    orgNumber: "",
    contactName: "",
    personName: "",
    email: "",
    country: "NO",
    reference: ""
  });

  // Nullstill state hver gang modalen åpnes
  useEffect(() => {
    if (open) {
      setBusy(false);
      setError(null);
      setIsSubscription(false);
      setStep(1);
      setAcceptedAngrerett(false);
      setAcceptedTerms(false);
      setCustomerInfo((prev) => ({
        ...prev,
        email: prev.email || "",
        country: prev.country || "NO"
      }));
    }
  }, [open]);

  if (!open) return null;

  const planLabel = (plan: Plan) =>
    plan === "month" ? "Månedslisens" : "Årslisens";

  const planPrice = (plan: Plan) =>
    plan === "month" ? "49,- per måned (inkl. MVA)" : "490,- per år (inkl. MVA)";

  const billingDescription = () =>
    isSubscription
      ? selectedPlan === "month"
        ? "Abonnement, fornyes automatisk hver måned."
        : "Abonnement, fornyes automatisk hvert år."
      : selectedPlan === "month"
      ? "Engangskjøp av én måneds lisens, uten automatisk fornyelse."
      : "Engangskjøp av ett års lisens, uten automatisk fornyelse.";

  const handleChangeCustomer = <K extends keyof CustomerInfo>(
    key: K,
    value: CustomerInfo[K]
  ) => {
    setCustomerInfo((prev) => ({ ...prev, [key]: value }));
  };

  const canGoToStep2 =
    acceptedAngrerett && acceptedTerms && !busy && !!selectedPlan;

  const validateCustomerInfo = (): string | null => {
    const info = customerInfo;
    const email = info.email.trim();

    if (!email) {
      return "Skriv inn e-postadressen som skal knyttes til lisensen.";
    }

    if (info.buyerType === "company") {
      if (!info.companyName.trim()) {
        return "Skriv inn firmanavn.";
      }
      if (!info.orgNumber.trim()) {
        return "Skriv inn organisasjonsnummer.";
      }
    } else {
      if (!info.personName.trim()) {
        return "Skriv inn navn.";
      }
    }

    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (!canGoToStep2) return;
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setError(null);
    if (busy) return;
    setStep(1);
  };

  const handleSubmitAndCheckout = async () => {
    setError(null);

    if (!workerUrl) {
      setError("Stripe Worker URL mangler (NEXT_PUBLIC_STRIPE_WORKER_URL).");
      return;
    }

    const validationError = validateCustomerInfo();
    if (validationError) {
      setError(validationError);
      return;
    }

    const info = customerInfo;
    const email = info.email.trim();

    try {
      setBusy(true);

      // Lagre e-post lokalt slik at lisensoppslag / validering har en identitet
      license.linkEmail(email);

      const body = {
        product: PRODUCT_ID,
        billingPeriod: selectedPlan,
        autoRenew: isSubscription,
        origin: "app",
        lang,
        customer: {
          buyerType: info.buyerType,
          companyName: info.companyName.trim() || null,
          orgNumber: info.orgNumber.trim() || null,
          contactName:
            (info.buyerType === "company"
              ? info.contactName.trim()
              : info.personName.trim()) || null,
          personName: info.buyerType === "person"
            ? info.personName.trim() || null
            : null,
          email,
          country: info.country || "NO",
          reference: info.reference.trim() || null
        }
      };

      const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
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
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "var(--mcl-surface)",
          color: "var(--mcl-text)",
          borderRadius: 16,
          boxShadow: "var(--elev-3)",
          maxWidth: 720,
          width: "100%",
          margin: "0 1rem",
          padding: "1.2rem 1.4rem",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "0.75rem",
            marginBottom: "0.75rem"
          }}
        >
          <div>
            <h2
              id="license-modal-title"
              style={{ margin: 0, fontSize: "1.2rem" }}
            >
              Kjøp lisens til Digital Formelsamling
            </h2>
            <p
              style={{
                margin: "0.3rem 0 0",
                fontSize: "0.9rem",
                color: "var(--mcl-muted)"
              }}
            >
              Selger: <strong>{SELLER_NAME}</strong> – {SELLER_ORG_NR}
            </p>
          </div>

          <button
            type="button"
            className="button ghost"
            onClick={onClose}
            disabled={busy}
            aria-label="Lukk"
            style={{
              paddingInline: "0.6rem",
              borderRadius: 999
            }}
          >
            ✕
          </button>
        </header>

        {/* STEG-INDIKATOR */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.9rem",
            fontSize: "0.8rem"
          }}
        >
          <span
            style={{
              padding: "0.1rem 0.6rem",
              borderRadius: 999,
              background:
                step === 1 ? "var(--mcl-brand)" : "var(--mcl-outline-soft)",
              color: step === 1 ? "#fff" : "var(--mcl-text)"
            }}
          >
            1. Valg av lisens og vilkår
          </span>
          <span
            style={{
              padding: "0.1rem 0.6rem",
              borderRadius: 999,
              background:
                step === 2 ? "var(--mcl-brand)" : "var(--mcl-outline-soft)",
              color: step === 2 ? "#fff" : "var(--mcl-text)"
            }}
          >
            2. Kundeinformasjon
          </span>
        </div>

        {step === 1 && (
          <>
            {/* STEG 1: VALG AV LISENS + VILKÅR */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1rem"
              }}
            >
              {/* Måned */}
              <button
                type="button"
                onClick={() => setSelectedPlan("month")}
                style={{
                  textAlign: "left",
                  borderRadius: 12,
                  border:
                    selectedPlan === "month"
                      ? "2px solid var(--mcl-brand)"
                      : "1px solid var(--mcl-outline)",
                  padding: "0.7rem 0.8rem",
                  background:
                    selectedPlan === "month"
                      ? "rgba(0, 0, 0, 0.03)"
                      : "transparent",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: "0.2rem"
                      }}
                    >
                      {planLabel("month")}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--mcl-muted)"
                      }}
                    >
                      Fleksibel lisens – kort horisont.
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600
                    }}
                  >
                    {planPrice("month")}
                  </div>
                </div>
              </button>

              {/* År */}
              <button
                type="button"
                onClick={() => setSelectedPlan("year")}
                style={{
                  textAlign: "left",
                  borderRadius: 12,
                  border:
                    selectedPlan === "year"
                      ? "2px solid var(--mcl-brand)"
                      : "1px solid var(--mcl-outline)",
                  padding: "0.7rem 0.8rem",
                  background:
                    selectedPlan === "year"
                      ? "rgba(0, 0, 0, 0.03)"
                      : "transparent",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: "0.2rem"
                      }}
                    >
                      {planLabel("year")}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--mcl-muted)"
                      }}
                    >
                      For deg som vet at du vil bruke appen jevnlig.
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600
                    }}
                  >
                    {planPrice("year")}
                  </div>
                </div>
              </button>
            </section>

            {/* Abonnement / engangskjøp */}
            <section
              style={{
                marginBottom: "0.9rem",
                padding: "0.7rem 0.8rem",
                borderRadius: 12,
                border: "1px solid var(--mcl-outline-soft)"
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                />
                <span>Gjør dette til et løpende abonnement</span>
              </label>
              <p
                style={{
                  marginTop: "0.4rem",
                  marginBottom: 0,
                  fontSize: "0.8rem",
                  color: "var(--mcl-muted)"
                }}
              >
                {billingDescription()}
              </p>
            </section>

            {/* Lovpålagt info */}
            <section style={{ marginBottom: "0.9rem", fontSize: "0.85rem" }}>
              <p style={{ margin: "0 0 0.3rem" }}>
                Før du går videre til betaling må vi opplyse om:
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Du kjøper lisens til <strong>digitalt innhold</strong> levert
                  av {SELLER_NAME}.
                </li>
                <li>
                  Prisen vises <strong>inkludert MVA</strong>.
                </li>
                <li>
                  Lisensen blir tilgjengelig umiddelbart etter gjennomført
                  betaling.
                </li>
                <li>
                  For privatkunder gjelder angrerettloven. For at vi skal kunne
                  aktivere lisensen umiddelbart, må du samtykke til at{" "}
                  <strong>angreretten bortfaller</strong> når lisensen tas i
                  bruk.
                </li>
              </ul>
            </section>

            {/* Samtykker */}
            <section
              style={{
                marginBottom: "0.9rem",
                padding: "0.7rem 0.8rem",
                borderRadius: 12,
                border: "1px solid var(--mcl-outline-soft)"
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginBottom: "0.4rem"
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptedAngrerett}
                  onChange={(e) => setAcceptedAngrerett(e.target.checked)}
                  style={{ marginTop: "0.15rem" }}
                />
                <span>
                  Jeg ber om at lisensen aktiveres umiddelbart, og forstår at{" "}
                  <strong>angreretten bortfaller</strong> når lisensen er tatt
                  i bruk.
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: "0.15rem" }}
                />
                <span>
                  Jeg har lest og godtar{" "}
                  <a
                    href={`${basePath}/vilkar`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    lisens- og kjøpsvilkår
                  </a>{" "}
                  og{" "}
                  <a
                    href={`${basePath}/personvern`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    personvernerklæringen
                  </a>
                  .
                </span>
              </label>
            </section>

            {/* Feil */}
            {error && (
              <div
                style={{
                  marginBottom: "0.6rem",
                  fontSize: "0.85rem",
                  color: "var(--mcl-error, #b91c1c)"
                }}
              >
                {error}
              </div>
            )}

            {/* Knapperekke */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem"
              }}
            >
              <button
                type="button"
                className="button ghost"
                onClick={onClose}
                disabled={busy}
                style={{ borderRadius: 999, paddingInline: "0.9rem" }}
              >
                Avbryt
              </button>
              <button
                type="button"
                className="button"
                onClick={handleNextStep}
                disabled={!canGoToStep2}
                style={{
                  borderRadius: 999,
                  paddingInline: "1.1rem",
                  background: "var(--mcl-brand)",
                  color: "#fff",
                  opacity: canGoToStep2 ? 1 : 0.6,
                  cursor: canGoToStep2 ? "pointer" : "not-allowed"
                }}
              >
                Neste – Kundeinformasjon
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* STEG 2: KUNDEINFO */}
            <section style={{ marginBottom: "0.9rem", fontSize: "0.9rem" }}>
              <p style={{ margin: "0 0 0.4rem" }}>
                Vi trenger noen opplysninger om deg / bedriften for kvittering,
                fakturagrunnlag og lisenshåndtering.
              </p>

              {/* Kjøper-type */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "0.7rem",
                  flexWrap: "wrap"
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="buyerType"
                    value="company"
                    checked={customerInfo.buyerType === "company"}
                    onChange={() =>
                      handleChangeCustomer("buyerType", "company")
                    }
                  />
                  <span>Bedrift / virksomhet</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="buyerType"
                    value="person"
                    checked={customerInfo.buyerType === "person"}
                    onChange={() =>
                      handleChangeCustomer("buyerType", "person")
                    }
                  />
                  <span>Privatperson</span>
                </label>
              </div>

              {/* Felter */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: "0.6rem"
                }}
              >
                {customerInfo.buyerType === "company" ? (
                  <>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "0.85rem",
                        gap: "0.2rem"
                      }}
                    >
                      <span>Firmanavn *</span>
                      <input
                        type="text"
                        value={customerInfo.companyName}
                        onChange={(e) =>
                          handleChangeCustomer(
                            "companyName",
                            e.target.value
                          )
                        }
                        placeholder="F.eks. Kraftsystem AS"
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderRadius: 8,
                          border: "1px solid var(--mcl-outline)",
                          fontSize: "0.9rem"
                        }}
                      />
                    </label>

                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "0.85rem",
                        gap: "0.2rem"
                      }}
                    >
                      <span>Organisasjonsnummer *</span>
                      <input
                        type="text"
                        value={customerInfo.orgNumber}
                        onChange={(e) =>
                          handleChangeCustomer("orgNumber", e.target.value)
                        }
                        placeholder="F.eks. 999 999 999"
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderRadius: 8,
                          border: "1px solid var(--mcl-outline)",
                          fontSize: "0.9rem"
                        }}
                      />
                    </label>

                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "0.85rem",
                        gap: "0.2rem"
                      }}
                    >
                      <span>Kontaktperson</span>
                      <input
                        type="text"
                        value={customerInfo.contactName}
                        onChange={(e) =>
                          handleChangeCustomer(
                            "contactName",
                            e.target.value
                          )
                        }
                        placeholder="Navn på kontaktperson"
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderRadius: 8,
                          border: "1px solid var(--mcl-outline)",
                          fontSize: "0.9rem"
                        }}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "0.85rem",
                        gap: "0.2rem"
                      }}
                    >
                      <span>Navn *</span>
                      <input
                        type="text"
                        value={customerInfo.personName}
                        onChange={(e) =>
                          handleChangeCustomer(
                            "personName",
                            e.target.value
                          )
                        }
                        placeholder="F.eks. Ola Nordmann"
                        style={{
                          padding: "0.4rem 0.6rem",
                          borderRadius: 8,
                          border: "1px solid var(--mcl-outline)",
                          fontSize: "0.9rem"
                        }}
                      />
                    </label>
                  </>
                )}

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.85rem",
                    gap: "0.2rem"
                  }}
                >
                  <span>E-postadresse *</span>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      handleChangeCustomer("email", e.target.value)
                    }
                    placeholder="navn@firma.no"
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: 8,
                      border: "1px solid var(--mcl-outline)",
                      fontSize: "0.9rem"
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.85rem",
                    gap: "0.2rem"
                  }}
                >
                  <span>Land</span>
                  <select
                    value={customerInfo.country}
                    onChange={(e) =>
                      handleChangeCustomer("country", e.target.value)
                    }
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: 8,
                      border: "1px solid var(--mcl-outline)",
                      fontSize: "0.9rem"
                    }}
                  >
                    <option value="NO">Norge</option>
                    <option value="SE">Sverige</option>
                    <option value="DK">Danmark</option>
                    <option value="FI">Finland</option>
                    <option value="IS">Island</option>
                    <option value="DE">Tyskland</option>
                    <option value="GB">Storbritannia</option>
                    <option value="US">USA</option>
                    <option value="EU">Annet EU/EØS-land</option>
                    <option value="OTHER">Andre land</option>
                  </select>
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.85rem",
                    gap: "0.2rem"
                  }}
                >
                  <span>Referanse (valgfritt)</span>
                  <input
                    type="text"
                    value={customerInfo.reference}
                    onChange={(e) =>
                      handleChangeCustomer("reference", e.target.value)
                    }
                    placeholder="Deres referanse / bestillingsnr."
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: 8,
                      border: "1px solid var(--mcl-outline)",
                      fontSize: "0.9rem"
                    }}
                  />
                </label>
              </div>

              <p
                style={{
                  marginTop: "0.7rem",
                  marginBottom: 0,
                  fontSize: "0.8rem",
                  color: "var(--mcl-muted)"
                }}
              >
                E-postadressen brukes til kvittering fra Stripe og til å
                identifisere lisensen din i appen. Vi deler ikke adressen med
                andre enn våre underleverandører for betaling og drift.
              </p>
            </section>

            {/* Feil */}
            {error && (
              <div
                style={{
                  marginBottom: "0.6rem",
                  fontSize: "0.85rem",
                  color: "var(--mcl-error, #b91c1c)"
                }}
              >
                {error}
              </div>
            )}

            {/* Knapperekke */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem"
              }}
            >
              <button
                type="button"
                className="button ghost"
                onClick={handleBackToStep1}
                disabled={busy}
                style={{
                  borderRadius: 999,
                  paddingInline: "0.9rem"
                }}
              >
                ← Tilbake
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="button ghost"
                  onClick={onClose}
                  disabled={busy}
                  style={{ borderRadius: 999, paddingInline: "0.9rem" }}
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleSubmitAndCheckout}
                  disabled={busy}
                  style={{
                    borderRadius: 999,
                    paddingInline: "1.1rem",
                    background: "var(--mcl-brand)",
                    color: "#fff",
                    opacity: busy ? 0.7 : 1,
                    cursor: busy ? "default" : "pointer"
                  }}
                >
                  {busy ? "Kobler til betaling …" : "Gå til betaling"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
