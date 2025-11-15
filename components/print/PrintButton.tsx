"use client";

import React, { MouseEventHandler } from "react";
import { useI18n } from "../../lib/i18n";

type PrintButtonProps = {
  /**
   * Optional i18n key for the button label.
   * If not provided, we fall back to a sensible default.
   */
  labelKey?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export default function PrintButton({
  labelKey,
  onClick,
  className
}: PrintButtonProps) {
  // useI18n tar ingen argumenter i dette prosjektet
  const { t } = useI18n();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }

    if (typeof window === "undefined") return;
    window.print();
  };

  // Prøver i18n først, ellers en enkel norsk fallback
  const label =
    (labelKey ? t(labelKey) : t("print.buttonLabel")) ?? "Skriv ut";

  return (
    <button
      type="button"
      className={`button ${className ?? ""}`.trim()}
      onClick={handleClick}
      aria-label={label}
    >
      🖨️ {label}
    </button>
  );
}
