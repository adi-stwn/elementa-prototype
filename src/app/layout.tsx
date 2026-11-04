import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

// Mengambil font bergaya Pixel Art
const vt323 = VT323({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Elementa: The Alchemist Knight",
  description: "Prototype Meja Crafting Edu-Puzzle RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Menerapkan font ke seluruh halaman game */}
      <body className={`${vt323.variable} font-pixel antialiased bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}