import "server-only";

/**
 * Fixed-window in-memory rate limiter. Suitable for a single server instance;
 * for multi-instance deployments swap the Map for Redis/Upstash with the same interface.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  bucket.count++;
  return { ok: bucket.count <= limit, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

/** Rejects cross-site form posts: the Origin header (when present) must match the request host. */
export function sameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (headers.get("x-forwarded-host") || headers.get("host"));
  } catch {
    return false;
  }
}
