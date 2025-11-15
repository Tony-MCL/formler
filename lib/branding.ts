// /lib/print/branding.ts

export type BrandingMode =
  | "mcl" // MCL-logo + MCL-vannmerke (typisk LITE/demo)
  | "mcl-no-watermark" // MCL-logo, men uten vannmerke (betalt lisens)
  | "customer" // Kun kundens logo, ingen vannmerke (white-label)
  | "customer-with-watermark"; // Kundens logo + MCL-vannmerke

export type BrandingInput = {
  /** Hvilken brandingprofil som skal brukes */
  mode: BrandingMode;

  /**
   * basePath for statiske filer.
   * I Next-prosjektene dine vil dette normalt være NEXT_PUBLIC_BASE_PATH.
   * Hvis du ikke sender inn noe, brukes verdien fra env ("" som fallback).
   */
  basePath?: string;

  /** Kundens logo-URL (for "customer" / "customer-with-watermark") */
  customerLogoUrl?: string;

  /** Kundens navn – brukes som alt-tekst hvis satt */
  customerName?: string;
};

/**
 * De faktiske propene som går rett inn i <PrintLayout />.
 */
export type PrintBranding = {
  logoUrl?: string;
  logoAlt?: string;
  watermarkUrl?: string;
  showWatermark: boolean;
};

const DEFAULT_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function resolveBasePath(explicit?: string): string {
  if (explicit != null) {
    return explicit;
  }
  return DEFAULT_BASE_PATH;
}

/**
 * Hovedfunksjonen:
 * Tar inn en BrandingInput og gir deg props klare til å sende inn i <PrintLayout />.
 */
export function resolvePrintBranding(input: BrandingInput): PrintBranding {
  const basePath = resolveBasePath(input.basePath);

  const mclLogoUrl = `${basePath}/images/mcl-logo.png`;
  const mclWatermarkUrl = `${basePath}/images/mcl-watermark.png`;

  switch (input.mode) {
    case "mcl":
      // Full MCL-branding: logo + vannmerke
      return {
        logoUrl: mclLogoUrl,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: mclWatermarkUrl,
        showWatermark: true
      };

    case "mcl-no-watermark":
      // Betalt lisens – MCL-logo, men ikke vannmerke
      return {
        logoUrl: mclLogoUrl,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: mclWatermarkUrl,
        showWatermark: false
      };

    case "customer":
      // White label – kun kundens logo, ingen vannmerke
      return {
        logoUrl: input.customerLogoUrl,
        logoAlt: input.customerName ?? "Customer logo",
        watermarkUrl: undefined,
        showWatermark: false
      };

    case "customer-with-watermark":
      // Kundens logo + MCL-vannmerke (f.eks. “Powered by MCL”)
      return {
        logoUrl: input.customerLogoUrl,
        logoAlt: input.customerName ?? "Customer logo",
        watermarkUrl: mclWatermarkUrl,
        showWatermark: true
      };

    default:
      // Fallback: full MCL-branding
      return {
        logoUrl: mclLogoUrl,
        logoAlt: "Morning Coffee Labs",
        watermarkUrl: mclWatermarkUrl,
        showWatermark: true
      };
  }
}
