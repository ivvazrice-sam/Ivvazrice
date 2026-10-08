"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          aria-label="Back to top"
          className="fixed bottom-6 left-6 z-40 grid size-12 place-items-center rounded-full bg-ink text-pearl shadow-[0_10px_30px_-10px_rgba(27,49,37,0.5)] transition-all hover:scale-110 hover:bg-gold hover:text-ink"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
