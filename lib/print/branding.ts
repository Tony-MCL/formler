// /lib/print/branding.ts

export type BrandingMode =
  | "mcl" // MCL-logo + MCL-vannmerke
  | "mcl-no-watermark" // MCL-logo uten watermark
  | "customer" // Kun kundens logo
  | "customer-with-watermark"; // Kundelogo + MCL-watermark

export type BrandingInput = {
  mode: BrandingMode;
  basePath?: string; // DEFAULT: process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  customerLogoUrl?: string;
  customerName?: string; // alt-tekst for kundelogo
};

export type PrintBranding = {
  logoUrl?: string;
  logoAlt?: string;
  watermarkUrl?: string;
  showWatermark: boolean;
};

export function resolvePrintBranding(input: BrandingInput): PrintBranding {
  const basePath =
    input.basePath ??
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BASE_PATH ?? ""
      : "");

  const mclLogo = `${basePath}/images/mcl-logo.png`;
  const mclWatermark = `${basePath}/images/mcl-watermark.png`;

  switch (input.mode) {
    case "mcl":
      return {
        logoUrl: mclLogo,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: mclWatermark,
        showWatermark: true
      };

    case "mcl-no-watermark":
      return {
        logoUrl: mclLogo,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: undefined,
        showWatermark: false
      };

    case "customer":
      return {
        logoUrl: input.customerLogoUrl ?? mclLogo,
        logoAlt: input.customerName ?? "Customer logo",
        watermarkUrl: undefined,
        showWatermark: false
      };

    case "customer-with-watermark":
      return {
        logoUrl: input.customerLogoUrl ?? mclLogo,
        logoAlt: input.customerName ?? "Customer logo",
        watermarkUrl: mclWatermark,
        showWatermark: true
      };

    default:
      return {
        logoUrl: mclLogo,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: mclWatermark,
        showWatermark: true
      };
  }
}
