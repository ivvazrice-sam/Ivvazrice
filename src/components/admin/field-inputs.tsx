"use client";

import { ArrowDown, ArrowUp, FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { FieldDef } from "@/lib/admin/schema";
import { cn } from "@/lib/utils";
import { Icon, ICON_NAMES } from "@/components/ui/icon";

type Obj = Record<string, string>;

export async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

const ACCEPT: Record<string, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/webm",
  document: "application/pdf",
  any: "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,application/pdf",
};

const isImage = (url: string) => /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url);
const isVideo = (url: string) => /\.(mp4|webm)(\?|$)/i.test(url);

export function MediaInput({ value, onChange, accept }: { value: string; onChange: (v: string) => void; accept: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" />
        <button type="button" className="admin-btn shrink-0" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
        </button>
        <input ref={ref} type="file" hidden accept={ACCEPT[accept] ?? ACCEPT.any} onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {isImage(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-16 w-24 rounded-lg border border-ink/10 object-cover" />
          ) : isVideo(value) ? (
            <video src={value} className="h-16 w-24 rounded-lg border border-ink/10 object-cover" muted />
          ) : (
            <span className="flex items-center gap-2 text-xs text-stone">
              <FileText className="size-4" /> {value.split("/").pop()}
            </span>
          )}
          <button type="button" onClick={() => onChange("")} className="text-xs text-stone hover:text-red-600">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function Rows<T extends Obj>({
  value,
  onChange,
  empty,
  render,
  addLabel,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  empty: T;
  render: (row: T, set: (k: keyof T, v: string) => void) => React.ReactNode;
  addLabel: string;
}) {
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-ivory/60 p-2">
          <div className="grid flex-1 gap-2">{render(row, (k, v) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: v } : r))))}</div>
          <div className="flex shrink-0 flex-col gap-1">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-20">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-20">
              <ArrowDown className="size-3.5" />
            </button>
            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-lg text-red-600 hover:bg-red-50">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn" onClick={() => onChange([...value, { ...empty }])}>
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

export function FieldInput({ field, value, onChange, error }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; error?: string }) {
  const id = `f-${field.name}`;
  const s = (value as string) ?? "";
  let control: React.ReactNode;

  switch (field.type) {
    case "textarea":
      control = <textarea id={id} rows={field.rows ?? 4} className="admin-input" value={s} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = <input id={id} type="number" step="any" className="admin-input max-w-48" value={String(value ?? 0)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
      break;
    case "boolean":
      control = (
        <label className="inline-flex cursor-pointer items-center gap-3">
          <span className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-ink" : "bg-ink/15")}>
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", value ? "left-[22px]" : "left-0.5")} />
          </span>
          <input id={id} type="checkbox" className="sr-only" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-stone">{value ? "Yes" : "No"}</span>
        </label>
      );
      break;
    case "date":
      control = <input id={id} type="date" className="admin-input max-w-56" value={s} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      control = (
        <select id={id} className="admin-input max-w-sm" value={s} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "icon":
      control = (
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink text-gold-2">
            <Icon name={s} className="size-5" />
          </span>
          <select id={id} className="admin-input max-w-xs" value={s} onChange={(e) => onChange(e.target.value)}>
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      );
      break;
    case "media":
      control = <MediaInput value={s} onChange={onChange} accept={field.accept} />;
      break;
    case "list":
      control = (
        <textarea
          id={id}
          rows={4}
          className="admin-input"
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
        />
      );
      break;
    case "pairs":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ label: "", value: "" }}
          addLabel="Add specification"
          render={(row, set) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="admin-input" placeholder="Label" value={row.label} onChange={(e) => set("label", e.target.value)} />
              <input className="admin-input" placeholder="Value" value={row.value} onChange={(e) => set("value", e.target.value)} />
            </div>
          )}
        />
      );
      break;
    case "highlights":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ title: "", text: "" }}
          addLabel="Add highlight"
          render={(row, set) => (
            <>
              <input className="admin-input" placeholder="Title" value={row.title} onChange={(e) => set("title", e.target.value)} />
              <textarea className="admin-input" rows={2} placeholder="Text" value={row.text} onChange={(e) => set("text", e.target.value)} />
            </>
          )}
        />
      );
      break;
    case "stats":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ label: "", value: "", prefix: "", suffix: "", note: "" }}
          addLabel="Add statistic"
          render={(row, set) => (
            <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr]">
              <input className="admin-input" placeholder="Label" value={row.label} onChange={(e) => set("label", e.target.value)} />
              <input className="admin-input" placeholder="Prefix" value={row.prefix ?? ""} onChange={(e) => set("prefix", e.target.value)} />
              <input className="admin-input" placeholder="Value (verified)" value={row.value} onChange={(e) => set("value", e.target.value)} />
              <input className="admin-input" placeholder="Suffix" value={row.suffix ?? ""} onChange={(e) => set("suffix", e.target.value)} />
            </div>
          )}
        />
      );
      break;
    case "images":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ url: "", alt: "" }}
          addLabel="Add image"
          render={(row, set) => (
            <>
              <MediaInput value={row.url} onChange={(v) => set("url", v)} accept="image" />
              <input className="admin-input" placeholder="Alt text (describe the image)" value={row.alt} onChange={(e) => set("alt", e.target.value)} />
            </>
          )}
        />
      );
      break;
    case "tags": {
      const selected = (value as string[]) ?? [];
      control = (
        <div className="flex flex-wrap gap-2">
          {field.options.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? selected.filter((x) => x !== o) : [...selected, o])}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", on ? "border-ink bg-ink text-pearl" : "border-ink/15 bg-white text-stone hover:border-ink/40")}
              >
                {o}
              </button>
            );
          })}
        </div>
      );
      break;
    }
    case "expressions":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ name: "", tone: "#efe8d8", toneLabel: "", description: "", avgLength: "", cookedLength: "", whiteness: "", moisture: "", broken: "", imageUrl: "" }}
          addLabel="Add expression"
          render={(row, set) => (
            <>
              <div className="grid gap-2 sm:grid-cols-[1.4fr_auto_1.2fr]">
                <input className="admin-input" placeholder="Name (e.g. Steam)" value={row.name} onChange={(e) => set("name", e.target.value)} />
                <label className="flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-2" title="Grain colour">
                  <input type="color" value={row.tone || "#efe8d8"} onChange={(e) => set("tone", e.target.value)} className="size-7 cursor-pointer border-0 bg-transparent p-0" />
                </label>
                <input className="admin-input" placeholder="Tone label (e.g. Bright white)" value={row.toneLabel} onChange={(e) => set("toneLabel", e.target.value)} />
              </div>
              <textarea className="admin-input" rows={2} placeholder="Short description" value={row.description} onChange={(e) => set("description", e.target.value)} />
              <div className="grid gap-2 sm:grid-cols-5">
                <input className="admin-input" placeholder="Avg length (8.30–8.35 mm)" value={row.avgLength} onChange={(e) => set("avgLength", e.target.value)} />
                <input className="admin-input" placeholder="Cooked (20–22 mm)" value={row.cookedLength} onChange={(e) => set("cookedLength", e.target.value)} />
                <input className="admin-input" placeholder="Kett whiteness (38–40)" value={row.whiteness} onChange={(e) => set("whiteness", e.target.value)} />
                <input className="admin-input" placeholder="Moisture (12.5% max)" value={row.moisture} onChange={(e) => set("moisture", e.target.value)} />
                <input className="admin-input" placeholder="Broken (1% max)" value={row.broken} onChange={(e) => set("broken", e.target.value)} />
              </div>
              <MediaInput value={row.imageUrl} onChange={(v) => set("imageUrl", v)} accept="image" />
            </>
          )}
        />
      );
      break;
    case "videos":
      control = (
        <Rows
          value={(value as Obj[]) ?? []}
          onChange={onChange}
          empty={{ title: "", provider: "youtube", url: "", posterUrl: "" }}
          addLabel="Add video"
          render={(row, set) => (
            <>
              <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
                <input className="admin-input" placeholder="Title" value={row.title} onChange={(e) => set("title", e.target.value)} />
                <select className="admin-input" value={row.provider} onChange={(e) => set("provider", e.target.value)}>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="mp4">MP4 / self-hosted</option>
                </select>
              </div>
              <MediaInput value={row.url} onChange={(v) => set("url", v)} accept="video" />
              <MediaInput value={row.posterUrl} onChange={(v) => set("posterUrl", v)} accept="image" />
            </>
          )}
        />
      );
      break;
    default:
      control = (
        <input
          id={id}
          type={field.type === "url" ? "url" : "text"}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          className="admin-input"
          value={s}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className="grid gap-1.5 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
      <div>
        <label htmlFor={id} className="text-sm font-semibold">
          {field.label}
          {field.required && <span className="text-husk"> *</span>}
        </label>
        {field.help && <p className="mt-1 text-xs leading-relaxed text-stone">{field.help}</p>}
      </div>
      <div className="min-w-0">
        {control}
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <X className="size-3" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}
