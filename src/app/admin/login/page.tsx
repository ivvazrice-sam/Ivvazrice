import { redirect } from "next/navigation";
import { authMode, getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { LoginRiceStage } from "@/components/admin/login-rice-stage";
import { Logo } from "@/components/layout/logo";
import { getStore } from "@/lib/content/store";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const mode = authMode();
  const company = await (await getStore("public")).getCompany();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <LoginRiceStage />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <Logo name={company.name} logoUrl={company.logoUrl} height={48} className="absolute left-12 top-12" />
        <p className="display absolute bottom-12 left-12 max-w-md text-5xl text-pearl">
          Content &amp; <span className="italic text-gold-2">export desk.</span>
        </p>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-husk">Admin</p>
          <h1 className="display mt-3 text-4xl">Sign in</h1>
          {mode === "unconfigured" ? (
            <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
              Admin access is not configured yet. Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> and <code>SESSION_SECRET</code> (local mode) or the Supabase
              variables in your environment. Run <code>npm run hash-password</code> to create a password hash.
            </div>
          ) : (
            <LoginForm />
          )}
          <p className="mt-8 text-xs text-stone">Mode: {mode === "supabase" ? "Supabase Auth" : mode === "local" ? "Local credentials" : "Not configured"}</p>
        </div>
      </div>
    </div>
  );
}
