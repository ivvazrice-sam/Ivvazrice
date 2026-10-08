import "server-only";
import { scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { env } from "@/lib/env";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export type Role = "admin" | "editor" | "sales";
export interface AdminUser {
  email: string;
  role: Role;
}

export const SESSION_COOKIE = "rx_admin";
export const SESSION_TTL = 60 * 60 * 8; // 8 hours

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString("base64url");

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(env.sessionSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Signed, expiring session token: base64url(payload).signature */
export async function signSession(user: AdminUser) {
  const payload = b64url(enc.encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL })));
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(token: string | undefined): Promise<AdminUser | null> {
  if (!token || !env.sessionSecret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return { email: data.email, role: data.role };
  } catch {
    return null;
  }
}

/** Verifies a password against "scrypt:<saltB64>:<hashB64>" (see scripts/hash-password.mjs). ":" is used because .env files expand "$". */
export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, { N: 16384, r: 8, p: 1 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
