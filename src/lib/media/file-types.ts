/** Accepted upload types, detected from the file's leading bytes (never trusting the name or browser MIME). */
export const FILE_TYPES = {
  jpg: { mime: "image/jpeg", kind: "image", max: 10 },
  png: { mime: "image/png", kind: "image", max: 10 },
  gif: { mime: "image/gif", kind: "image", max: 10 },
  webp: { mime: "image/webp", kind: "image", max: 10 },
  avif: { mime: "image/avif", kind: "image", max: 10 },
  pdf: { mime: "application/pdf", kind: "document", max: 15 },
  mp4: { mime: "video/mp4", kind: "video", max: 200 },
  webm: { mime: "video/webm", kind: "video", max: 200 },
} as const;
export type FileExt = keyof typeof FILE_TYPES;

export function sniff(bytes: Uint8Array): FileExt | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (ascii(0, 4) === "GIF8") return "gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(0, 4) === "%PDF") return "pdf";
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "webm";
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
    return "mp4";
  }
  return null;
}

export const mimeForExt = (ext: string) => (FILE_TYPES as Record<string, { mime: string }>)[ext]?.mime;
