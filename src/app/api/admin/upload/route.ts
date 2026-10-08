import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { can, getAdmin } from "@/lib/auth";
import { env, isSupabaseConfigured } from "@/lib/env";
import { FILE_TYPES, sniff } from "@/lib/media/file-types";
import { sameOrigin } from "@/lib/security/rate-limit";
import { supabaseSession } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * Authenticated media upload. Files are type-checked by content (magic bytes), size-limited,
 * renamed to random UUIDs and stored either in Supabase Storage or DATA_DIR/uploads.
 * SVG and HTML are never accepted (script injection risk).
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user, "upload")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });

  const buf = new Uint8Array(await file.arrayBuffer());
  const ext = sniff(buf.slice(0, 16));
  if (!ext) return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF, PDF, MP4 or WebM." }, { status: 415 });
  const type = FILE_TYPES[ext];
  if (buf.byteLength > type.max * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${type.max} MB for ${ext.toUpperCase()}).` }, { status: 413 });
  }

  const d = new Date();
  const key = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;

  try {
    if (isSupabaseConfigured()) {
      const db = await supabaseSession();
      const { error } = await db.storage.from(env.supabaseMediaBucket).upload(key, buf, { contentType: type.mime, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data } = db.storage.from(env.supabaseMediaBucket).getPublicUrl(key);
      return NextResponse.json({ url: data.publicUrl, kind: type.kind });
    }
    const dest = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, "uploads", key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buf);
    return NextResponse.json({ url: `/media/${key}`, kind: type.kind });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
