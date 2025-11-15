"use client";

import type { MouseEventHandler } from "react";
import { useI18n } from "../../lib/i18n";

type PrintButtonProps = {
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export default function PrintButton({
  label,
  onClick,
  className
}: PrintButtonProps) {
  const { t } = useI18n("no");

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }

    if (typeof window !== "undefined" && typeof window.print === "function") {
      // Forutsatt at vi står på en dedikert /print-visning
      window.print();
    }
  };

  const btnLabel = label ?? t("print.button");

  return (
    <button
      type="button"
      className={`mcl-button mcl-button-small ${className ?? ""}`.trim()}
      onClick={handleClick}
    >
      {btnLabel}
    </button>
  );
}
