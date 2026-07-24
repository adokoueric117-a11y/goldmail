import type { Metadata, Viewport } from "next";
import SWRegister from "@/components/ui/SWRegister";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "GoldMail — Emails professionnels haut de gamme",
    template: "%s | GoldMail",
  },
  description:
    "Créez des emails professionnels impeccables avec signature et logo. Offline-First & SQLite local.",
  keywords: ["email professionnel", "signature email", "GoldMail", "PWA", "Offline"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoldMail",
  },
  openGraph: {
    title: "GoldMail",
    description: "Emails professionnels haut de gamme (Offline-First)",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A227",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="gold-dark" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.svg" />
        {/* Anti-flash theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localForage = window.localforage;
                  // Try synchronous localStorage cache fallback if available
                  var theme = localStorage.getItem("goldmail_theme") || "gold-dark";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
