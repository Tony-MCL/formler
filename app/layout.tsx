import type { Metadata } from "next";
import "../app/globals.css";
import "katex/dist/katex.min.css"; // ← ny linje
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
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
