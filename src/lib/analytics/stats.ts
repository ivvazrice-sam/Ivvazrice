import "server-only";
import { supabaseService } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export interface VisitorStats {
  configured: boolean;
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  visitorsToday: number;
  viewsLast7Days: number;
  visitorsLast7Days: number;
  topPaths: { path: string; views: number }[];
}

const EMPTY: VisitorStats = {
  configured: false,
  totalViews: 0,
  uniqueVisitors: 0,
  viewsToday: 0,
  visitorsToday: 0,
  viewsLast7Days: 0,
  visitorsLast7Days: 0,
  topPaths: [],
};

export async function getVisitorStats(): Promise<VisitorStats> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const db = supabaseService();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const start7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [{ count: totalViews }, { data: allVisitors }, { count: viewsToday }, { data: visitorsTodayRows }, { count: viewsLast7Days }, { data: visitors7Rows }, { data: recent }] = await Promise.all([
      db.from("page_views").select("*", { count: "exact", head: true }),
      db.from("page_views").select("visitor_id"),
      db.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      db.from("page_views").select("visitor_id").gte("created_at", startOfToday.toISOString()),
      db.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", start7.toISOString()),
      db.from("page_views").select("visitor_id").gte("created_at", start7.toISOString()),
      db.from("page_views").select("path").gte("created_at", start7.toISOString()).limit(5000),
    ]);

    const unique = (rows: { visitor_id: string }[] | null) => new Set((rows || []).map((r) => r.visitor_id)).size;
    const counts = new Map<string, number>();
    for (const r of recent || []) counts.set(r.path, (counts.get(r.path) || 0) + 1);
    const topPaths = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, views]) => ({ path, views }));

    return {
      configured: true,
      totalViews: totalViews || 0,
      uniqueVisitors: unique(allVisitors as { visitor_id: string }[] | null),
      viewsToday: viewsToday || 0,
      visitorsToday: unique(visitorsTodayRows as { visitor_id: string }[] | null),
      viewsLast7Days: viewsLast7Days || 0,
      visitorsLast7Days: unique(visitors7Rows as { visitor_id: string }[] | null),
      topPaths,
    };
  } catch (err) {
    console.error("[analytics/stats]", err);
    return EMPTY;
  }
}
