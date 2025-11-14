import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";
import LangToggle from "../components/LangToggle";
import ThemeToggle from "../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Digital Formelsamling – Morning Coffee Labs",
  description:
    "Digital formelsamling for elkraft, motorer og generatorer – med pen visning og innebygde kalkulatorer.",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>
        <I18nProvider>
          <div className="app-root">
            {/* Header for skjermvisning */}
            <header className="header">
              <div className="header-inner">
                <div className="header-left">
                  {/* Logo + tittel */}
                  <div className="brand">
                    <img
                      src={`${basePath}/images/mcl-logo.png`}
                      alt="Morning Coffee Labs"
                      className="brand-logo"
                    />
                    <span className="brand-title">Digital Formelsamling</span>
                  </div>
                </div>

                <div className="header-right">
                  <LangToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Egen logo kun for utskrift (Pro/annen logo kan byttes her senere) */}
            <img
              src={`${basePath}/images/mcl-logo.png`}
              alt="Morning Coffee Labs"
              className="print-logo"
            />

            <main className="app-main">{children}</main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
