// /components/print/PrintButton.tsx

"use client";

import React, { MouseEventHandler } from "react";
import { useI18n } from "../../lib/i18n";

type PrintButtonProps = {
  onClick?: () => void;
  className?: string;
};

export default function PrintButton({ onClick, className }: PrintButtonProps) {
  const { t } = useI18n();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (onClick) {
      onClick();
    }

    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const label = t("print_button_label") ?? "Skriv ut";

  return (
    <button
      type="button"
      className={className ?? "button"}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
