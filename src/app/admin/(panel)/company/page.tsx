import { requireAdmin } from "@/lib/auth";
import { COMPANY_FIELDS } from "@/lib/admin/schema";
import { getStore } from "@/lib/content/store";
import { saveCompany } from "@/app/admin/actions";
import { EntityEditor } from "@/components/admin/entity-editor";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Company profile" };

export default async function CompanyPage() {
  await requireAdmin("settings");
  const company = await (await getStore("admin")).getCompany();
  return (
    <div className="max-w-5xl">
      <PageHeader title="Company profile" description="Name, logo, story, statistics, contact details and export origin. Only publish verified information." />
      <EntityEditor fields={COMPANY_FIELDS} initial={company as unknown as Record<string, unknown>} action={saveCompany} />
    </div>
  );
}
