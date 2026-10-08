"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authMode, requireAdmin } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_TTL, signSession, verifyPassword } from "@/lib/auth/session";
import { coerce } from "@/lib/admin/coerce";
import { BASE_FIELDS, COMPANY_FIELDS, collectionBySlug, SETTINGS_FIELDS } from "@/lib/admin/schema";
import { normalizeItem } from "@/lib/content/defaults";
import { getStore } from "@/lib/content/store";
import { INQUIRY_STATUSES, type CompanyProfile, type InquiryStatus, type SiteSettings } from "@/lib/content/types";
import { env } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import { supabaseSession } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string; errors?: Record<string, string>; id?: string };

/** Content changes are pushed to the statically rendered site immediately. */
const refreshSite = () => revalidatePath("/", "layout");

// ——— Auth ———

export async function login(_: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000).ok) return { error: "Too many attempts. Try again in 15 minutes." };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const mode = authMode();
  if (mode === "supabase") {
    const db = await supabaseSession();
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error: "Invalid email or password." };
    const { data: row } = await db.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
    if (!row) {
      await db.auth.signOut();
      return { error: "This account does not have admin access." };
    }
  } else if (mode === "local") {
    const okEmail = email === env.adminEmail.toLowerCase();
    const okPassword = await verifyPassword(password, env.adminPasswordHash);
    if (!okEmail || !okPassword) return { error: "Invalid email or password." };
    (await cookies()).set(SESSION_COOKIE, await signSession({ email, role: "admin" }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL,
    });
  } else {
    return { error: "Admin login is not configured. See README → Admin setup." };
  }
  redirect("/admin");
}

export async function logout() {
  if (authMode() === "supabase") await (await supabaseSession()).auth.signOut();
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ——— Content ———

export async function saveCollectionItem(slug: string, id: string, payload: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin("content");
  const config = collectionBySlug(slug);
  if (!config) return { ok: false, error: "Unknown collection" };
  const { data, errors } = coerce([...config.fields, ...BASE_FIELDS], payload);
  if (Object.keys(errors).length) return { ok: false, error: "Please fix the highlighted fields.", errors };

  const store = await getStore("admin");
  if (config.key === "products") {
    const clash = (await store.list("products", { includeUnpublished: true })).find((p) => p.slug === data.slug && p.id !== id);
    if (clash) return { ok: false, error: "Another product already uses this URL slug.", errors: { slug: "Already in use" } };
  }
  try {
    const saved = await store.upsert(config.key, normalizeItem(config.key, { ...data, id: id === "new" ? "" : id } as never));
    refreshSite();
    return { ok: true, id: saved.id };
  } catch (err) {
    console.error("[admin/save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function deleteCollectionItem(slug: string, id: string) {
  await requireAdmin("deleteContent");
  const config = collectionBySlug(slug);
  if (!config) return;
  await (await getStore("admin")).remove(config.key, id);
  refreshSite();
  revalidatePath(`/admin/content/${slug}`);
}

export async function togglePublished(slug: string, id: string) {
  await requireAdmin("content");
  const config = collectionBySlug(slug);
  if (!config) return;
  const store = await getStore("admin");
  const item = await store.get(config.key, id);
  if (!item) return;
  await store.upsert(config.key, { ...item, published: !item.published } as never);
  refreshSite();
  revalidatePath(`/admin/content/${slug}`);
}

export async function saveCompany(payload: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin("settings");
  const { data, errors } = coerce(COMPANY_FIELDS, payload);
  if (Object.keys(errors).length) return { ok: false, error: "Please fix the highlighted fields.", errors };
  const store = await getStore("admin");
  await store.saveCompany({ ...(await store.getCompany()), ...(data as Partial<CompanyProfile>) });
  refreshSite();
  return { ok: true };
}

export async function saveSettings(payload: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin("settings");
  const { data, errors } = coerce(SETTINGS_FIELDS, payload);
  if (Object.keys(errors).length) return { ok: false, error: "Please fix the highlighted fields.", errors };
  const store = await getStore("admin");
  await store.saveSettings({ ...(await store.getSettings()), ...(data as Partial<SiteSettings>) });
  refreshSite();
  return { ok: true };
}

// ——— Leads ———

export async function updateInquiry(id: string, form: FormData) {
  await requireAdmin("leads");
  const status = String(form.get("status"));
  const notes = sanitizeText(String(form.get("notes") ?? "")).slice(0, 10_000);
  if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) return;
  await (await getStore("admin")).updateInquiry(id, { status: status as InquiryStatus, notes });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function deleteInquiry(id: string) {
  await requireAdmin("deleteLeads");
  await (await getStore("admin")).deleteInquiry(id);
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries");
}

export async function setMessageStatus(id: string, status: "new" | "read" | "archived") {
  await requireAdmin("leads");
  if (!["new", "read", "archived"].includes(status)) return;
  await (await getStore("admin")).updateContactMessage(id, { status });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireAdmin("deleteLeads");
  await (await getStore("admin")).deleteContactMessage(id);
  revalidatePath("/admin/messages");
}
