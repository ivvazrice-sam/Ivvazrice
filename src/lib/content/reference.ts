import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly, non-sequential inquiry reference, e.g. RQ-260928-7KQ2M. */
export function inquiryReference(date = new Date()) {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  let code = "";
  for (let i = 0; i < 5; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `RQ-${ymd}-${code}`;
}
