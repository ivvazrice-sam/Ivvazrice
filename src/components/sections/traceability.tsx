"use client";

import { motion } from "motion/react";
import { Fingerprint, FileSearch, Package, Shield, TrendingUp, Award } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const stages = [
  {
    icon: Fingerprint,
    number: "01",
    title: "Lot Tracing",
    description: "Every batch assigned a unique lot number traceable from paddy intake to export container.",
  },
  {
    icon: FileSearch,
    number: "02",
    title: "Quality Records",
    description: "Full documentation of moisture, grain length, whiteness and broken percentage per lot.",
  },
  {
    icon: Shield,
    number: "03",
    title: "Lab Testing",
    description: "Pesticide and heavy metal testing at accredited labs for every export consignment.",
  },
  {
    icon: Package,
    number: "04",
    title: "Container Verification",
    description: "Loading photographs, seal numbers and container details recorded for every shipment.",
  },
];

const stats = [
  { value: "750", label: "MT daily capacity", icon: TrendingUp },
  { value: "275K", label: "MT annual exports", icon: Package },
  { value: "95+", label: "Countries served", icon: Shield },
  { value: "13", label: "Quality certifications", icon: Award },
];

export function TraceabilitySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink via-[#1f3b2a] to-ink py-20 text-pearl sm:py-28">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-40 -top-40 size-96 rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-[500px] rounded-full bg-gradient-to-tr from-leaf/15 to-transparent blur-3xl" />
      </div>

      <div className="container-x relative">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5">
            <span className="size-1.5 rounded-full bg-gold" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold">Full Traceability</span>
          </div>
          <h2 className="display mt-5 text-4xl text-pearl sm:text-5xl lg:text-6xl">
            From our fields <br />
            <span className="text-gold">to your table.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-pearl/70 sm:text-lg">
            Every grain we export carries a complete documentation trail. Full transparency from paddy intake through milling, testing, and container loading.
          </p>
        </div>

        {/* Journey Stages */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-pearl/10 bg-pearl/5 p-6 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-pearl/[0.08]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/20">
                    <Icon className="size-5 text-gold" />
                  </div>
                  <span className="font-display text-sm text-pearl/30 tabular-nums">{stage.number}</span>
                </div>
                <h3 className="mt-5 font-display text-xl text-pearl">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pearl/60">{stage.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Metrics */}
        <div className="mt-20 grid gap-6 border-t border-pearl/10 pt-16 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                className="flex items-center gap-4"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 ring-1 ring-gold/20">
                  <Icon className="size-6 text-gold" />
                </div>
                <div>
                  <div className="font-display text-3xl text-pearl">{stat.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-pearl/50">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
