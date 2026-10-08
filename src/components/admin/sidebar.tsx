"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, ExternalLink, Inbox, LayoutDashboard, LogOut, Mail, Menu, Settings, X } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  user: { email: string; role: string };
  collections: { slug: string; label: string }[];
  canContent: boolean;
  canLeads: boolean;
  canSettings: boolean;
  newLeads: number;
}

export function Sidebar({ user, collections, canContent, canLeads, canSettings, newLeads }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const link = (href: string, label: string, Icon?: React.ComponentType<{ className?: string }>, badge?: number) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-[0.84rem] transition-colors",
        active(href) ? "bg-pearl/10 text-pearl" : "text-pearl/55 hover:bg-pearl/5 hover:text-pearl",
      )}
    >
      {Icon && <Icon className="size-4" />}
      <span className="flex-1 truncate">{label}</span>
      {!!badge && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-ink">{badge}</span>}
    </Link>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-5 py-3 text-pearl lg:hidden">
        <span className="font-display text-lg">Admin</span>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Menu" className="grid size-10 place-items-center">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-y-auto bg-ink px-4 py-6 text-pearl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0 pt-20" : "-translate-x-full",
        )}
      >
        <p className="px-3 font-display text-xl">Control room</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {link("/admin", "Dashboard", LayoutDashboard)}
          {canLeads && link("/admin/inquiries", "Inquiries", Inbox, newLeads)}
          {canLeads && link("/admin/messages", "Messages", Mail)}
          {canSettings && (
            <>
              <p className="eyebrow mb-1 mt-6 px-3 text-[0.6rem] text-pearl/35">Company</p>
              {link("/admin/company", "Company profile", Building2)}
              {link("/admin/settings", "Site settings", Settings)}
            </>
          )}
          {canContent && (
            <>
              <p className="eyebrow mb-1 mt-6 px-3 text-[0.6rem] text-pearl/35">Content</p>
              {collections.map((c) => link(`/admin/content/${c.slug}`, c.label))}
            </>
          )}
        </nav>
        <div className="mt-8 border-t border-pearl/10 pt-5">
          <a href="/" target="_blank" className="flex items-center gap-2 px-3 text-xs text-pearl/55 hover:text-pearl">
            <ExternalLink className="size-3.5" /> View website
          </a>
          <p className="mt-4 truncate px-3 text-xs text-pearl/40">
            {user.email} · {user.role}
          </p>
          <form action={logout}>
            <button type="submit" className="mt-3 flex items-center gap-2 px-3 text-xs text-pearl/55 hover:text-pearl">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
