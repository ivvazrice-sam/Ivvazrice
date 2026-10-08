"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" autoComplete="username" required className="admin-input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="admin-input mt-1.5" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="admin-btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
