// /components/print/PrintButton.tsx

"use client";

import React from "react";

type PrintButtonProps = {
  onClick?: () => void;
  className?: string;
};

export default function PrintButton({ onClick, className }: PrintButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      className={className ?? "button"}
      onClick={handleClick}
      aria-label="PDF / utskrift"
    >
      🖨️ PDF / utskrift
    </button>
  );
}
