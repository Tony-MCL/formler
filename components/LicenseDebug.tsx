"use client";

import React from "react";
import { useLicense } from "../lib/license";

const boxStyle: React.CSSProperties = {
  position: "fixed",
  right: 12,
  bottom: 12,
  padding: 10,
  borderRadius: 8,
  background: "rgba(20, 20, 20, 0.9)",
  color: "#f5f5f5",
  fontSize: 12,
  lineHeight: 1.4,
  zIndex: 9999,
  boxShadow: "0 0 12px rgba(0,0,0,0.4)",
  maxWidth: 260
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  marginLeft: 6
};

function humanReadableTier(tier: "free" | "trial" | "pro") {
  switch (tier) {
    case "free":
      return "Gratisversjon";
    case "trial":
      return "Prøveversjon";
    case "pro":
      return "Fullversjon";
    default:
      return tier;
  }
}

export default function LicenseDebug() {
  const lic = useLicense();

  const tierLabel = humanReadableTier(lic.tier);

  let trialInfo = "Ingen prøveperiode registrert.";
  if (lic.trialUsed && lic.trialEndsAt) {
    trialInfo = lic.isTrialActive
      ? `Prøve aktiv til ${new Date(lic.trialEndsAt).toLocaleString()}`
      : `Prøve utløpt ${new Date(lic.trialEndsAt).toLocaleString()}`;
  }

  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        ☕ Lisensstatus
        <span
          style={{
            ...badgeStyle,
            background:
              lic.tier === "pro"
                ? "linear-gradient(135deg,#c28b37,#ffd27f)"
                : lic.tier === "trial"
                ? "linear-gradient(135deg,#2d6cdf,#6ca8ff)"
                : "linear-gradient(135deg,#555,#999)"
          }}
        >
          {tierLabel}
        </span>
      </div>

      <div style={{ marginBottom: 2 }}>
        <strong>Tilgang:</strong>{" "}
        {lic.hasFullAccess ? "Full tilgang" : "Begrenset (gratis)"}
      </div>

      <div style={{ marginBottom: 2 }}>
        <strong>Prøve:</strong> {trialInfo}
      </div>

      <div style={{ marginBottom: 2 }}>
        <strong>Laster/feil:</strong>{" "}
        {lic.loading ? "Laster..." : lic.error ? lic.error : "Ingen feil"}
      </div>

      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
        (Kun intern debug – vises bare for deg i test.)
      </div>
    </div>
  );
}
