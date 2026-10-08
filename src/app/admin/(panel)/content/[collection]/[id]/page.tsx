import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { BASE_FIELDS, collectionBySlug } from "@/lib/admin/schema";
import { collectionDefaults } from "@/lib/content/defaults";
import { getStore } from "@/lib/content/store";
import { saveCollectionItem } from "@/app/admin/actions";
import { EntityEditor } from "@/components/admin/entity-editor";
import { PageHeader } from "@/components/admin/page-header";

export default async function EditItemPage({ params }: PageProps<"/admin/content/[collection]/[id]">) {
  await requireAdmin("content");
  const { collection, id } = await params;
  const config = collectionBySlug(collection);
  if (!config) notFound();
  const store = await getStore("admin");
  const isNew = id === "new";
  const existing = isNew ? null : await store.get(config.key, id);
  if (!isNew && !existing) notFound();

  const count = isNew ? (await store.list(config.key, { includeUnpublished: true })).length : 0;
  const initial = (existing ?? { ...collectionDefaults[config.key], published: true, sortOrder: count + 1 }) as unknown as Record<string, unknown>;
  const title = isNew ? `New ${config.singular.toLowerCase()}` : String(initial[config.titleField] || config.singular);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={title}
        back={{ href: `/admin/content/${config.slug}`, label: config.label }}
        actions={
          config.key === "products" && !isNew ? (
            <Link href={`/products/${String(initial.slug)}`} target="_blank" className="admin-btn">
              <ExternalLink className="size-4" /> View page
            </Link>
          ) : undefined
        }
      />
      <EntityEditor
        key={id}
        fields={[...config.fields, ...BASE_FIELDS]}
        initial={initial}
        action={saveCollectionItem.bind(null, config.slug, id)}
        afterCreateHref={isNew ? `/admin/content/${config.slug}` : undefined}
      />
    </div>
  );
}
