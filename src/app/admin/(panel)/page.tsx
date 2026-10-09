import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { can, requireAdmin } from "@/lib/auth";
import { COLLECTIONS } from "@/lib/admin/schema";
import { getStore } from "@/lib/content/store";
import { INQUIRY_STATUSES } from "@/lib/content/types";
import { isEmailConfigured, isSupabaseConfigured } from "@/lib/env";
import { getVisitorStats } from "@/lib/analytics/stats";
import { formatDate, isPlaceholderText } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireAdmin();
  const { denied } = await searchParams;
  const store = await getStore("admin");
  const [company, settings, inquiries, products, countries, visitors, counts] = await Promise.all([
    store.getCompany(),
    store.getSettings(),
    can(user, "leads") ? store.listInquiries() : Promise.resolve([]),
    store.list("products", { includeUnpublished: true }),
    store.list("exportCountries", { includeUnpublished: true }),
    getVisitorStats(),
    Promise.all(COLLECTIONS.map((c) => store.list(c.key, { includeUnpublished: true }).then((l) => l.length))),
  ]);

  const checklist = [
    { ok: !!company.name && !isPlaceholderText(company.name), label: "Company name set", href: "/admin/company" },
    { ok: !!company.logoUrl, label: "Logo uploaded", href: "/admin/company" },
    { ok: !!company.email && !isPlaceholderText(company.email), label: "Contact email set", href: "/admin/company" },
    { ok: company.stats.some((s) => s.value), label: "Verified statistics added", href: "/admin/company" },
    { ok: products.some((p) => !isPlaceholderText(p.name) && p.images.length > 0), label: "Real products with photos", href: "/admin/content/products" },
    { ok: countries.length > 0 && !countries.some((c) => c.isPlaceholder), label: "Real export countries", href: "/admin/content/export-countries" },
    { ok: counts[COLLECTIONS.findIndex((c) => c.key === "factoryMedia")] > 0, label: "Factory images / videos", href: "/admin/content/factory-media" },
    { ok: isEmailConfigured(), label: "Email notifications configured (RESEND_API_KEY)", href: "" },
    { ok: isSupabaseConfigured(), label: "Production database (Supabase) connected", href: "" },
    { ok: !settings.showPlaceholders, label: "Placeholder mode switched off", href: "/admin/settings" },
  ];

  return (
    <div>
      <PageHeader title="Welcome back" description={`Signed in as ${user.email} (${user.role}).`} />
      {denied && <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Your role does not have access to that area.</p>}

      {settings.showPlaceholders && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p>
            <strong>Placeholder mode is on.</strong> Visitors can see labelled placeholder slots. Replace the placeholder content, then switch it off in{" "}
            <Link href="/admin/settings" className="underline">
              Site settings
            </Link>{" "}
            before launch.
          </p>
        </div>
      )}

      {visitors.configured && (
        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Website traffic</h2>
            <span className="text-xs text-stone">Last 7 days</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="admin-card p-4">
              <p className="text-xs text-stone">Visitors (total)</p>
              <p className="mt-1 font-display text-3xl">{visitors.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-stone">Visitors today</p>
              <p className="mt-1 font-display text-3xl">{visitors.visitorsToday.toLocaleString()}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-stone">Page views (7d)</p>
              <p className="mt-1 font-display text-3xl">{visitors.viewsLast7Days.toLocaleString()}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-stone">Page views (total)</p>
              <p className="mt-1 font-display text-3xl">{visitors.totalViews.toLocaleString()}</p>
            </div>
          </div>
          {visitors.topPaths.length > 0 && (
            <div className="admin-card mt-4 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-sm font-semibold">Top pages (7 days)</h3>
              </div>
              <ul className="divide-y divide-ink/5 border-t border-ink/5">
                {visitors.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="font-mono text-xs text-stone">{p.path}</span>
                    <span className="font-medium">{p.views.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {can(user, "leads") && (
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {INQUIRY_STATUSES.map((s) => (
              <Link key={s} href={`/admin/inquiries?status=${s}`} className="admin-card p-4 transition-colors hover:border-ink/30">
                <p className="text-xs capitalize text-stone">{s}</p>
                <p className="mt-1 font-display text-3xl">{inquiries.filter((i) => i.status === s).length}</p>
              </Link>
            ))}
          </div>
          <div className="admin-card mt-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Latest inquiries</h2>
              <Link href="/admin/inquiries" className="text-xs font-semibold text-stone hover:text-ink">
                View all
              </Link>
            </div>
            {inquiries.length ? (
              <ul className="divide-y divide-ink/5 border-t border-ink/5">
                {inquiries.slice(0, 6).map((i) => (
                  <li key={i.id}>
                    <Link href={`/admin/inquiries/${i.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 text-sm hover:bg-ivory">
                      <span className="font-mono text-xs">{i.reference}</span>
                      <span className="font-medium">{i.company || i.name}</span>
                      <span className="text-stone">{i.country}</span>
                      <span className="text-stone">{i.product}</span>
                      <span className="ml-auto text-xs text-stone">{formatDate(i.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-ink/5 px-5 py-6 text-sm text-stone">No inquiries yet.</p>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card p-6">
          <h2 className="font-semibold">Launch checklist</h2>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                {c.ok ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="size-4 rounded-full border-2 border-ink/20" />}
                {c.href && !c.ok ? (
                  <Link href={c.href} className="underline-offset-2 hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span className={c.ok ? "text-stone" : ""}>{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
        {can(user, "content") && (
          <section className="admin-card p-6">
            <h2 className="font-semibold">Content</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {COLLECTIONS.map((c, i) => (
                <li key={c.slug}>
                  <Link href={`/admin/content/${c.slug}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-ivory">
                    {c.label}
                    <span className="flex items-center gap-1 text-stone">
                      {counts[i]} <ArrowUpRight className="size-3" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
