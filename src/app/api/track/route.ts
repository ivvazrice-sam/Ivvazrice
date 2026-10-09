import { NextResponse, type NextRequest } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers)) return NextResponse.json({ ok: true });
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

  const ip = clientIp(request.headers);
  const limit = rateLimit(`track:${ip}`, 120, 60_000);
  if (!limit.ok) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null) as { path?: unknown; visitorId?: unknown; referrer?: unknown } | null;
  if (!body) return NextResponse.json({ ok: true });

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : "";
  if (!visitorId) return NextResponse.json({ ok: true });

  const userAgent = (request.headers.get("user-agent") || "").slice(0, 300);
  const country = request.headers.get("x-vercel-ip-country") || "";

  try {
    const db = supabaseService();
    await db.from("page_views").insert({
      path,
      visitor_id: visitorId,
      referrer,
      user_agent: userAgent,
      country,
    });
  } catch (err) {
    console.error("[api/track]", err);
  }
  return NextResponse.json({ ok: true });
}
