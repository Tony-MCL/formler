// /components/print/PrintSection.tsx

import React from "react";
import type { PrintSection, PrintContentBlock } from "../../lib/print/types";

type PrintSectionProps = {
  section: PrintSection;
};

function renderBlock(block: PrintContentBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="pe-paragraph">
          {block.text}
        </p>
      );

    case "keyValueList":
      return (
        <div key={index} className="pe-keyvalue-list">
          <table>
            <tbody>
              {block.items.map((item, idx) => (
                <tr key={idx}>
                  <th>{item.key}</th>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "table":
      return (
        <div key={index} className="pe-table-wrapper">
          <table className="pe-table">
            {block.headers && block.headers.length > 0 && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

export default function PrintSectionView({ section }: PrintSectionProps) {
  if (!section.content || section.content.length === 0) {
    return null;
  }

  return (
    <section className="pe-section" aria-label={section.title}>
      {section.title && <h2 className="pe-section-title">{section.title}</h2>}
      {section.content.map((block, index) => renderBlock(block, index))}
    </section>
  );
}
