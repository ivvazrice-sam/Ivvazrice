import { z } from "zod";

/** Shared by the browser (instant feedback) and the API (authoritative validation). */
const text = (max: number) => z.string().trim().max(max, { error: `Maximum ${max} characters` });
const required = (max: number, msg = "Required") => text(max).min(1, { error: msg });
const optional = (max: number) => text(max).default("");

export const inquirySchema = z.object({
  name: required(120).min(2, { error: "Please enter your full name" }),
  company: optional(160),
  country: required(80, "Please select your country"),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email({ error: "Please enter a valid email" })),
  phone: optional(40).pipe(z.string().regex(/^[+\d\s().-]*$/, { error: "Please use digits, spaces and + only" })),
  product: optional(160),
  quantity: required(120, "Please tell us the quantity you need"),
  packaging: optional(160),
  message: optional(4000),
  consent: z.literal(true, { error: "Please accept to continue" }),
  // anti-spam
  website: z.string().max(0).optional(),
  startedAt: z.number().optional(),
  locale: z.string().max(10).optional(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const contactSchema = z.object({
  name: required(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email({ error: "Please enter a valid email" })),
  phone: optional(40).pipe(z.string().regex(/^[+\d\s().-]*$/, { error: "Please use digits, spaces and + only" })),
  subject: optional(200),
  message: required(4000, "Please write a message").min(10, { error: "Please add a little more detail" }),
  website: z.string().max(0).optional(),
  startedAt: z.number().optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const statusLookupSchema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^RQ-\d{6}-[A-Z0-9]{5}$/, { error: "Check the reference format, e.g. RQ-260928-7KQ2M" }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Please enter a valid email" })),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
