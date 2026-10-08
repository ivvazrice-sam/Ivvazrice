"use client";

import { Check, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { contactSchema, fieldErrors } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Field, Honeypot, inputClass } from "./fields";

export function ContactForm() {
  const { dict } = useI18n();
  const [v, setV] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [honey, setHoney] = useState("");
  const startedAt = useRef(0);

  const set = (k: keyof typeof v, value: string) => {
    if (!startedAt.current) startedAt.current = Date.now();
    setV((s) => ({ ...s, [k]: value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...v, website: honey, startedAt: startedAt.current || Date.now() - 10_000 };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setStatus("sending");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setErrors(data?.fields ?? {});
      setError(data?.error ?? dict.inquiry.errorGeneric);
      return setStatus("error");
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p role="status" className="flex items-center gap-3 rounded-2xl bg-ink/5 p-6 text-ink">
        <Check className="size-5 text-husk" /> {dict.contact.sent}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-x-8 gap-y-7 sm:grid-cols-2">
      <Honeypot value={honey} onChange={setHoney} />
      <Field id="c-name" label={dict.inquiry.name} error={errors.name} tone="light" required filled={!!v.name}>
        <input id="c-name" autoComplete="name" className={inputClass("light", errors.name)} value={v.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field id="c-email" label={dict.inquiry.email} error={errors.email} tone="light" required filled={!!v.email}>
        <input id="c-email" type="email" autoComplete="email" className={inputClass("light", errors.email)} value={v.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field id="c-phone" label={dict.inquiry.phone} error={errors.phone} tone="light" filled={!!v.phone}>
        <input id="c-phone" type="tel" autoComplete="tel" className={inputClass("light", errors.phone)} value={v.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field id="c-subject" label={dict.contact.subject} error={errors.subject} tone="light" filled={!!v.subject}>
        <input id="c-subject" className={inputClass("light", errors.subject)} value={v.subject} onChange={(e) => set("subject", e.target.value)} />
      </Field>
      <Field id="c-message" label={dict.inquiry.message} error={errors.message} tone="light" required className="sm:col-span-2" filled={!!v.message}>
        <textarea id="c-message" rows={4} className={inputClass("light", errors.message)} value={v.message} onChange={(e) => set("message", e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" variant="primary" disabled={status === "sending"}>
          {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
          {dict.cta.sendInquiry}
        </Button>
        {status === "error" && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
