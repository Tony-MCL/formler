import type {
  PrintData,
  PrintSection as PrintSectionType
} from "../../lib/print/types";
import PrintSection from "./PrintSection";

type PrintLayoutProps = PrintData & {
  watermarkUrl?: string;
  showWatermark?: boolean;
  logoUrl?: string;
  logoAlt?: string;
};

export default function PrintLayout({
  title,
  subtitle,
  meta,
  sections,
  watermarkUrl,
  showWatermark = true,
  logoUrl,
  logoAlt
}: PrintLayoutProps) {
  return (
    <div className="pe-root">
      <div className="pe-page">
        {showWatermark && watermarkUrl && (
          <div className="pe-watermark">
            <img src={watermarkUrl} alt="MCL watermark" />
          </div>
        )}

        <header className="pe-header">
          <div className="pe-header-top">
            <div className="pe-header-text">
              <h1 className="pe-title">{title}</h1>
              {subtitle && <h2 className="pe-subtitle">{subtitle}</h2>}
            </div>

            {logoUrl && (
              <div className="pe-logo">
                <img src={logoUrl} alt={logoAlt ?? "MCL logo"} />
              </div>
            )}
          </div>

          {meta && meta.length > 0 && (
            <dl className="pe-meta">
              {meta.map((item) => (
                <div className="pe-meta-row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <main className="pe-content">
          {sections.map((section: PrintSectionType) => (
            <PrintSection key={section.id} section={section} />
          ))}
        </main>
      </div>
    </div>
  );
}
