"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Payload = {
  new?: { id?: string; name?: string; company?: string; email?: string };
};

/**
 * Realtime watcher that fires when a new row lands in `inquiries` or `contact_messages`.
 * Shows a browser notification, plays a soft ping, flashes the tab title and refreshes the
 * server data so the sidebar "new leads" badge updates live. One-click button lets the admin
 * grant / revoke notification permission; preference is remembered per-browser.
 */
export function InquiryNotifier() {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const originalTitleRef = useRef<string>("");
  const flashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved preference + current permission state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
    try {
      const saved = localStorage.getItem("inqNotifyEnabled");
      if (saved !== null) setEnabled(saved === "1");
    } catch {
      /* ignore */
    }
    originalTitleRef.current = document.title;
  }, []);

  // Play a short "ding" using Web Audio API (no audio file needed).
  const ping = () => {
    try {
      if (!audioCtxRef.current) {
        type AudioContextCtor = typeof AudioContext;
        const Ctor: AudioContextCtor | undefined =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      /* ignore */
    }
  };

  const flashTitle = (preview: string) => {
    if (document.visibilityState === "visible") return;
    if (flashTimerRef.current) clearInterval(flashTimerRef.current);
    const titles = [`🔔 ${preview}`, originalTitleRef.current];
    let i = 0;
    flashTimerRef.current = setInterval(() => {
      document.title = titles[i++ % 2];
    }, 1200);
    const stop = () => {
      if (flashTimerRef.current) {
        clearInterval(flashTimerRef.current);
        flashTimerRef.current = null;
      }
      document.title = originalTitleRef.current;
      document.removeEventListener("visibilitychange", onVis);
    };
    const onVis = () => document.visibilityState === "visible" && stop();
    document.addEventListener("visibilitychange", onVis);
  };

  const notify = (title: string, body: string) => {
    if (!enabled) return;
    ping();
    flashTitle(title);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        const n = new Notification(title, { body, icon: "/icon.png", tag: "ivvaz-inquiry", requireInteraction: false });
        n.onclick = () => {
          window.focus();
          router.push("/admin/inquiries");
          n.close();
        };
      } catch {
        /* ignore */
      }
    }
  };

  // Subscribe to Supabase realtime inserts on inquiries + contact_messages.
  useEffect(() => {
    if (!enabled) return;
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel("admin-new-rows")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inquiries" }, (payload: Payload) => {
        const n = payload.new ?? {};
        const label = n.company || n.name || n.email || "Anonymous";
        notify("New inquiry", `${label} just submitted a quote request.`);
        router.refresh();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload: Payload) => {
        const n = payload.new ?? {};
        const label = n.company || n.name || n.email || "Anonymous";
        notify("New message", `${label} just sent a message.`);
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem("inqNotifyEnabled", next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next && permission === "default" && typeof Notification !== "undefined") {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
      } catch {
        /* ignore */
      }
    }
  };

  const label =
    permission === "unsupported"
      ? "Not supported"
      : !enabled
        ? "Alerts off"
        : permission === "granted"
          ? "Alerts on"
          : permission === "denied"
            ? "Blocked — enable in browser"
            : "Enable alerts";

  return (
    <button
      type="button"
      onClick={toggleEnabled}
      disabled={permission === "unsupported"}
      className="group flex w-full items-center gap-2 rounded-xl bg-pearl/5 px-3 py-2 text-[0.78rem] text-pearl/70 ring-1 ring-pearl/10 transition hover:bg-pearl/10 hover:text-pearl disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {enabled && permission === "granted" ? (
        <Bell className="size-4 text-emerald-400" />
      ) : (
        <BellOff className="size-4" />
      )}
      <span className="flex-1 truncate text-left">{label}</span>
      {enabled && permission === "granted" && (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
      )}
    </button>
  );
}
