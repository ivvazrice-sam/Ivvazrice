import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { VideoProvider } from "@/lib/content/types";

/** Joins class names and resolves conflicting Tailwind utilities (last one wins). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Content written as "[Something]" is an unfilled placeholder awaiting real company data. */
export const isPlaceholderText = (v?: string | null) => !!v && /^\s*\[[^\]]*\]\s*$/.test(v);

/** True when a value holds real data (not empty, not a bracketed placeholder). */
export const hasValue = (v?: string | null) => !!v && v.trim() !== "" && !isPlaceholderText(v);

/**
 * Decide whether a text value should be rendered. Real values always show; placeholders
 * show only while the site is in placeholder mode.
 */
export const showText = (v: string | undefined | null, showPlaceholders: boolean) =>
  hasValue(v) || (showPlaceholders && !!v && v.trim() !== "");

/**
 * Stock photographs bundled with the starter content are served from Pexels. They are shown
 * (tagged "Sample photo") only while placeholder mode is on and are removed automatically
 * once it is switched off, so stock imagery is never presented as the company's own.
 */
export const SAMPLE_MEDIA_HOST = "images.pexels.com";
export const isSampleMedia = (url?: string | null) => false;
export const samplePhoto = (id: number, w = 1920) => `https://${SAMPLE_MEDIA_HOST}/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");

export function whatsappHref(number: string, text?: string) {
  const n = digitsOnly(number);
  if (!n) return "";
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telHref(phone: string) {
  const n = phone.replace(/[^\d+]/g, "");
  return n.length > 4 ? `tel:${n}` : "";
}

export function mailHref(email: string, subject?: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : null);
}

export function vimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? (/^\d+$/.test(url) ? url : null);
}

/** Build a privacy-friendly embed URL for YouTube/Vimeo, or return the file URL for MP4. */
export function videoEmbedSrc(provider: VideoProvider, url: string, autoplay = true) {
  if (provider === "youtube") {
    const id = youtubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}` : "";
  }
  if (provider === "vimeo") {
    const id = vimeoId(url);
    return id ? `https://player.vimeo.com/video/${id}?dnt=1${autoplay ? "&autoplay=1" : ""}` : "";
  }
  return url;
}

export function videoPoster(provider: VideoProvider, url: string, posterUrl?: string) {
  if (posterUrl) return posterUrl;
  if (provider === "youtube") {
    const id = youtubeId(url);
    if (id) return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  }
  return "";
}

export function formatDate(iso: string, locale = "en") {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Deterministic PRNG so generated art is identical on server and client. */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
