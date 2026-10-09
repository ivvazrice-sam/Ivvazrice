import { can, requireAdmin } from "@/lib/auth";
import { COLLECTIONS } from "@/lib/admin/schema";
import { getSiteContent } from "@/lib/content/queries";
import { getStore } from "@/lib/content/store";
import { Sidebar } from "@/components/admin/sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [newLeads, content] = await Promise.all([
    can(user, "leads") ? (async () => (await (await getStore("admin")).listInquiries({ status: "new" })).length)() : Promise.resolve(0),
    getSiteContent(),
  ]);
  return (
    <div className="lg:flex">
      <Sidebar
        user={user}
        collections={COLLECTIONS.map((c) => ({ slug: c.slug, label: c.label }))}
        canContent={can(user, "content")}
        canLeads={can(user, "leads")}
        canSettings={can(user, "settings")}
        newLeads={newLeads}
        company={{ name: content.company.name, logoUrl: content.company.logoUrl, logoDarkUrl: content.company.logoDarkUrl }}
      />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
