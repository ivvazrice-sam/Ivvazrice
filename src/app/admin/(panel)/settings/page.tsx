import { requireAdmin } from "@/lib/auth";
import { SETTINGS_FIELDS } from "@/lib/admin/schema";
import { getStore } from "@/lib/content/store";
import { saveSettings } from "@/app/admin/actions";
import { EntityEditor } from "@/components/admin/entity-editor";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin("settings");
  const settings = await (await getStore("admin")).getSettings();
  return (
    <div className="max-w-5xl">
      <PageHeader title="Site settings" description="SEO defaults, export copy, legal pages and placeholder mode." />
      <EntityEditor fields={SETTINGS_FIELDS} initial={settings as unknown as Record<string, unknown>} action={saveSettings} />
    </div>
  );
}
