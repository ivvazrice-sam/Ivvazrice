"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const RiceHeapScene = dynamic(() => import("@/components/three/rice-heap-scene"), { ssr: false });

export function BakeHeap({ color }: { color: string }) {
  const [ready, setReady] = useState(false);
  return (
    <>
      <style>{"html,body{background:transparent!important;margin:0}nextjs-portal{display:none!important}"}</style>
      <div id="bake" data-ready={ready ? "1" : "0"} style={{ position: "fixed", inset: 0 }}>
        <RiceHeapScene color={color} tier="high" active still onReady={() => setTimeout(() => setReady(true), 1500)} />
      </div>
    </>
  );
}
