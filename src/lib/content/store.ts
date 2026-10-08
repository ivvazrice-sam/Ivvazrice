import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  CollectionKey,
  CollectionMap,
  CompanyProfile,
  ContactMessage,
  Inquiry,
  InquiryStatus,
  SiteSettings,
} from "./types";

export interface InquiryFilter {
  status?: InquiryStatus | "all";
  q?: string;
}

/**
 * Storage abstraction. The site talks only to this interface, so the backing store
 * (local JSON files or Supabase) can be swapped through environment variables.
 */
export interface ContentStore {
  getCompany(): Promise<CompanyProfile>;
  getSettings(): Promise<SiteSettings>;
  list<K extends CollectionKey>(key: K, opts?: { includeUnpublished?: boolean }): Promise<CollectionMap[K][]>;
  get<K extends CollectionKey>(key: K, id: string): Promise<CollectionMap[K] | null>;

  saveCompany(data: CompanyProfile): Promise<void>;
  saveSettings(data: SiteSettings): Promise<void>;
  upsert<K extends CollectionKey>(key: K, item: CollectionMap[K]): Promise<CollectionMap[K]>;
  remove(key: CollectionKey, id: string): Promise<void>;

  createInquiry(data: Omit<Inquiry, "id" | "createdAt" | "updatedAt" | "status" | "notes">): Promise<Inquiry>;
  listInquiries(filter?: InquiryFilter): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | null>;
  updateInquiry(id: string, patch: Partial<Pick<Inquiry, "status" | "notes">>): Promise<void>;
  deleteInquiry(id: string): Promise<void>;
  findInquiry(reference: string, email: string): Promise<Inquiry | null>;

  createContactMessage(data: Omit<ContactMessage, "id" | "createdAt" | "status">): Promise<ContactMessage>;
  listContactMessages(): Promise<ContactMessage[]>;
  updateContactMessage(id: string, patch: Partial<Pick<ContactMessage, "status">>): Promise<void>;
  deleteContactMessage(id: string): Promise<void>;
}

/**
 * - "public": read-only access for rendering the website (respects publish flags / RLS).
 * - "admin": authenticated admin session (Supabase RLS enforces roles as a second line of defence).
 * - "service": trusted server operations such as storing an inquiry from the public form.
 */
export type StoreScope = "public" | "admin" | "service";

export async function getStore(scope: StoreScope = "public"): Promise<ContentStore> {
  if (isSupabaseConfigured()) {
    const { createSupabaseStore } = await import("./supabase-store");
    return createSupabaseStore(scope);
  }
  const { fileStore } = await import("./file-store");
  return fileStore;
}

export function filterInquiries(list: Inquiry[], filter?: InquiryFilter): Inquiry[] {
  let out = list;
  if (filter?.status && filter.status !== "all") out = out.filter((i) => i.status === filter.status);
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    out = out.filter((i) =>
      [i.reference, i.name, i.company, i.country, i.email, i.product].some((v) => v.toLowerCase().includes(q)),
    );
  }
  return out;
}
