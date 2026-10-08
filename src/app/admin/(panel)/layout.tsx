import { can, requireAdmin } from "@/lib/auth";
import { COLLECTIONS } from "@/lib/admin/schema";
import { getStore } from "@/lib/content/store";
import { Sidebar } from "@/components/admin/sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const newLeads = can(user, "leads") ? (await (await getStore("admin")).listInquiries({ status: "new" })).length : 0;
  return (
    <div className="lg:flex">
      <Sidebar
        user={user}
        collections={COLLECTIONS.map((c) => ({ slug: c.slug, label: c.label }))}
        canContent={can(user, "content")}
        canLeads={can(user, "leads")}
        canSettings={can(user, "settings")}
        newLeads={newLeads}
      />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
