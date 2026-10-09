import Link from "next/link";
import { ArrowRight, Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/content/store";
import { STATUS_STYLES } from "@/lib/admin/status-styles";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/content/types";
import { cn, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Inquiries" };


export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  await requireAdmin("leads");
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (INQUIRY_STATUSES as readonly string[]).includes(sp.status) ? (sp.status as InquiryStatus) : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const list = await (await getStore("admin")).listInquiries({ status, q });
  const exportHref = `/api/admin/inquiries/export?status=${status}&q=${encodeURIComponent(q)}`;

  return (
    <div className="max-w-7xl">
      <PageHeader
        title="Inquiries"
        description="Quote requests from the website. Update the status as each lead progresses — buyers can track it with their reference number."
        actions={
          <a href={exportHref} className="admin-btn">
            <Download className="size-4" /> Export CSV
          </a>
        }
      />

      <form className="mb-5 flex flex-wrap items-center gap-2" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input name="q" defaultValue={q} placeholder="Search reference, name, company, email…" className="admin-input w-80 pl-9" />
        </div>
        <select name="status" defaultValue={status} className="admin-input w-44">
          <option value="all">All statuses</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="admin-btn">
          Filter
        </button>
        {(q || status !== "all") && (
          <Link href="/admin/inquiries" className="text-xs text-stone underline">
            Clear
          </Link>
        )}
      </form>

      <div className="admin-card overflow-x-auto">
        {list.length ? (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ivory/70 text-left text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3 font-semibold">Reference</th>
                <th className="px-5 py-3 font-semibold">Buyer</th>
                <th className="px-5 py-3 font-semibold">Country</th>
                <th className="px-5 py-3 font-semibold">Product / quantity</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Received</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {list.map((i) => (
                <tr key={i.id} className="cursor-pointer transition-colors hover:bg-ivory/70">
                  <td className="px-5 py-3">
                    <Link href={`/admin/inquiries/${i.id}`} className="font-mono text-xs font-semibold hover:underline">
                      {i.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/inquiries/${i.id}`} className="block font-medium hover:underline">
                      {i.company || i.name}
                    </Link>
                    <span className="text-xs text-stone">{i.company ? i.name : i.email}</span>
                  </td>
                  <td className="px-5 py-3 text-stone">{i.country}</td>
                  <td className="px-5 py-3">
                    <span className="block">{i.product || "—"}</span>
                    <span className="text-xs text-stone">{i.quantity}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_STYLES[i.status])}>{i.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-stone">{formatDate(i.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/inquiries/${i.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-pearl transition hover:bg-ink/90"
                    >
                      View <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-sm text-stone">No inquiries match.</p>
        )}
      </div>
    </div>
  );
}
