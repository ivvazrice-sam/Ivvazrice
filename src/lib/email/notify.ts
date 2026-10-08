import "server-only";
import { env, isEmailConfigured } from "@/lib/env";
import type { CompanyProfile, ContactMessage, Inquiry } from "@/lib/content/types";
import { escapeHtml } from "@/lib/security/sanitize";
import { hasValue } from "@/lib/utils";

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!isEmailConfigured()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}: ${await res.text()}`);
  return true;
}

const row = (label: string, value: string) =>
  value ? `<tr><td style="padding:6px 16px 6px 0;color:#62655e;font-size:13px">${label}</td><td style="padding:6px 0;font-size:14px">${escapeHtml(value)}</td></tr>` : "";

function layout(title: string, body: string, companyName: string) {
  return `<div style="font-family:Arial,sans-serif;background:#f6f2e9;padding:32px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:32px;color:#1b3125">
  <p style="letter-spacing:3px;font-size:11px;color:#a8793c;text-transform:uppercase;margin:0">${escapeHtml(companyName)}</p>
  <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:12px 0 20px">${title}</h1>${body}</div></div>`;
}

/** Internal notification, buyer confirmation and optional webhook — each best-effort and independent. */
export async function notifyInquiry(inquiry: Inquiry, company: CompanyProfile) {
  const name = company.name.replace(/^\[|\]$/g, "");
  const table = `<table>${row("Reference", inquiry.reference)}${row("Name", inquiry.name)}${row("Company", inquiry.company)}${row("Country", inquiry.country)}${row("Email", inquiry.email)}${row("Phone", inquiry.phone)}${row("Product", inquiry.product)}${row("Quantity", inquiry.quantity)}${row("Packaging", inquiry.packaging)}</table>${
    inquiry.message ? `<p style="white-space:pre-wrap;border-top:1px solid #eee;padding-top:16px;font-size:14px">${escapeHtml(inquiry.message)}</p>` : ""
  }`;
  const adminTo = env.notifyEmail || (hasValue(company.email) ? company.email : "");
  const tasks: Promise<unknown>[] = [];

  if (adminTo) tasks.push(sendEmail(adminTo, `New quote request ${inquiry.reference} — ${inquiry.company || inquiry.name}`, layout("New quote request", table, name), inquiry.email));
  tasks.push(
    sendEmail(
      inquiry.email,
      `We received your inquiry (${inquiry.reference})`,
      layout(
        "Thank you for your inquiry",
        `<p style="font-size:14px;line-height:1.6">Dear ${escapeHtml(inquiry.name)},<br/>Our export team has received your request and will be in touch shortly. Your reference number is <strong>${inquiry.reference}</strong>.</p>${table}`,
        name,
      ),
      adminTo || undefined,
    ),
  );
  if (env.inquiryWebhookUrl) {
    tasks.push(
      fetch(env.inquiryWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "inquiry.created", inquiry }),
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error("[inquiry-notify]", r.reason);
  if (!isEmailConfigured()) console.info(`[inquiry] ${inquiry.reference} stored — email not configured, skipping notifications.`);
}

export async function notifyContact(msg: ContactMessage, company: CompanyProfile) {
  const adminTo = env.notifyEmail || (hasValue(company.email) ? company.email : "");
  if (!adminTo) return;
  const body = `<table>${row("Name", msg.name)}${row("Email", msg.email)}${row("Phone", msg.phone)}${row("Subject", msg.subject)}</table><p style="white-space:pre-wrap;font-size:14px">${escapeHtml(msg.message)}</p>`;
  try {
    await sendEmail(adminTo, `Website message: ${msg.subject || msg.name}`, layout("New website message", body, company.name), msg.email);
  } catch (err) {
    console.error("[contact-notify]", err);
  }
}
