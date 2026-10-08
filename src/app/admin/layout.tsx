import "../globals.css";
import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT"], variable: "--font-display-face", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans-face", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-[#f3f0e8] text-ink antialiased">{children}</body>
    </html>
  );
}
