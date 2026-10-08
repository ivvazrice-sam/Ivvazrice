import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublic, supabaseService, supabaseSession } from "@/lib/supabase/server";
import { normalizeCompany, normalizeItem, normalizeSettings } from "./defaults";
import { filterInquiries, type ContentStore, type StoreScope } from "./store";
import type { CollectionKey, ContactMessage, Inquiry, Product } from "./types";

/** Maps content collections to Postgres tables (see supabase/migrations). */
export const TABLES: Record<CollectionKey, string> = {
  products: "products",
  processingSteps: "processing_steps",
  technologies: "technologies",
  qualityChecks: "quality_checks",
  certifications: "certifications",
  trustItems: "trust_items",
  exportCountries: "export_countries",
  exportRoutes: "export_routes",
  exportSteps: "export_steps",
  factoryMedia: "factory_media",
  videos: "videos",
  kitchenVideos: "kitchen_videos",
  packaging: "packaging",
  testimonials: "testimonials",
  partnerReasons: "partner_reasons",
  socialLinks: "social_links",
};

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function rowToObj(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out;
}

function objToRow(obj: Record<string, unknown>, omit: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (!omit.includes(k)) out[toSnake(k)] = v;
  return out;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function createSupabaseStore(scope: StoreScope): Promise<ContentStore> {
  const db: SupabaseClient =
    scope === "public" ? supabasePublic() : scope === "service" ? supabaseService() : await supabaseSession();

  async function attachProductMedia(products: Record<string, unknown>[]) {
    if (!products.length) return products;
    const ids = products.map((p) => p.id as string);
    const [images, videos] = await Promise.all([
      db.from("product_images").select("*").in("product_id", ids).order("sort_order"),
      db.from("product_videos").select("*").in("product_id", ids).order("sort_order"),
    ]);
    const imgRows = check(images) ?? [];
    const vidRows = check(videos) ?? [];
    return products.map((p) => ({
      ...p,
      images: imgRows.filter((r) => r.product_id === p.id).map((r) => ({ url: r.url, alt: r.alt ?? "" })),
      videos: vidRows
        .filter((r) => r.product_id === p.id)
        .map((r) => ({ title: r.title ?? "", provider: r.provider, url: r.url, posterUrl: r.poster_url ?? "" })),
    }));
  }

  async function saveProductMedia(product: Product) {
    check(await db.from("product_images").delete().eq("product_id", product.id));
    check(await db.from("product_videos").delete().eq("product_id", product.id));
    if (product.images.length)
      check(
        await db
          .from("product_images")
          .insert(product.images.map((img, i) => ({ product_id: product.id, url: img.url, alt: img.alt, sort_order: i }))),
      );
    if (product.videos.length)
      check(
        await db.from("product_videos").insert(
          product.videos.map((v, i) => ({
            product_id: product.id,
            title: v.title,
            provider: v.provider,
            url: v.url,
            poster_url: v.posterUrl,
            sort_order: i,
          })),
        ),
      );
  }

  return {
    async getCompany() {
      const data = check(await db.from("companies").select("*").eq("id", "default").maybeSingle());
      return normalizeCompany(data ? rowToObj(data) : null);
    },
    async getSettings() {
      const data = check(await db.from("site_settings").select("value").eq("key", "global").maybeSingle());
      return normalizeSettings(data?.value ?? null);
    },
    async list(key, opts) {
      let query = db.from(TABLES[key]).select("*").order("sort_order");
      if (!opts?.includeUnpublished) query = query.eq("published", true);
      let rows = (check(await query) ?? []).map(rowToObj);
      if (key === "products") rows = await attachProductMedia(rows);
      return rows.map((r) => normalizeItem(key, r as never));
    },
    async get(key, id) {
      const data = check(await db.from(TABLES[key]).select("*").eq("id", id).maybeSingle());
      if (!data) return null;
      let obj = rowToObj(data);
      if (key === "products") [obj] = await attachProductMedia([obj]);
      return normalizeItem(key, obj as never);
    },

    async saveCompany(data) {
      check(await db.from("companies").upsert({ ...objToRow(data as never), id: "default", updated_at: new Date().toISOString() }));
    },
    async saveSettings(data) {
      check(await db.from("site_settings").upsert({ key: "global", value: data, updated_at: new Date().toISOString() }));
    },
    async upsert(key, item) {
      const withId = { ...item, id: item.id || crypto.randomUUID() };
      const row = objToRow(withId as never, key === "products" ? ["images", "videos"] : []);
      check(await db.from(TABLES[key]).upsert(row));
      if (key === "products") await saveProductMedia(withId as unknown as Product);
      return withId;
    },
    async remove(key, id) {
      check(await db.from(TABLES[key]).delete().eq("id", id));
    },

    async createInquiry(data) {
      const row = check(await db.from("inquiries").insert(objToRow(data as never)).select("*").single());
      return rowToObj(row) as unknown as Inquiry;
    },
    async listInquiries(filter) {
      let query = db.from("inquiries").select("*").order("created_at", { ascending: false }).limit(1000);
      if (filter?.status && filter.status !== "all") query = query.eq("status", filter.status);
      const rows = (check(await query) ?? []).map((r) => rowToObj(r) as unknown as Inquiry);
      return filterInquiries(rows, { q: filter?.q });
    },
    async getInquiry(id) {
      const row = check(await db.from("inquiries").select("*").eq("id", id).maybeSingle());
      return row ? (rowToObj(row) as unknown as Inquiry) : null;
    },
    async updateInquiry(id, patch) {
      check(await db.from("inquiries").update({ ...objToRow(patch), updated_at: new Date().toISOString() }).eq("id", id));
    },
    async deleteInquiry(id) {
      check(await db.from("inquiries").delete().eq("id", id));
    },
    async findInquiry(reference, email) {
      const row = check(
        await db.from("inquiries").select("*").eq("reference", reference.toUpperCase()).eq("email", email.toLowerCase()).maybeSingle(),
      );
      return row ? (rowToObj(row) as unknown as Inquiry) : null;
    },

    async createContactMessage(data) {
      const row = check(await db.from("contact_messages").insert(objToRow(data as never)).select("*").single());
      return rowToObj(row) as unknown as ContactMessage;
    },
    async listContactMessages() {
      const rows = check(await db.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(1000));
      return (rows ?? []).map((r) => rowToObj(r) as unknown as ContactMessage);
    },
    async updateContactMessage(id, patch) {
      check(await db.from("contact_messages").update(objToRow(patch)).eq("id", id));
    },
    async deleteContactMessage(id) {
      check(await db.from("contact_messages").delete().eq("id", id));
    },
  };
}
