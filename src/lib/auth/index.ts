import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocalAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { supabaseSession } from "@/lib/supabase/server";
import { SESSION_COOKIE, verifySession, type AdminUser, type Role } from "./session";

export type { AdminUser, Role };

/** What each role may do. Enforced in every admin page, server action and API route. */
export const PERMISSIONS = {
  content: ["admin", "editor"],
  deleteContent: ["admin", "editor"],
  settings: ["admin"],
  leads: ["admin", "sales"],
  deleteLeads: ["admin"],
  upload: ["admin", "editor"],
} satisfies Record<string, Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export const can = (user: AdminUser | null, permission: Permission) => !!user && (PERMISSIONS[permission] as Role[]).includes(user.role);

export function authMode(): "supabase" | "local" | "unconfigured" {
  if (isSupabaseConfigured()) return "supabase";
  if (isLocalAdminConfigured()) return "local";
  return "unconfigured";
}

export async function getAdmin(): Promise<AdminUser | null> {
  const mode = authMode();
  if (mode === "supabase") {
    const db = await supabaseSession();
    const { data } = await db.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await db.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
    if (!row?.role) return null;
    return { email: data.user.email ?? "", role: row.role as Role };
  }
  if (mode === "local") {
    return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  }
  return null;
}

/** Guard for admin pages and server actions: redirects to login, or back to the dashboard on insufficient role. */
export async function requireAdmin(permission?: Permission): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (permission && !can(user, permission)) redirect("/admin?denied=1");
  return user;
}
