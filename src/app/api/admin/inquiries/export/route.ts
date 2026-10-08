import { NextResponse, type NextRequest } from "next/server";
import { can, getAdmin } from "@/lib/auth";
import { getStore } from "@/lib/content/store";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/content/types";

const COLUMNS = ["reference", "createdAt", "status", "name", "company", "country", "email", "phone", "product", "quantity", "packaging", "message", "notes"] as const;

/** Quotes CSV cells and neutralises spreadsheet formula injection (=, +, -, @). */
function cell(v: unknown) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, `""`)}"`;
}

export async function GET(request: NextRequest) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user, "leads")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = request.nextUrl.searchParams.get("status") ?? "all";
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const list = await (await getStore("admin")).listInquiries({
    status: (INQUIRY_STATUSES as readonly string[]).includes(status) ? (status as InquiryStatus) : "all",
    q,
  });
  const csv = [COLUMNS.join(","), ...list.map((i) => COLUMNS.map((c) => cell(i[c])).join(","))].join("\r\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
