import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { can, requireAdmin } from "@/lib/auth";
import { collectionBySlug } from "@/lib/admin/schema";
import { getStore } from "@/lib/content/store";
import { deleteCollectionItem, togglePublished } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";

export default async function CollectionPage({ params }: PageProps<"/admin/content/[collection]">) {
  const user = await requireAdmin("content");
  const { collection } = await params;
  const config = collectionBySlug(collection);
  if (!config) notFound();
  const items = (await (await getStore("admin")).list(config.key, { includeUnpublished: true })) as unknown as Record<string, unknown>[];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={config.label}
        description={config.description}
        back={{ href: "/admin", label: "Dashboard" }}
        actions={
          <Link href={`/admin/content/${config.slug}/new`} className="admin-btn-primary">
            <Plus className="size-4" /> Add {config.singular.toLowerCase()}
          </Link>
        }
      />
      <div className="admin-card overflow-hidden">
        {items.length ? (
          <table className="w-full text-sm">
            <thead className="bg-ivory/70 text-left text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Details</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {items.map((item) => {
                const id = String(item.id);
                const thumb = config.thumbField ? String(item[config.thumbField] ?? "") : config.key === "products" ? String((item.images as { url: string }[])?.[0]?.url ?? "") : "";
                return (
                  <tr key={id} className="hover:bg-ivory/50">
                    <td className="px-5 py-3 tabular-nums text-stone">{String(item.sortOrder)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/content/${config.slug}/${id}`} className="flex items-center gap-3 font-medium hover:underline">
                        {thumb && /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(thumb) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="size-10 rounded-lg object-cover" />
                        ) : null}
                        {String(item[config.titleField] || "(untitled)")}
                      </Link>
                    </td>
                    <td className="hidden max-w-xs truncate px-5 py-3 text-stone md:table-cell">{config.subtitleField ? String(item[config.subtitleField] ?? "") : ""}</td>
                    <td className="px-5 py-3">
                      <span className={item.published ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-stone"}>
                        {item.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <form action={togglePublished.bind(null, config.slug, id)}>
                          <button type="submit" title={item.published ? "Unpublish" : "Publish"} className="grid size-8 place-items-center rounded-lg hover:bg-ink/5">
                            {item.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </form>
                        <Link href={`/admin/content/${config.slug}/${id}`} title="Edit" className="grid size-8 place-items-center rounded-lg hover:bg-ink/5">
                          <Pencil className="size-4" />
                        </Link>
                        {can(user, "deleteContent") && (
                          <ConfirmButton
                            action={deleteCollectionItem.bind(null, config.slug, id)}
                            message={`Delete "${String(item[config.titleField] || "this item")}"? This cannot be undone.`}
                            className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </ConfirmButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-sm text-stone">Nothing here yet. Add the first {config.singular.toLowerCase()}.</p>
        )}
      </div>
    </div>
  );
}
