"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bot, Mail, MessageCircle, Phone, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { whatsappHref } from "@/lib/utils";
import { SocialIcon } from "@/components/ui/social-icon";

type Msg = { from: "bot" | "user"; text: string; quick?: QuickReply[] };
type QuickReply = { label: string; answer: string; next?: QuickReply[] };

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Chat widget: floating bubble bottom-right that opens a panel with a scripted
 * knowledge-base conversation (products, MOQ, shipping, samples, pricing),
 * with instant handoff to WhatsApp / email / phone for anything that goes off-script.
 */
export function ChatWidget({ company }: { company: { name: string; whatsapp: string; email: string; phone: string } }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const name = company.name.replace(/^\[|\]$/g, "");

  const QUICK: QuickReply[] = [
    {
      label: "What rice varieties do you offer?",
      answer: "We export Basmati rice in multiple grades — ROYALE (1401 Steam), IMPERIAL, PRO, SELECT, CHOICE — plus specialty varieties. Each has distinct grain length, aroma and cooking character. Would you like a specific one?",
      next: [
        { label: "Tell me about ROYALE", answer: "ROYALE is our flagship 1401 Steam Basmati: 8.50–8.65 mm raw grain, 22–24 mm cooked, exceptional aroma and separation. Steam-processed to preserve fragrance. Perfect for fine-dining and premium retail." },
        { label: "What's the price range?", answer: "Pricing depends on grade, packaging, order size and current market. For a formal quote with FOB/CIF rates to your destination, please request a quote or chat on WhatsApp." },
      ],
    },
    {
      label: "What is your minimum order quantity (MOQ)?",
      answer: "Standard MOQ is 1 x 20ft FCL container (approx 24–26 MT). For LCL / mixed loads or trial shipments, speak with us on WhatsApp — we accommodate serious buyers.",
    },
    {
      label: "Which countries do you export to?",
      answer: "We ship to 25+ countries across the Middle East, Europe, Africa, Southeast Asia and the Americas. Regular routes include UAE, Saudi Arabia, Kuwait, UK, USA, Canada, Australia. Tell us your destination for shipping details.",
    },
    {
      label: "How do I request a sample?",
      answer: "Samples are available for serious buyers against courier charges. Share your company details, destination country and target variety — we'll courier a 1kg sample pack with full QC data.",
    },
    {
      label: "What's the export process?",
      answer: "1) Enquiry + sample  2) Quotation (FOB/CIF)  3) PI / Contract  4) 30% advance, 70% against BL  5) Production + QC  6) Container stuffing with photos  7) Shipment with full documentation (BL, Phyto, FSSAI, COO, etc.)",
    },
    {
      label: "What certifications do you hold?",
      answer: "ISO 9001:2015, FSSAI, APEDA registration, IEC, HACCP-aligned processing. Non-GMO verified sourcing. Full certification pack available on request.",
    },
  ];

  const greet = (): Msg[] => [
    { from: "bot", text: `Hi there — welcome to ${name}. I can answer quick questions about our rice, pricing, shipping or export process. What would you like to know?`, quick: QUICK },
  ];

  useEffect(() => {
    if (open && messages.length === 0) setMessages(greet());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function send(q: QuickReply) {
    setMessages((m) => [...m, { from: "user", text: q.label }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: q.answer, quick: q.next ?? QUICK }]);
    }, 500 + Math.random() * 400);
  }

  function matchReply(text: string): QuickReply | null {
    const t = text.toLowerCase();
    const has = (...kw: string[]) => kw.some((k) => t.includes(k));
    if (has("price", "rate", "cost", "quote", "quotation", "fob", "cif")) {
      return { label: "Pricing", answer: "Pricing depends on grade, packaging, order size and current market. For a formal FOB/CIF quote to your destination, please request a quote or chat on WhatsApp — we'll share rates the same day." };
    }
    if (has("moq", "minimum", "min order", "container", "fcl", "lcl")) {
      return { label: "MOQ", answer: "Standard MOQ is 1 x 20ft FCL container (approx 24–26 MT). For LCL or trial loads, speak with us on WhatsApp — we accommodate serious buyers." };
    }
    if (has("sample")) {
      return { label: "Samples", answer: "Samples are available for serious buyers against courier charges. Share your company details, destination country and target variety — we'll courier a 1kg sample pack with full QC data." };
    }
    if (has("ship", "deliver", "lead time", "transit", "port")) {
      return { label: "Shipping", answer: "We ship from Mundra / Nhava Sheva. Typical production + stuffing is 10–14 days after PI, then sea transit by lane (e.g. Dubai ~5 days, UK ~20, USA east ~28). Share your destination for an exact lane." };
    }
    if (has("payment", "advance", "bl", "lc", "letter of credit")) {
      return { label: "Payment", answer: "Standard terms: 30% advance on PI, 70% against scanned BL. We also work with LC at sight for established buyers. Full documentation included (BL, Phyto, FSSAI, COO, etc.)." };
    }
    if (has("certif", "iso", "fssai", "apeda", "haccp", "non-gmo")) {
      return { label: "Certifications", answer: "ISO 9001:2015, FSSAI, APEDA registration, IEC, HACCP-aligned processing. Non-GMO verified sourcing. Full certification pack available on request." };
    }
    if (has("country", "export", "destination", "where")) {
      return { label: "Export countries", answer: "We ship to 25+ countries across the Middle East, Europe, Africa, Southeast Asia and the Americas. Regular routes include UAE, Saudi Arabia, Kuwait, UK, USA, Canada and Australia. Tell us your destination for shipping details." };
    }
    if (has("basmati", "rice", "variety", "grade", "royale", "imperial", "1121", "1401")) {
      return { label: "Varieties", answer: "We export Basmati rice in multiple grades — ROYALE (1401 Steam), IMPERIAL, PRO, SELECT, CHOICE — plus specialty varieties. Each has distinct grain length, aroma and cooking character. Tell us the grade you're looking at." };
    }
    if (has("package", "packaging", "bag", "jute", "pp", "box", "label", "private")) {
      return { label: "Packaging", answer: "Standard packs: 1kg / 5kg / 10kg / 20kg / 25kg in jute, PP woven or non-woven bags, plus printed consumer cartons. Private-label and custom print are supported — share artwork and quantity." };
    }
    if (has("contact", "address", "office", "visit", "mill")) {
      return { label: "Contact", answer: `You can reach us by WhatsApp, email or phone — buttons below open each one. Mill visits are welcome by appointment.` };
    }
    if (has("hi", "hello", "hey", "namaste", "salaam", "assalam")) {
      return { label: "Hi", answer: `Hi — welcome to ${name}. Ask me about varieties, pricing, MOQ, samples, shipping or certifications, or tap a quick question below.` };
    }
    if (has("thanks", "thank you", "shukriya")) {
      return { label: "Thanks", answer: "You're welcome. If you'd like to move forward, request a quote or hop onto WhatsApp — our export desk will take it from there." };
    }
    return null;
  }

  function sendFree() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const match = matchReply(text);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        match
          ? { from: "bot", text: match.answer, quick: QUICK }
          : {
              from: "bot",
              text: `Thanks for your message — I didn't catch that exactly. For a detailed reply, our export desk is best over WhatsApp or email (buttons below). Or pick one of these:`,
              quick: QUICK,
            },
      ]);
    }, 500 + Math.random() * 400);
  }

  const wa = whatsappHref(company.whatsapp, `Hi ${name}, I'd like to discuss a rice export inquiry.`);

  return (
    <>
      {/* AI chat — top */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open AI chat"}
        className="pointer-events-auto fixed bottom-20 right-5 z-40 grid size-12 place-items-center rounded-full bg-ink text-pearl shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-gold/30 transition-transform hover:scale-105 sm:bottom-24 sm:right-6 sm:size-14"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span key="chat" className="relative" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="size-5" />
              <Sparkles className="absolute -right-1 -top-1 size-2.5 text-gold" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-gold/30" aria-hidden />
        )}
      </motion.button>

      {/* WhatsApp — bottom */}
      <AnimatePresence>
        {wa && !open && (
          <motion.a
            key="wa-float"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="pointer-events-auto fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:size-14"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
          >
            <SocialIcon platform="whatsapp" className="size-5 sm:size-6" />
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-label={`Chat with ${name}`}
            className="pointer-events-auto fixed bottom-24 right-4 z-40 flex h-[560px] max-h-[80vh] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-pearl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ring-1 ring-ink/10 sm:right-6"
          >
            {/* Header */}
            <div className="relative bg-ink px-5 py-4 text-pearl">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-gold text-ink">
                  <MessageCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{name} · Export Desk</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-pearl/70">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Online · typically replies within an hour
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="grid size-8 place-items-center rounded-full text-pearl/70 transition hover:bg-pearl/10 hover:text-pearl"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto bg-pearl px-4 py-5">
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "bg-ink text-pearl" : "bg-white text-ink ring-1 ring-ink/10"}`}>
                      {m.text}
                    </div>
                  </div>
                  {m.quick && m.from === "bot" && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {m.quick.map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => send(q)}
                          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-left text-[12.5px] font-medium text-ink transition hover:border-gold hover:bg-gold/10"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-ink/10">
                    <span className="inline-flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-ink/50" style={{ animationDelay: "0ms" }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink/50" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink/50" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendFree();
              }}
              className="flex items-center gap-2 border-t border-ink/10 bg-white px-3 py-2.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-ink outline-none placeholder:text-stone/60"
              />
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-full bg-ink text-pearl transition hover:bg-ink/90 disabled:opacity-40"
                disabled={!input.trim()}
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </form>

            {/* Handoff bar */}
            <div className="grid grid-cols-3 gap-px border-t border-ink/10 bg-ink/10 text-[11px] font-semibold text-ink">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-pearl py-2.5 transition hover:bg-white">
                  <SocialIcon platform="whatsapp" className="size-4" />
                  WhatsApp
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center justify-center gap-1.5 bg-pearl py-2.5 transition hover:bg-white">
                  <Mail className="size-4" />
                  Email
                </a>
              )}
              {company.phone && (
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="flex items-center justify-center gap-1.5 bg-pearl py-2.5 transition hover:bg-white">
                  <Phone className="size-4" />
                  Call
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
