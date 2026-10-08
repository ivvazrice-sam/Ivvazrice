#!/usr/bin/env node
// Bakes the photoreal 3D rice heap into transparent PNGs (public/renders/heap-<tone>.png).
// Requires the dev server (npm run dev) and Google Chrome. Usage: node scripts/bake-renders.mjs
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const BASE = process.env.BAKE_URL || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const TONES = { white: "efe8d8", bright: "f8f5ec", ivory: "ead8ae", golden: "d8a654", straw: "e6d58f", cream: "e4cf9c", brown: "a87443" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9444;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "bake-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--window-size=1400,1000", "--enable-unsafe-swiftshader", `--user-data-dir=${profile}`, "about:blank"]);

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  await sleep(250);
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) (pending.get(m.id)(m), pending.delete(m.id));
});
const send = (method, params = {}) => new Promise((r) => (pending.set(++id, r), ws.send(JSON.stringify({ id, method, params }))));

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
fs.mkdirSync("public/renders", { recursive: true });

for (const [name, hex] of Object.entries(TONES)) {
  await send("Page.navigate", { url: `${BASE}/admin/render-heap?color=${hex}` });
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await send("Runtime.evaluate", { expression: "document.getElementById('bake')?.dataset.ready", returnByValue: true });
    if (r.result?.result?.value === "1") break;
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const out = `public/renders/heap-${name}.png`;
  await sharp(Buffer.from(shot.result.data, "base64"))
    .trim({ threshold: 2 })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 1100, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("baked", out);
}
ws.close();
chrome.kill();
process.exit(0);
