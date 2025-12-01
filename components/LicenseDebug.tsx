"use client";

import React from "react";
import { useLicense } from "@/lib/license";

export default function LicenseDebug() {
  const lic = useLicense();

  // Skjul hvis vi laster, for å unngå flimring
  if (lic.loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        padding: "6px 10px",
        fontSize: 11,
        fontFamily: "system-ui, sans-serif",
        borderRadius: 8,
        background: "rgba(0,0,0,0.7)",
        color: "#eee",
        zIndex: 9999,
        pointerEvents: "none",
        maxWidth: 260
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>License debug</div>
      <div>tier: {lic.tier}</div>
      <div>source: {lic.source}</div>
      <div>
        trial:{" "}
        {lic.trialUsed
          ? lic.isTrialActive
            ? "aktiv"
            : "brukt / utløpt"
          : "ikke startet"}
      </div>
      {lic.trialEndsAt && (
        <div style={{ opacity: 0.8 }}>
          trialEndsAt: {lic.trialEndsAt}
        </div>
      )}
      {lic.error && (
        <div style={{ color: "#ffaaaa", marginTop: 2 }}>
          error: {lic.error}
        </div>
      )}
    </div>
  );
}
