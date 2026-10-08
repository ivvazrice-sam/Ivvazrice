import type { InquiryStatus } from "@/lib/content/types";

export const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-gold/20 text-husk",
  contacted: "bg-sky-50 text-sky-700",
  quoted: "bg-violet-50 text-violet-700",
  negotiation: "bg-orange-50 text-orange-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-ink/5 text-stone",
  spam: "bg-red-50 text-red-700",
};
