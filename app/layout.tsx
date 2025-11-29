import type { Metadata } from "next";
import "../app/globals.css";
import "katex/dist/katex.min.css";
import { I18nProvider } from "../lib/i18n";
import { LicenseProvider } from "../lib/license";

export const metadata: Metadata = {
  title: "Digital Formelsamling – Morning Coffee Labs",
  description:
    "Interaktiv formelsamling for elektriske fag fra Morning Coffee Labs."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <LicenseProvider>{children}</LicenseProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
