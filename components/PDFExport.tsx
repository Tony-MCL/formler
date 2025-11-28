"use client";

import React from "react";

type PDFExportProps = {
  disabled?: boolean;
};

export default function PDFExport({ disabled }: PDFExportProps) {
  const handleClick = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <button
      type="button"
      className="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="Eksporter som PDF"
      style={{
        fontSize: "0.85rem",
        paddingInline: "0.7rem"
      }}
    >
      ⬇︎ PDF
    </button>
  );
}
