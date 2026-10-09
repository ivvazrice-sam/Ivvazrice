"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem("iv-visitor-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("iv-visitor-id", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Fires one hit per path change. Admin pages are excluded. */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;

    const visitorId = getVisitorId();
    const payload = JSON.stringify({
      path: pathname,
      visitorId,
      referrer: document.referrer || "",
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
