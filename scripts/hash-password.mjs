#!/usr/bin/env node
// Usage: npm run hash-password -- "your-strong-password"
// Prints an ADMIN_PASSWORD_HASH value (scrypt) and a random SESSION_SECRET for .env.local.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Provide a password of at least 10 characters: npm run hash-password -- "your-password"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("base64")}:${hash.toString("base64")}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
