"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { whatsappHref } from "@/lib/utils";
import { SocialIcon } from "@/components/ui/social-icon";

/** Keeps the inquiry CTA reachable: WhatsApp bubble + a compact quote bar on small screens. */
export function FloatingActions({ whatsapp, companyName }: { whatsapp: string; companyName: string }) {
  const { dict, href } = useI18n();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const wa = whatsappHref(whatsapp, `Hello ${companyName.replace(/^\[|\]$/g, "")}, I would like a quotation.`);
  const onQuote = pathname.endsWith("/quote");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 p-4 sm:justify-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {!onQuote && (
            <Link
              href={href("/quote")}
              className="pointer-events-auto flex h-12 flex-1 items-center justify-center rounded-full bg-gold text-sm font-semibold text-ink shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] sm:hidden"
            >
              {dict.nav.quote}
            </Link>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.cta.whatsapp}
              className="pointer-events-auto grid size-12 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 sm:size-14"
            >
              <SocialIcon platform="whatsapp" className="size-6" />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
