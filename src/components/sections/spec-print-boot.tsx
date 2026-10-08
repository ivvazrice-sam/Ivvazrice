"use client";

import { useEffect } from "react";

/** Auto-triggers the browser print dialog once after the sheet mounts, and renders the on-screen controls. */
export function SpecPrintBoot() {
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        /* ignore */
      }
    }, 450);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => history.back()}
        className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-pearl"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-pearl transition hover:bg-ink/90"
      >
        Print / Save as PDF
      </button>
    </>
  );
}
