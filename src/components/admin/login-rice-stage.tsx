"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { GrainArt } from "@/components/ui/grain-art";

/** The main site's cinematic hero scene (loop of formations) — client-only; three.js never SSR. */
const HeroScene = dynamic(() => import("@/components/three/hero-scene"), { ssr: false });

/**
 * Cinematic 3D rice-grain stage for the admin login's dark panel. Reuses the same
 * photoreal hero scene that greets public visitors, so the login feels like part of
 * the brand. Degrades gracefully to procedural artwork on small screens, reduced-motion
 * preference, or when WebGL is unavailable.
 */
export function LoginRiceStage() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.innerWidth < 1024;
    if (reduce || smallScreen) return;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) setEnabled(true);
    } catch {
      /* no webgl */
    }
  }, []);

  return (
    <div className="absolute inset-0">
      {(!enabled || !ready) && <GrainArt seed="admin-login" tone="husk" background="dark" />}
      {enabled && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <HeroScene tier="high" active onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
