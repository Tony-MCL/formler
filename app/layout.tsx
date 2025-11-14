import type { Metadata } from "next";
import "../app/globals.css";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Digital Formelsamling – Morning Coffee Labs",
  description: "Interaktiv formelsamling for elektriske fag fra Morning Coffee Labs."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body>
        <body className={inter.className}>
    {/* Kun for utskrift – logo i høyre hjørne */}
    <img
      src="/images/mcl-logo.png"
      alt="Morning Coffee Labs"
      className="print-logo"
      aria-hidden="true"
    />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
