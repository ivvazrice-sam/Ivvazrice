"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client bound to the signed-in admin's session cookie. Used for
 * realtime subscriptions from client components (new-inquiry alerts, live badges).
 * RLS still applies — the admin only sees rows their role allows.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
