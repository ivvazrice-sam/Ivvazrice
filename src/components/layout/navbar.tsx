"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Mail, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { cn, hasValue, mailHref, telHref, whatsappHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { lockScroll } from "@/components/ui/lightbox";
import { SmartImage } from "@/components/ui/smart-image";
import { Logo } from "./logo";

export interface NavCompany {
  name: string;
  logoUrl: string;
  logoDarkUrl: string;
  phone: string;
  email: string;
  whatsapp: string;
}

export interface NavExtras {
  products: { name: string; slug: string }[];
  images: { about: string; products: string; processing: string; export: string };
}

interface NavChild {
  label: string;
  href: string;
  desc?: string;
}
interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  image?: string;
  blurb?: string;
}

function useNavItems(extras: NavExtras): NavItem[] {
  const { dict } = useI18n();
  const d = dict.navDesc;
  return [
    { href: "/", label: dict.nav.home },
    {
      href: "/about",
      label: dict.nav.about,
      image: extras.images.about,
      blurb: dict.about.title,
      children: [
        { href: "/about", label: dict.nav.about, desc: d.about },
        { href: "/infrastructure", label: dict.nav.infrastructure, desc: d.infrastructure },
        { href: "/videos", label: dict.nav.videos, desc: d.videos },
      ],
    },
    {
      href: "/products",
      label: dict.nav.products,
      image: extras.images.products,
      blurb: dict.products.title,
      children: [
        { href: "/products", label: dict.nav.allProducts, desc: d.allProducts },
        ...extras.products.slice(0, 5).map((p) => ({ href: `/products/${p.slug}`, label: p.name })),
        { href: "/packaging", label: dict.nav.packaging, desc: d.packaging },
        { href: "/products#kitchen", label: dict.kitchen.title, desc: d.kitchen },
      ],
    },
    {
      href: "/processing",
      label: dict.nav.processing,
      image: extras.images.processing,
      blurb: dict.mill.title,
      children: [
        { href: "/processing", label: dict.nav.millLine, desc: d.millLine },
        { href: "/processing#technology", label: dict.nav.technology, desc: d.technology },
        { href: "/quality", label: dict.nav.quality, desc: d.quality },
      ],
    },
    {
      href: "/export",
      label: dict.nav.export,
      image: extras.images.export,
      blurb: dict.export.eyebrow,
      children: [
        { href: "/export", label: dict.nav.exportMarkets, desc: d.exportMarkets },
        { href: "/export#export-process", label: dict.nav.exportProcess, desc: d.exportProcess },
        { href: "/quote/status", label: dict.inquiry.track, desc: d.track },
      ],
    },
    { href: "/contact", label: dict.nav.contact },
  ];
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Compact dropdown card under a nav item: link list + small photo teaser. */
function NavDropdown({ item, href, exploreLabel }: { item: NavItem; href: (p: string) => string; exploreLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
    >
      <div className="flex w-[30rem] gap-3 rounded-2xl border border-ink/10 bg-pearl p-2.5 shadow-[0_30px_60px_-20px_rgba(27,49,37,0.45)]">
        <ul className="min-w-0 flex-1">
          {item.children!.map((c, ci) => (
            <motion.li key={c.href + c.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 + ci * 0.03, duration: 0.3, ease: EASE }}>
              <Link href={href(c.href)} className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-sage">
                <span className="min-w-0">
                  <span className="block truncate text-[0.85rem] text-ink">{c.label}</span>
                  {c.desc && <span className="block truncate text-[0.7rem] text-stone">{c.desc}</span>}
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-husk opacity-0 transition-all duration-300 group-hover:opacity-100" />
              </Link>
            </motion.li>
          ))}
        </ul>
        <Link href={href(item.href)} className="group relative block w-36 shrink-0 overflow-hidden rounded-xl bg-ink-3">
          {item.image && <SmartImage src={item.image} alt="" fill sizes="144px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
          <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
          <span className="absolute inset-x-3 bottom-3 text-xs font-semibold leading-snug text-pearl">
            {exploreLabel} {item.label} <ArrowUpRight className="inline size-3" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

export function Navbar({ company, extras }: { company: NavCompany; extras: NavExtras }) {
  const { dict, href, locale } = useI18n();
  const items = useNavItems(extras);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const current = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  const isActive = (item: NavItem) =>
    item.href === "/" ? current === "/" : current.startsWith(item.href) || !!item.children?.some((c) => current === c.href.split("#")[0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (menu === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
  }

  const openMenu = (i: number | null) => {
    clearTimeout(closeTimer.current);
    setMenu(i);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 160);
  };

  // On home page, hero has dark background → light text at top. On other pages, backgrounds are light → always use dark text.
  const isHome = current === "/";
  const light = !open && (scrolled || !isHome);

  const quick = [
    { label: dict.cta.call, href: hasValue(company.phone) ? telHref(company.phone) : "", icon: Phone },
    { label: dict.cta.email, href: hasValue(company.email) ? mailHref(company.email) : "", icon: Mail },
    { label: dict.cta.whatsapp, href: whatsappHref(company.whatsapp), icon: MessageCircle },
  ].filter((q) => q.href);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        {dict.nav.skip}
      </a>
      <header
        onMouseLeave={scheduleClose}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ease-[var(--ease-out-expo)]",
          open ? "border-b border-pearl/10 bg-ink" : scrolled ? "border-b border-ink/10 glass-light shadow-[0_10px_30px_-20px_rgba(27,49,37,0.35)]" : !isHome ? "border-b border-ink/5 glass-light" : "border-b border-transparent bg-transparent",
        )}
      >
        <nav aria-label="Primary" className={cn("container-x flex items-center justify-between gap-6 transition-[height] duration-700 ease-[var(--ease-out-expo)]", scrolled ? "h-[68px]" : "h-[88px]")}>
          <Link
            href={href("/")}
            aria-label={`${company.name} — ${dict.nav.home}`}
            className="relative z-10"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setOpen(false);
              }
            }}
          >
            <Logo name={company.name} logoUrl={company.logoUrl} logoDarkUrl={company.logoDarkUrl} tone={open || (!scrolled && isHome) ? "light" : "dark"} height={scrolled ? 30 : 36} className="transition-[height] duration-500" />
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {items.map((item, i) => (
              <li key={item.href} className="relative" onMouseEnter={() => openMenu(item.children ? i : null)}>
                {item.children ? (
                  <>
                  <button
                    type="button"
                    aria-expanded={menu === i}
                    aria-haspopup="true"
                    onClick={() => setMenu((m) => (m === i ? null : i))}
                    onFocus={() => openMenu(i)}
                    className={cn(
                      "relative flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-[0.9rem] font-bold transition-colors duration-300",
                      light ? (isActive(item) || menu === i ? "text-ink" : "text-ink/90 hover:text-ink") : isActive(item) || menu === i ? "text-pearl" : "text-pearl/90 hover:text-pearl",
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn("size-3.5 transition-transform duration-300", menu === i && "rotate-180")} />
                    {isActive(item) && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-px bg-gold" transition={{ duration: 0.6, ease: EASE }} />}
                  </button>
                  <AnimatePresence>
                    {menu === i && <NavDropdown item={item} href={href} exploreLabel={dict.nav.explore} />}
                  </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={href(item.href)}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={cn(
                      "relative block whitespace-nowrap rounded-full px-4 py-2 text-[0.9rem] font-bold transition-colors duration-300",
                      light ? (isActive(item) ? "text-ink" : "text-ink/90 hover:text-ink") : isActive(item) ? "text-pearl" : "text-pearl/90 hover:text-pearl",
                    )}
                  >
                    {item.label}
                    {isActive(item) && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-px bg-gold" transition={{ duration: 0.6, ease: EASE }} />}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="relative z-10 flex items-center gap-3">
            <ButtonLink href={href("/quote")} variant="gold" size="sm" className="hidden sm:inline-flex" arrow>
              {dict.nav.quote}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? dict.nav.close : dict.nav.menu}
              className={cn("grid size-11 place-items-center rounded-full border transition-colors xl:hidden", light ? "border-ink/15 text-ink hover:bg-ink/5" : "border-pearl/15 text-pearl hover:bg-pearl/10")}
            >
              <span className="relative block h-3 w-5">
                <span className={cn("absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]", open && "translate-y-1.5 rotate-45")} />
                <span className={cn("absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]", open && "-translate-y-1.5 -rotate-45")} />
              </span>
            </button>
          </div>
        </nav>

      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink text-pearl xl:hidden"
            data-lenis-prevent
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="container-x flex flex-1 flex-col pb-10 pt-28">
              <ul className="flex flex-col">
                {items.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.8, ease: EASE }}
                    className="border-b border-pearl/10"
                  >
                    <div className="flex items-center justify-between">
                      <Link href={href(item.href)} className="flex-1 py-3.5">
                        <span className={cn("display text-[2rem] sm:text-5xl", isActive(item) ? "text-gold-2" : "text-pearl")}>{item.label}</span>
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          aria-label={`${item.label} — ${dict.nav.menu}`}
                          aria-expanded={expanded === i}
                          onClick={() => setExpanded((e) => (e === i ? null : i))}
                          className="grid size-11 place-items-center rounded-full border border-pearl/15"
                        >
                          <ChevronDown className={cn("size-4 transition-transform duration-300", expanded === i && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {item.children && expanded === i && (
                        <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                          {item.children.map((c) => (
                            <li key={c.href + c.label}>
                              <Link href={href(c.href)} className="block py-2 pl-1 text-base text-pearl/65">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                          <li className="h-3" />
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
              </ul>
              <motion.div className="mt-auto flex flex-col gap-4 pt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
                <ButtonLink href={href("/quote")} variant="gold" size="lg" arrow>
                  {dict.nav.quote}
                </ButtonLink>
                {quick.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {quick.map((q) => (
                      <a key={q.label} href={q.href} className="flex flex-col items-center gap-1.5 rounded-2xl border border-pearl/10 py-3 text-xs text-pearl/70">
                        <q.icon className="size-4" strokeWidth={1.6} />
                        {q.label}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
