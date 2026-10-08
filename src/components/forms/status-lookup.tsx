"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import type { InquiryStatus } from "@/lib/content/types";
import { cn, formatDate } from "@/lib/utils";
import { fieldErrors, statusLookupSchema } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "./fields";

const PIPELINE: InquiryStatus[] = ["new", "contacted", "quoted", "negotiation", "won"];

type Result = { reference: string; status: InquiryStatus; product: string; createdAt: string; updatedAt: string };

export function StatusLookup() {
  const { dict, locale } = useI18n();
  const t = dict.status;
  const [v, setV] = useState({ reference: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = statusLookupSchema.safeParse(v);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    setNotFound(false);
    setResult(null);
    const res = await fetch("/api/inquiries/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) }).catch(() => null);
    setLoading(false);
    if (!res || res.status === 404) return setNotFound(true);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.found) return setNotFound(true);
    setResult(data);
  }

  const step = result ? PIPELINE.indexOf(result.status) : -1;
  const closed = result && (result.status === "lost" || result.status === "spam");

  return (
    <div>
      <form onSubmit={submit} noValidate className="grid gap-x-8 gap-y-7 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field id="s-ref" label={t.reference} error={errors.reference} tone="light" required filled={!!v.reference}>
          <input id="s-ref" className={cn(inputClass("light", errors.reference), "font-mono uppercase")} value={v.reference} onChange={(e) => setV((s) => ({ ...s, reference: e.target.value }))} />
        </Field>
        <Field id="s-email" label={t.email} error={errors.email} tone="light" required filled={!!v.email}>
          <input id="s-email" type="email" autoComplete="email" className={inputClass("light", errors.email)} value={v.email} onChange={(e) => setV((s) => ({ ...s, email: e.target.value }))} />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {t.submit}
        </Button>
      </form>

      {notFound && <p role="alert" className="mt-8 rounded-2xl bg-ink/5 p-5 text-sm text-stone">{t.notFound}</p>}

      {result && (
        <div className="mt-10 rounded-[24px] border border-ink/10 bg-pearl p-6 sm:p-8" role="status">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-mono text-lg">{result.reference}</p>
            <p className="font-display text-2xl text-husk">{t.labels[result.status]}</p>
          </div>
          {!closed && (
            <ol className="mt-8 grid grid-cols-5 gap-2">
              {PIPELINE.map((s, i) => (
                <li key={s}>
                  <span className={cn("block h-1 rounded-full", i <= step ? "bg-gold" : "bg-ink/10")} />
                  <span className={cn("mt-2 block text-[0.65rem] uppercase tracking-[0.12em]", i <= step ? "text-ink" : "text-stone/60")}>{t.labels[s]}</span>
                </li>
              ))}
            </ol>
          )}
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
            {result.product && (
              <div>
                <dt className="text-stone">{dict.inquiry.product}</dt>
                <dd>{result.product}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone">{t.submitted}</dt>
              <dd>{formatDate(result.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-stone">{t.updated}</dt>
              <dd>{formatDate(result.updatedAt, locale)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
