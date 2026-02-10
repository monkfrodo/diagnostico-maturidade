import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagnóstico de Maturidade de Negócio | Kevin — Íntegros",
  description:
    "14 perguntas pra descobrir se você tem um negócio de verdade ou um emprego disfarçado.",
  openGraph: {
    title: "Diagnóstico de Maturidade de Negócio | Kevin — Íntegros",
    description:
      "14 perguntas pra descobrir se você tem um negócio de verdade ou um emprego disfarçado.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${cormorant.variable} ${dmSans.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
