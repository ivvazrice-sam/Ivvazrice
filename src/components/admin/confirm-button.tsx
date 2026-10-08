"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/** Runs a server action after a native confirmation prompt (used for deletions). */
export function ConfirmButton({
  action,
  message,
  children,
  className,
}: {
  action: () => Promise<unknown>;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(message)) start(async () => void (await action()));
      }}
      className={cn("disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}
