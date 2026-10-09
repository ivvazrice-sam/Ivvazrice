"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQS as faqs } from "./faq-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-y bg-pearl">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5">
            <span className="size-1.5 rounded-full bg-gold" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold">Common Questions</span>
          </div>
          <h2 className="display mt-6 text-4xl text-ink sm:text-5xl lg:text-6xl">
            Everything buyers want <br />
            <span className="italic text-husk">to know.</span>
          </h2>
          <p className="mt-5 text-stone">
            Answers to the most common questions from international importers and distributors.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-ivory"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-pearl"
                aria-expanded={openIndex === i}
              >
                <span className="font-display text-lg text-ink sm:text-xl">{faq.question}</span>
                <motion.span animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="size-5 shrink-0 text-husk" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <div className="px-6 pb-6 text-stone leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
