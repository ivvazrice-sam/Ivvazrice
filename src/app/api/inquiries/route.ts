import { after, NextResponse, type NextRequest } from "next/server";
import { inquiryReference } from "@/lib/content/reference";
import { getStore } from "@/lib/content/store";
import { notifyInquiry } from "@/lib/email/notify";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security/rate-limit";
import { sanitizeRecord } from "@/lib/security/sanitize";
import { fieldErrors, inquirySchema } from "@/lib/validation/forms";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = rateLimit(`inquiry:${clientIp(request.headers)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });

  const { website, startedAt, consent: _consent, locale, ...data } = parsed.data;
  // Honeypot filled or form submitted inhumanly fast: pretend success, store nothing.
  if (website || (startedAt && Date.now() - startedAt < 2500)) {
    return NextResponse.json({ ok: true, reference: inquiryReference() });
  }

  try {
    const store = await getStore("service");
    const clean = sanitizeRecord(data);
    const inquiry = await store.createInquiry({ ...clean, reference: inquiryReference(), locale: locale || "en" });
    const company = await store.getCompany();
    after(() => notifyInquiry(inquiry, company));
    return NextResponse.json({ ok: true, reference: inquiry.reference }, { status: 201 });
  } catch (err) {
    console.error("[api/inquiries]", err);
    return NextResponse.json({ error: "We could not save your inquiry. Please try again or contact us directly." }, { status: 500 });
  }
}
