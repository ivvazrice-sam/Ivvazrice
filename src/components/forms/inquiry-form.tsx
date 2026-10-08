"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { fieldErrors, inquirySchema } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Field, Honeypot, inputClass, type Tone } from "./fields";

type Values = {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  packaging: string;
  message: string;
  consent: boolean;
};

const EMPTY: Values = { name: "", company: "", country: "", email: "", phone: "", product: "", quantity: "", packaging: "", message: "", consent: false };

export function InquiryForm({
  products,
  packaging,
  countries,
  defaultProduct = "",
  defaultMessage = "",
  tone = "dark",
}: {
  products: string[];
  packaging: string[];
  /** Resolved on the server so SSR and hydration share the exact same names. */
  countries: string[];
  defaultProduct?: string;
  defaultMessage?: string;
  tone?: Tone;
}) {
  const { dict, href, locale } = useI18n();
  const t = dict.inquiry;
  const [values, setValues] = useState<Values>({ ...EMPTY, product: defaultProduct, message: defaultMessage });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);
  const [honey, setHoney] = useState("");
  const startedAt = useRef(0);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    if (!startedAt.current) startedAt.current = Date.now();
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _removed, ...rest }) => rest);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...values, website: honey, startedAt: startedAt.current || Date.now() - 10_000, locale };
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(`inq-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setMessage(data.error || t.errorGeneric);
        setStatus("error");
        return;
      }
      setReference(data.reference);
      setStatus("done");
    } catch {
      setMessage(t.errorGeneric);
      setStatus("error");
    }
  }

  const ic = (k: keyof Values) => inputClass(tone, errors[k]);
  const aria = (k: keyof Values) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `inq-${k}-error` : undefined });
  const muted = tone === "dark" ? "text-pearl/55" : "text-stone";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="py-6"
            role="status"
          >
            <span className="grid size-16 place-items-center rounded-full bg-gold text-ink">
              <Check className="size-7" strokeWidth={2} />
            </span>
            <h3 className="display mt-8 text-4xl sm:text-5xl">{t.successTitle}</h3>
            <p className={cn("mt-4 max-w-md leading-relaxed", muted)}>{t.successBody}</p>
            <div className={cn("mt-8 inline-flex items-center gap-4 rounded-2xl border px-5 py-4", tone === "dark" ? "border-pearl/15" : "border-ink/15")}>
              <span>
                <span className={cn("eyebrow block text-[0.6rem]", muted)}>{t.reference}</span>
                <span className="mt-1 block font-mono text-lg tracking-wider">{reference}</span>
              </span>
              <button
                type="button"
                aria-label="Copy reference"
                onClick={() => {
                  navigator.clipboard?.writeText(reference);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="grid size-10 place-items-center rounded-full border border-current/20"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setValues({ ...EMPTY });
                  setStatus("idle");
                  startedAt.current = 0;
                }}
                className="underline underline-offset-4"
              >
                {t.another}
              </button>
              <Link href={href("/quote/status")} className="underline underline-offset-4">
                {t.track}
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <Honeypot value={honey} onChange={setHoney} />
            <Field id="inq-name" label={t.name} error={errors.name} tone={tone} required filled={!!values.name}>
              <input id="inq-name" autoComplete="name" className={ic("name")} value={values.name} onChange={(e) => set("name", e.target.value)} {...aria("name")} />
            </Field>
            <Field id="inq-company" label={t.company} error={errors.company} tone={tone} filled={!!values.company}>
              <input id="inq-company" autoComplete="organization" className={ic("company")} value={values.company} onChange={(e) => set("company", e.target.value)} {...aria("company")} />
            </Field>
            <Field id="inq-country" label={t.country} error={errors.country} tone={tone} required filled>
              <select id="inq-country" autoComplete="country-name" className={cn(ic("country"), "appearance-none", !values.country && "text-current/40")} value={values.country} onChange={(e) => set("country", e.target.value)} {...aria("country")}>
                <option value="" disabled>
                  —
                </option>
                {countries.map((c) => (
                  <option key={c} value={c} className="text-ink">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="inq-email" label={t.email} error={errors.email} tone={tone} required filled={!!values.email}>
              <input id="inq-email" type="email" autoComplete="email" inputMode="email" className={ic("email")} value={values.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
            </Field>
            <Field id="inq-phone" label={t.phone} error={errors.phone} tone={tone} filled={!!values.phone}>
              <input id="inq-phone" type="tel" autoComplete="tel" inputMode="tel" className={ic("phone")} value={values.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
            </Field>
            <Field id="inq-product" label={t.product} error={errors.product} tone={tone} filled>
              <select id="inq-product" className={cn(ic("product"), "appearance-none")} value={values.product} onChange={(e) => set("product", e.target.value)} {...aria("product")}>
                <option value="" className="text-ink">
                  {t.productPlaceholder}
                </option>
                {products.map((p) => (
                  <option key={p} value={p} className="text-ink">
                    {p}
                  </option>
                ))}
                <option value={t.other} className="text-ink">
                  {t.other}
                </option>
              </select>
            </Field>
            <Field id="inq-quantity" label={t.quantity} error={errors.quantity} tone={tone} required filled={!!values.quantity}>
              <input id="inq-quantity" placeholder={t.quantityPlaceholder} className={ic("quantity")} value={values.quantity} onChange={(e) => set("quantity", e.target.value)} {...aria("quantity")} />
            </Field>
            <Field id="inq-packaging" label={t.packaging} error={errors.packaging} tone={tone} filled>
              <select id="inq-packaging" className={cn(ic("packaging"), "appearance-none")} value={values.packaging} onChange={(e) => set("packaging", e.target.value)} {...aria("packaging")}>
                <option value="" className="text-ink">
                  {t.packagingPlaceholder}
                </option>
                {packaging.map((p) => (
                  <option key={p} value={p} className="text-ink">
                    {p}
                  </option>
                ))}
                <option value={t.other} className="text-ink">
                  {t.other}
                </option>
              </select>
            </Field>
            <Field id="inq-message" label={t.message} error={errors.message} tone={tone} className="sm:col-span-2" filled={!!values.message}>
              <textarea id="inq-message" rows={4} placeholder={t.messagePlaceholder} className={cn(ic("message"), "resize-y")} value={values.message} onChange={(e) => set("message", e.target.value)} {...aria("message")} />
            </Field>

            <div className="sm:col-span-2">
              <label className={cn("flex cursor-pointer items-start gap-3 text-sm", muted)}>
                <input
                  id="inq-consent"
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--color-gold)]"
                  aria-invalid={!!errors.consent || undefined}
                />
                <span>
                  {t.consent}{" "}
                  <Link href={href("/privacy")} className="underline underline-offset-2">
                    {dict.footer.privacy}
                  </Link>
                </span>
              </label>
              {errors.consent && <p className="mt-2 text-xs text-red-400">{errors.consent}</p>}
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
              <Button type="submit" variant="gold" size="lg" disabled={status === "sending"} className="sm:min-w-56">
                {status === "sending" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> {t.submitting}
                  </>
                ) : (
                  t.submit
                )}
              </Button>
              {message && (
                <p role="alert" className="text-sm text-red-400">
                  {message}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
