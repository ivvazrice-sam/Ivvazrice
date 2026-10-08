import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import seed from "../../../data/seed.json";
import { normalizeCompany, normalizeItem, normalizeSettings } from "./defaults";
import { filterInquiries, type ContentStore } from "./store";
import { COLLECTION_KEYS, type CollectionKey, type ContactMessage, type ContentSnapshot, type Inquiry } from "./types";

/**
 * JSON-file store for local development and single-server self-hosting.
 * Content starts from data/seed.json and is copied into DATA_DIR on first write.
 * On serverless hosts (read-only file system) configure Supabase instead.
 */
const dataDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.dataDir);
const contentFile = path.join(dataDir, "content.json");
const inquiriesFile = path.join(dataDir, "inquiries.json");
const messagesFile = path.join(dataDir, "messages.json");

let queue: Promise<unknown> = Promise.resolve();
/** Serialise writes so concurrent requests never interleave read-modify-write cycles. */
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

async function readContent(): Promise<ContentSnapshot> {
  const raw = await readJson<ContentSnapshot>(contentFile, seed as unknown as ContentSnapshot);
  const collections = {} as ContentSnapshot["collections"];
  for (const key of COLLECTION_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (collections as any)[key] = (raw.collections?.[key] ?? []).map((item: any) => normalizeItem(key, item));
  }
  return { company: normalizeCompany(raw.company), settings: normalizeSettings(raw.settings), collections };
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export const fileStore: ContentStore = {
  async getCompany() {
    return (await readContent()).company;
  },
  async getSettings() {
    return (await readContent()).settings;
  },
  async list(key, opts) {
    const items = (await readContent()).collections[key] as { published: boolean; sortOrder: number }[];
    return items.filter((i) => opts?.includeUnpublished || i.published).sort(bySort) as never;
  },
  async get(key, id) {
    const items = (await readContent()).collections[key] as { id: string }[];
    return (items.find((i) => i.id === id) as never) ?? null;
  },

  saveCompany: (data) =>
    exclusive(async () => {
      const content = await readContent();
      await writeJson(contentFile, { ...content, company: data });
    }),
  saveSettings: (data) =>
    exclusive(async () => {
      const content = await readContent();
      await writeJson(contentFile, { ...content, settings: data });
    }),
  upsert: (key, item) =>
    exclusive(async () => {
      const content = await readContent();
      const list = content.collections[key] as (typeof item)[];
      const saved = { ...item, id: item.id || randomUUID() };
      const idx = list.findIndex((i) => i.id === saved.id);
      if (idx >= 0) list[idx] = saved;
      else list.push(saved);
      await writeJson(contentFile, content);
      return saved;
    }),
  remove: (key: CollectionKey, id) =>
    exclusive(async () => {
      const content = await readContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (content.collections as any)[key] = (content.collections[key] as { id: string }[]).filter((i) => i.id !== id);
      await writeJson(contentFile, content);
    }),

  createInquiry: (data) =>
    exclusive(async () => {
      const list = await readJson<Inquiry[]>(inquiriesFile, []);
      const now = new Date().toISOString();
      const inquiry: Inquiry = { ...data, id: randomUUID(), status: "new", notes: "", createdAt: now, updatedAt: now };
      list.unshift(inquiry);
      await writeJson(inquiriesFile, list);
      return inquiry;
    }),
  async listInquiries(filter) {
    return filterInquiries(await readJson<Inquiry[]>(inquiriesFile, []), filter);
  },
  async getInquiry(id) {
    return (await readJson<Inquiry[]>(inquiriesFile, [])).find((i) => i.id === id) ?? null;
  },
  updateInquiry: (id, patch) =>
    exclusive(async () => {
      const list = await readJson<Inquiry[]>(inquiriesFile, []);
      const idx = list.findIndex((i) => i.id === id);
      if (idx < 0) return;
      list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
      await writeJson(inquiriesFile, list);
    }),
  deleteInquiry: (id) =>
    exclusive(async () => {
      const list = await readJson<Inquiry[]>(inquiriesFile, []);
      await writeJson(
        inquiriesFile,
        list.filter((i) => i.id !== id),
      );
    }),
  async findInquiry(reference, email) {
    const list = await readJson<Inquiry[]>(inquiriesFile, []);
    return (
      list.find((i) => i.reference === reference.toUpperCase() && i.email.toLowerCase() === email.toLowerCase()) ?? null
    );
  },

  createContactMessage: (data) =>
    exclusive(async () => {
      const list = await readJson<ContactMessage[]>(messagesFile, []);
      const msg: ContactMessage = { ...data, id: randomUUID(), status: "new", createdAt: new Date().toISOString() };
      list.unshift(msg);
      await writeJson(messagesFile, list);
      return msg;
    }),
  async listContactMessages() {
    return readJson<ContactMessage[]>(messagesFile, []);
  },
  updateContactMessage: (id, patch) =>
    exclusive(async () => {
      const list = await readJson<ContactMessage[]>(messagesFile, []);
      const idx = list.findIndex((m) => m.id === id);
      if (idx < 0) return;
      list[idx] = { ...list[idx], ...patch };
      await writeJson(messagesFile, list);
    }),
  deleteContactMessage: (id) =>
    exclusive(async () => {
      const list = await readJson<ContactMessage[]>(messagesFile, []);
      await writeJson(
        messagesFile,
        list.filter((m) => m.id !== id),
      );
    }),
};
