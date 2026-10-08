import { after, NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/content/store";
import { notifyContact } from "@/lib/email/notify";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security/rate-limit";
import { sanitizeRecord } from "@/lib/security/sanitize";
import { contactSchema, fieldErrors } from "@/lib/validation/forms";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`contact:${clientIp(request.headers)}`, 5, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });

  const { website, startedAt, ...data } = parsed.data;
  if (website || (startedAt && Date.now() - startedAt < 2500)) return NextResponse.json({ ok: true });

  try {
    const store = await getStore("service");
    const msg = await store.createContactMessage(sanitizeRecord(data));
    const company = await store.getCompany();
    after(() => notifyContact(msg, company));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }
}
