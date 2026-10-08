"use client";

import { useSyncExternalStore } from "react";

/**
 * Decides how much 3D a device should get:
 *  - "none": reduced motion, data saver, no WebGL or very weak hardware → static/video fallback
 *  - "low":  phones, tablets, modest hardware → fewer particles, lower pixel ratio
 *  - "high": capable desktops
 */
export type DeviceTier = "none" | "low" | "high";

let cached: DeviceTier | null = null;

function detect(): DeviceTier {
  if (cached) return cached;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  } catch {
    gl = null;
  }
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const small = window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse)").matches;

  if (reduce || nav.connection?.saveData || !gl || memory <= 2 || cores <= 2) cached = "none";
  else if (small || memory <= 4 || cores <= 4) cached = "low";
  else cached = "high";
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return cached;
}

const subscribe = () => () => {};

/** Returns null during SSR / first hydration pass, then the detected tier. */
export function useDeviceTier(): DeviceTier | null {
  return useSyncExternalStore(subscribe, detect, () => null);
}
