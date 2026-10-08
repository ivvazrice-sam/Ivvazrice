#!/usr/bin/env node
// Loads data/seed.json (placeholder content) into Supabase.
// Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
// Existing rows with the same id are updated; nothing is deleted.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toRow = (obj, omit = []) => Object.fromEntries(Object.entries(obj).filter(([k]) => !omit.includes(k)).map(([k, v]) => [snake(k), v]));

const TABLES = {
  products: "products",
  processingSteps: "processing_steps",
  technologies: "technologies",
  qualityChecks: "quality_checks",
  certifications: "certifications",
  trustItems: "trust_items",
  exportCountries: "export_countries",
  exportRoutes: "export_routes",
  exportSteps: "export_steps",
  factoryMedia: "factory_media",
  videos: "videos",
  kitchenVideos: "kitchen_videos",
  packaging: "packaging",
  testimonials: "testimonials",
  partnerReasons: "partner_reasons",
  socialLinks: "social_links",
};

async function run(label, promise) {
  const { error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  console.log(`✓ ${label}`);
}

await run("company", db.from("companies").upsert({ ...toRow(seed.company), id: "default" }));
await run("settings", db.from("site_settings").upsert({ key: "global", value: seed.settings }));
for (const [collection, table] of Object.entries(TABLES)) {
  const items = seed.collections[collection] ?? [];
  if (!items.length) continue;
  await run(`${table} (${items.length})`, db.from(table).upsert(items.map((i) => toRow(i, ["images", "videos"]))));
}
console.log("Done. Create an admin user in Supabase Auth and add it to admin_users (see migration file).");
