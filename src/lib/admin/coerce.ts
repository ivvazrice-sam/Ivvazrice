import "server-only";
import { sanitizeText } from "@/lib/security/sanitize";
import { slugify } from "@/lib/utils";
import type { FieldDef } from "./schema";

const str = (v: unknown, max: number) => (typeof v === "string" ? sanitizeText(v).slice(0, max) : "");
/** Only http(s) and site-relative URLs are accepted — blocks javascript:, data: and other schemes. */
const isSafeUrl = (v: string) => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || /^\/[^\s/][^\s]*$/.test(v);
const arr = (v: unknown) => (Array.isArray(v) ? v.slice(0, 60) : []);

/**
 * Whitelists and coerces an admin payload against its schema. Unknown keys are dropped,
 * so a crafted request can never write fields that are not editable in the UI.
 */
export function coerce(fields: FieldDef[], input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const f of fields) {
    const raw = input[f.name];
    switch (f.type) {
      case "text":
      case "slug":
      case "icon":
      case "date":
        data[f.name] = str(raw, 300);
        break;
      case "textarea":
        data[f.name] = str(raw, 20_000);
        break;
      case "select": {
        const v = str(raw, 100);
        data[f.name] = f.options.some((o) => o.value === v) ? v : f.options[0]?.value ?? "";
        break;
      }
      case "url":
      case "media": {
        const v = str(raw, 2000);
        if (!isSafeUrl(v)) errors[f.name] = "Enter a full https:// URL or upload a file";
        data[f.name] = v;
        break;
      }
      case "number": {
        const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
        data[f.name] = Number.isFinite(n) ? n : 0;
        break;
      }
      case "boolean":
        data[f.name] = raw === true || raw === "true" || raw === "on";
        break;
      case "list":
        data[f.name] = arr(raw).map((x) => str(x, 300)).filter(Boolean);
        break;
      case "pairs":
        data[f.name] = arr(raw)
          .map((x) => ({ label: str((x as Record<string, unknown>)?.label, 200), value: str((x as Record<string, unknown>)?.value, 500) }))
          .filter((x) => x.label);
        break;
      case "highlights":
        data[f.name] = arr(raw)
          .map((x) => ({ title: str((x as Record<string, unknown>)?.title, 200), text: str((x as Record<string, unknown>)?.text, 2000) }))
          .filter((x) => x.title);
        break;
      case "stats":
        data[f.name] = arr(raw)
          .map((x) => {
            const o = (x ?? {}) as Record<string, unknown>;
            return { label: str(o.label, 120), value: str(o.value, 60), prefix: str(o.prefix, 10), suffix: str(o.suffix, 30), note: str(o.note, 200) };
          })
          .filter((x) => x.label);
        break;
      case "images":
        data[f.name] = arr(raw)
          .map((x) => ({ url: str((x as Record<string, unknown>)?.url, 2000), alt: str((x as Record<string, unknown>)?.alt, 300) }))
          .filter((x) => x.url && isSafeUrl(x.url));
        break;
      case "tags": {
        const allowed = new Set<string>(f.options);
        data[f.name] = arr(raw).map((x) => str(x, 80)).filter((x) => allowed.has(x));
        break;
      }
      case "expressions":
        data[f.name] = arr(raw)
          .map((x) => {
            const o = (x ?? {}) as Record<string, unknown>;
            const tone = str(o.tone, 7);
            return {
              name: str(o.name, 60),
              tone: /^#[0-9a-f]{6}$/i.test(tone) ? tone : "#efe8d8",
              toneLabel: str(o.toneLabel, 60),
              description: str(o.description, 400),
              avgLength: str(o.avgLength, 40),
              cookedLength: str(o.cookedLength, 40),
              whiteness: str(o.whiteness, 40),
              moisture: str(o.moisture, 40),
              broken: str(o.broken, 40),
              imageUrl: str(o.imageUrl, 2000),
            };
          })
          .filter((x) => x.name && isSafeUrl(x.imageUrl));
        break;
      case "videos":
        data[f.name] = arr(raw)
          .map((x) => {
            const o = (x ?? {}) as Record<string, unknown>;
            const provider = ["mp4", "youtube", "vimeo"].includes(String(o.provider)) ? String(o.provider) : "youtube";
            return { title: str(o.title, 200), provider, url: str(o.url, 2000), posterUrl: str(o.posterUrl, 2000) };
          })
          .filter((x) => x.url && isSafeUrl(x.url) && isSafeUrl(x.posterUrl));
        break;
    }
    if (f.required) {
      const v = data[f.name];
      if (v === "" || (Array.isArray(v) && !v.length)) errors[f.name] = "Required";
    }
  }

  if ("slug" in data) data.slug = slugify(String(data.slug || data.name || "")) || `item-${Date.now().toString(36)}`;
  return { data, errors };
}
