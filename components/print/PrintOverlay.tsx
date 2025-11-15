// components/print/PrintOverlay.tsx
type PrintOverlayProps = {
  watermarkUrl?: string;
  logoUrl?: string;
  logoAlt?: string;
  showWatermark?: boolean;
  showLogo?: boolean;
};

export default function PrintOverlay({
  watermarkUrl,
  logoUrl,
  logoAlt,
  showWatermark = true,
  showLogo = true
}: PrintOverlayProps) {
  return (
    <div id="print-overlay" aria-hidden="true">
      {showWatermark && watermarkUrl && (
        <div className="print-overlay-watermark">
          <img src={watermarkUrl} alt="Watermark" />
        </div>
      )}
      {showLogo && logoUrl && (
        <div className="print-overlay-logo">
          <img src={logoUrl} alt={logoAlt ?? "Logo"} />
        </div>
      )}
    </div>
  );
}
