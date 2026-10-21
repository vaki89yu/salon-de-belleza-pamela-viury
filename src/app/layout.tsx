import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Italiana,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "SALÓN DE BELLEZA PAMELA VIURY · Belleza, Estilo y Alta Estética en Cd. Juárez, Chih.",
  description:
    "Salón de Belleza Pamela Viury — casa de belleza de lujo para mujeres en Zona Campos Elíseos, Ciudad Juárez, Chihuahua. Balayage Signature, maquillaje nupcial Privé, manicura rusa, hidrafacial diamante, paquetes, membresías y reservación de citas en línea con descarga de folio oficial, catálogo, guía nupcial y certificados de regalo en PDF.",
  openGraph: {
    title: "Salón de Belleza Pamela Viury · Cd. Juárez, Chihuahua",
    description:
      "Belleza, estilo y alta estética, novias Privé y folios oficiales descargables en PDF con código QR en Campos Elíseos, Cd. Juárez.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable} ${italiana.variable} ${pinyon.variable} scroll-smooth`}
    >
      <body className="bg-[#FBF8F3] font-sans text-[#21171D] antialiased selection:bg-[#7A2E43]/20 selection:text-[#21171D]">
        {children}
      </body>
    </html>
  );
}
