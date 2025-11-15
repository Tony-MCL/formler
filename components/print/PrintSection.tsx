import type {
  PrintSection as PrintSectionType,
  PrintContentBlock
} from "../../lib/print/types";

type Props = {
  section: PrintSectionType;
};

export default function PrintSection({ section }: Props) {
  return (
    <section className="pe-section">
      {section.title && <h3 className="pe-section-title">{section.title}</h3>}

      {section.content.map((block: PrintContentBlock, index) => {
        if (block.type === "paragraph") {
          return (
            <p className="pe-paragraph" key={index}>
              {block.text}
            </p>
          );
        }

        if (block.type === "keyValueList") {
          const cols = block.columns ?? 1;
          return (
            <div
              key={index}
              className={`pe-kv-list pe-kv-cols-${cols > 1 ? 2 : 1}`}
            >
              {block.items.map((item) => (
                <div className="pe-kv-row" key={item.key}>
                  <span className="pe-kv-key">{item.key}:</span>
                  <span className="pe-kv-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "table") {
          return (
            <div className="pe-table-wrapper" key={index}>
              <table className="pe-table">
                {block.headers && block.headers.length > 0 && (
                  <thead>
                    <tr>
                      {block.headers.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.cells.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={
                            cell.align
                              ? { textAlign: cell.align }
                              : undefined
                          }
                        >
                          {cell.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return null;
      })}
    </section>
  );
}
