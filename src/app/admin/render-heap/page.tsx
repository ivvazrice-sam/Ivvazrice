import { notFound } from "next/navigation";
import { BakeHeap } from "./bake-heap";

export const metadata = { robots: { index: false } };

/** Development-only page used by scripts/bake-renders.mjs to bake 3D heap images. */
export default async function RenderHeapPage({ searchParams }: PageProps<"/admin/render-heap">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { color } = await searchParams;
  const hex = typeof color === "string" && /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : "#efe8d8";
  return <BakeHeap color={hex} />;
}
