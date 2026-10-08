"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionResult } from "@/app/admin/actions";
import type { FieldDef } from "@/lib/admin/schema";
import { FieldInput } from "./field-inputs";

/** Generic schema-driven editor used for every collection, the company profile and site settings. */
export function EntityEditor({
  fields,
  initial,
  action,
  afterCreateHref,
}: {
  fields: FieldDef[];
  initial: Record<string, unknown>;
  action: (payload: Record<string, unknown>) => Promise<ActionResult>;
  /** For new items: base URL to navigate to once the item has an id. */
  afterCreateHref?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await action(values);
      setErrors(res.errors ?? {});
      if (!res.ok) return setMessage({ ok: false, text: res.error ?? "Save failed" });
      setDirty(false);
      setMessage({ ok: true, text: "Saved — the website has been updated." });
      if (afterCreateHref && res.id) router.replace(`${afterCreateHref}/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={save}>
      <div className="admin-card divide-y divide-ink/5 px-6">
        {fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={values[f.name]}
            error={errors[f.name]}
            onChange={(v) => {
              setDirty(true);
              setMessage(null);
              setValues((s) => ({ ...s, [f.name]: v }));
            }}
          />
        ))}
      </div>
      <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-ink/90 px-5 py-3 text-pearl backdrop-blur">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save changes
        </button>
        {message ? (
          <span className={message.ok ? "text-sm text-pearl/80" : "text-sm text-red-300"} role="status">
            {message.text}
          </span>
        ) : (
          dirty && <span className="text-sm text-pearl/60">Unsaved changes</span>
        )}
      </div>
    </form>
  );
}
