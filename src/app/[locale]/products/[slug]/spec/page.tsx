import { notFound } from "next/navigation";
import { getProductBySlug, getSiteContent } from "@/lib/content/queries";
import { hasValue } from "@/lib/utils";
import { SpecPrintBoot } from "@/components/sections/spec-print-boot";

/**
 * Printable, PDF-ready product specification sheet. Keeps the site chrome in the DOM for
 * accessibility but hides navbar / footer / floating actions via print CSS and in the on-screen
 * "print mode" so the sheet reads clean. A tiny client boot auto-opens the browser print
 * dialog once, so buyers can "Save as PDF" with no extra steps.
 */
export default async function ProductSpecPage({ params }: PageProps<"/[locale]/products/[slug]/spec">) {
  const { slug } = await params;
  const [content, product] = await Promise.all([getSiteContent(), getProductBySlug(slug)]);
  if (!product) notFound();
  const { company, collections } = content;
  const certifications = collections.certifications.filter((c) => c.published);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Variety", value: product.variety },
    { label: "Category", value: product.category },
    { label: "Grain length (raw)", value: product.grainLength },
    { label: "Cooked length", value: product.cookedLength },
    { label: "Texture", value: product.texture },
    { label: "Appearance", value: product.appearance },
    { label: "Available quantities", value: product.availableQuantities },
    { label: "Export availability", value: product.exportAvailability },
  ].filter((r) => hasValue(r.value));

  const name = company.name.replace(/^\[|\]$/g, "");

  return (
    <div className="spec-root min-h-screen bg-pearl py-10 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          header, footer, nav, [aria-label="Back to top"], .back-to-top, [data-site-chrome], .spec-actions { display: none !important; }
          body { background: #fff !important; }
          .spec-root { padding: 0 !important; }
          .spec-sheet { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; max-width: none !important; }
        }
      `}</style>

      <div className="mx-auto mb-4 flex max-w-[820px] justify-end gap-2 px-6 spec-actions">
        <SpecPrintBoot />
      </div>

      <article className="spec-sheet mx-auto max-w-[820px] rounded bg-white p-10 shadow-[0_18px_60px_-30px_rgba(27,49,37,0.25)] sm:p-14 print:p-0">
        <header className="flex items-start justify-between border-b-2 border-ink pb-6">
          <div>
            <div className="font-display text-2xl font-semibold text-ink">{name}</div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone">
              {hasValue(company.tagline) ? company.tagline.replace(/^\[|\]$/g, "") : "Premium Rice · Exported Worldwide"}
            </div>
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.2em] text-stone">
            Document
            <div className="mt-1 text-sm font-semibold tracking-[0.08em] text-ink">Technical Specification</div>
          </div>
        </header>

        <h1 className="mt-8 font-display text-4xl font-medium text-ink">{product.name}</h1>
        {hasValue(product.shortDescription) && <p className="mt-2 text-sm text-stone">{product.shortDescription}</p>}

        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">Specifications</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-ink/10">
                  <td className="w-[40%] py-2.5 pr-4 font-medium text-stone">{r.label}</td>
                  <td className="py-2.5 font-medium text-ink">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {hasValue(product.overview) && (
          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/90">{product.overview}</p>
          </section>
        )}

        {hasValue(product.qualityInfo) && (
          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">Quality assurance</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/90">{product.qualityInfo}</p>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">Certifications</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <li key={c.id} className="rounded-full border border-ink/15 bg-pearl px-3 py-1 text-[11px] font-medium text-ink">{c.name}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 flex justify-between border-t border-ink/10 pt-4 text-[11px] text-stone">
          <div>
            {hasValue(company.email) && <div>{company.email}</div>}
            {hasValue(company.phone) && <div>{company.phone}</div>}
          </div>
          <div className="text-right">
            {hasValue(company.address) && <div>{company.address}</div>}
            <div>Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
