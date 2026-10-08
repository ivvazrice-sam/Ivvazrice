import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/content/store";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security/rate-limit";
import { fieldErrors, statusLookupSchema } from "@/lib/validation/forms";

/** Buyer-facing inquiry tracking: requires both the reference and the email used, returns status only. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`status:${clientIp(request.headers)}`, 20, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = statusLookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid details", fields: fieldErrors(parsed.error) }, { status: 422 });

  const store = await getStore("service");
  const inquiry = await store.findInquiry(parsed.data.reference, parsed.data.email);
  if (!inquiry) return NextResponse.json({ found: false }, { status: 404 });
  return NextResponse.json({
    found: true,
    reference: inquiry.reference,
    status: inquiry.status,
    product: inquiry.product,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  });
}
