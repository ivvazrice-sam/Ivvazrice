import { Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { can, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/content/store";
import { cn, formatDate, mailHref } from "@/lib/utils";
import { deleteMessage, setMessageStatus } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireAdmin("leads");
  const messages = await (await getStore("admin")).listContactMessages();

  return (
    <div className="max-w-5xl">
      <PageHeader title="Messages" description="General messages from the contact page." />
      {messages.length ? (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={cn("admin-card p-5 transition-all", m.status === "archived" && "opacity-60", m.status === "new" && "border-l-4 border-l-gold")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {m.status === "new" && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">New</span>
                    )}
                    <p className="font-semibold text-ink">{m.subject || "(no subject)"}</p>
                  </div>
                  <p className="mt-1 text-xs text-stone">
                    From <span className="font-medium text-ink">{m.name}</span> · {m.email}
                    {m.phone && ` · ${m.phone}`} · {formatDate(m.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a href={mailHref(m.email, `Re: ${m.subject || "your message"}`)} title="Reply" className="grid size-8 place-items-center rounded-lg hover:bg-ink/5">
                    <Mail className="size-4" />
                  </a>
                  <form action={setMessageStatus.bind(null, m.id, m.status === "new" ? "read" : "new")}>
                    <button type="submit" title={m.status === "new" ? "Mark read" : "Mark unread"} className="grid size-8 place-items-center rounded-lg hover:bg-ink/5">
                      <MailOpen className="size-4" />
                    </button>
                  </form>
                  <form action={setMessageStatus.bind(null, m.id, "archived")}>
                    <button type="submit" title="Archive" className="grid size-8 place-items-center rounded-lg hover:bg-ink/5">
                      <Archive className="size-4" />
                    </button>
                  </form>
                  {can(user, "deleteLeads") && (
                    <ConfirmButton action={deleteMessage.bind(null, m.id)} message="Delete this message?" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </ConfirmButton>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-card p-10 text-center text-sm text-stone">No messages yet.</p>
      )}
    </div>
  );
}
