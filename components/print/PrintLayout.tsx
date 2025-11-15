// /components/print/PrintLayout.tsx

import React from "react";
import type { PrintData } from "../../lib/print/types";
import type { PrintBranding } from "../../lib/print/branding";
import PrintSection from "./PrintSection";

type PrintLayoutProps = PrintData & PrintBranding;

export default function PrintLayout({
  title,
  subtitle,
  meta,
  sections,
  logoUrl,
  logoAlt,
  watermarkUrl,
  showWatermark
}: PrintLayoutProps) {
  return (
    <div className="pe-root">
      <div className="pe-page">
        {/* Vannmerke-laget */}
        {showWatermark && watermarkUrl && (
          <div className="pe-watermark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={watermarkUrl} alt="" aria-hidden="true" />
          </div>
        )}

        <div className="pe-content">
          <header className="pe-header">
            <div className="pe-header-left">
              <h1 className="pe-title">{title}</h1>
              {subtitle && <p className="pe-subtitle">{subtitle}</p>}

              {meta && meta.length > 0 && (
                <dl className="pe-meta">
                  {meta.map((item, index) => (
                    <div key={index} className="pe-meta-row">
                      <dt className="pe-meta-label">{item.label}</dt>
                      <dd className="pe-meta-value">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {logoUrl && (
              <div className="pe-header-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={logoAlt ?? "Logo"}
                  className="pe-logo"
                />
              </div>
            )}
          </header>

          <main className="pe-main">
            {sections.map((section) => (
              <PrintSection key={section.id} section={section} />
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
