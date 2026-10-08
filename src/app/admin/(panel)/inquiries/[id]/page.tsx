import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { can, requireAdmin } from "@/lib/auth";
import { STATUS_STYLES } from "@/lib/admin/status-styles";
import { getStore } from "@/lib/content/store";
import { INQUIRY_STATUSES } from "@/lib/content/types";
import { cn, formatDate, mailHref, telHref, whatsappHref } from "@/lib/utils";
import { deleteInquiry, updateInquiry } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Inquiry" };

export default async function InquiryDetail({ params }: PageProps<"/admin/inquiries/[id]">) {
  const user = await requireAdmin("leads");
  const { id } = await params;
  const inquiry = await (await getStore("admin")).getInquiry(id);
  if (!inquiry) notFound();

  const rows: [string, string][] = [
    ["Name", inquiry.name],
    ["Company", inquiry.company],
    ["Country", inquiry.country],
    ["Email", inquiry.email],
    ["Phone / WhatsApp", inquiry.phone],
    ["Product", inquiry.product],
    ["Quantity", inquiry.quantity],
    ["Packaging", inquiry.packaging],
    ["Language", inquiry.locale],
    ["Received", formatDate(inquiry.createdAt)],
    ["Last updated", formatDate(inquiry.updatedAt)],
  ];
  const wa = whatsappHref(inquiry.phone, `Hello ${inquiry.name}, regarding your inquiry ${inquiry.reference}`);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={inquiry.reference}
        description={`${inquiry.company || inquiry.name} · ${inquiry.country}`}
        back={{ href: "/admin/inquiries", label: "Inquiries" }}
        actions={
          <>
            <a href={mailHref(inquiry.email, `Re: your inquiry ${inquiry.reference}`)} className="admin-btn">
              <Mail className="size-4" /> Reply by email
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="admin-btn">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
            {telHref(inquiry.phone) && (
              <a href={telHref(inquiry.phone)} className="admin-btn">
                <Phone className="size-4" /> Call
              </a>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="admin-card p-6">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_STYLES[inquiry.status])}>{inquiry.status}</span>
          <dl className="mt-6 divide-y divide-ink/5 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-2.5">
                <dt className="text-stone">{k}</dt>
                <dd className="break-words">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          {inquiry.message && (
            <div className="mt-6 rounded-xl bg-ivory p-4 text-sm leading-relaxed">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone">Message</p>
              <p className="whitespace-pre-wrap">{inquiry.message}</p>
            </div>
          )}
        </section>

        <section className="admin-card h-fit p-6">
          <h2 className="font-semibold">Tracking</h2>
          <form action={updateInquiry.bind(null, inquiry.id)} className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="font-medium">Status</span>
              <select name="status" defaultValue={inquiry.status} className="admin-input mt-1.5 capitalize">
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Internal notes</span>
              <textarea name="notes" rows={8} defaultValue={inquiry.notes} className="admin-input mt-1.5" placeholder="Follow-ups, pricing sent, sample dispatch…" />
            </label>
            <button type="submit" className="admin-btn-primary w-full">
              Update inquiry
            </button>
          </form>
          {can(user, "deleteLeads") && (
            <ConfirmButton
              action={deleteInquiry.bind(null, inquiry.id)}
              message={`Delete inquiry ${inquiry.reference}? This cannot be undone.`}
              className="mt-6 flex items-center gap-2 text-xs font-semibold text-red-600"
            >
              <Trash2 className="size-3.5" /> Delete inquiry
            </ConfirmButton>
          )}
        </section>
      </div>
    </div>
  );
}
