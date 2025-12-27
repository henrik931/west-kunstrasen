import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SC West Köln - Kunstrasen Aktion",
  description:
    "Werde Teil von SC West Köln 1900/11 e.V. - Sichere dir dein Stück Kunstrasen und unterstütze deinen Verein. Tradition. Veedel. Verein.",
  keywords: [
    "SC West Köln",
    "Kunstrasen",
    "Fußball",
    "Spende",
    "Köln",
    "Verein",
  ],
  authors: [{ name: "SC West Köln 1900/11 e.V." }],
  openGraph: {
    title: "SC West Köln - Kunstrasen Aktion",
    description:
      "Werde Teil von SC West Köln - Sichere dir dein Stück Kunstrasen!",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
