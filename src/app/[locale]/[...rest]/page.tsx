import { notFound } from "next/navigation";

/** Any unmatched path under a locale renders the localised 404 page. */
export default function CatchAll() {
  notFound();
}
