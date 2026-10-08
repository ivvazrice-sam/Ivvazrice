import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

/** Fallback for URLs outside the localised site (e.g. unknown /admin paths). */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-ink p-8 text-pearl">
        <div className="text-center">
          <p className="eyebrow text-gold-2">404</p>
          <h1 className="mt-4 font-serif text-5xl">Page not found</h1>
          <Link href="/" className="mt-8 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink">
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
