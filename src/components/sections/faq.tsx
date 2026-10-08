"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const faqs = [
  {
    question: "What is your minimum order quantity (MOQ)?",
    answer: "Our standard MOQ is 10 MT for premium varieties like ROYALE. For other varieties, MOQ ranges from 15-30 MT. For custom packaging and private label orders, we recommend 20 MT minimum.",
  },
  {
    question: "What is your typical delivery timeline?",
    answer: "Orders are typically dispatched within 15-18 days of order confirmation. Standard sea freight to major ports takes 15-30 days depending on destination. We can arrange expedited shipping for urgent orders.",
  },
  {
    question: "Do you offer private label and custom packaging?",
    answer: "Yes! We provide complete private label services including artwork design consultation, custom pack sizes (1kg to 50kg), premium materials, and dedicated manufacturing. MOQ for private label starts at 20 MT.",
  },
  {
    question: "Which quality certifications do you hold?",
    answer: "Ivvaz holds 13 quality certifications including ISO 9001:2015, ISO 22000:2018 (Food Safety), HACCP, APEDA registration, FSSAI license, and various international food safety certifications. All documents available on request.",
  },
  {
    question: "Which payment terms do you accept?",
    answer: "We work with LC at Sight, LC 30/60/90 days, TT in advance, and DP/DA for established buyers. All payments through international banking channels with complete documentation.",
  },
  {
    question: "Can you ship samples before placing a bulk order?",
    answer: "Absolutely! We provide 1-2 kg samples of any variety for quality evaluation. Samples are shipped via DHL/FedEx with buyer bearing courier costs. Lab reports and specifications included.",
  },
  {
    question: "What incoterms do you work with?",
    answer: "We work flexibly with FOB (Mundra/Nhava Sheva), CFR, CIF, DAP, and DDP as per buyer preference. Our team handles all export documentation including Phytosanitary, Certificate of Origin, and Fumigation certificates.",
  },
  {
    question: "Which countries do you currently export to?",
    answer: "We export to 95+ countries across the Middle East (UAE, Saudi Arabia, Iran, Iraq, Kuwait), Europe (UK, Germany, Netherlands), Americas (USA, Canada), Africa (Kenya, Nigeria), and Asia-Pacific (Singapore, Malaysia, Australia).",
  },
];

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
