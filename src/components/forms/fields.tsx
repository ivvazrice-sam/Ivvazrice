import { cn } from "@/lib/utils";

export type Tone = "dark" | "light";

const inputBase =
  "peer w-full rounded-none border-0 border-b bg-transparent px-0 pb-3 pt-6 text-[0.95rem] outline-none transition-colors duration-300 placeholder:text-transparent focus:placeholder:text-current/35";

export function inputClass(tone: Tone, error?: string) {
  return cn(
    inputBase,
    tone === "dark" ? "border-pearl/20 text-pearl focus:border-gold" : "border-ink/20 text-ink focus:border-husk",
    error && "border-red-400 focus:border-red-400",
  );
}

/** Floating-label field wrapper with accessible error messaging. */
export function Field({
  id,
  label,
  error,
  tone,
  required,
  className,
  children,
  filled,
}: {
  id: string;
  label: string;
  error?: string;
  tone: Tone;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  filled?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left transition-all duration-300 ease-[var(--ease-out-expo)]",
          filled ? "top-0 scale-[0.78]" : "top-6 peer-focus:top-0 peer-focus:scale-[0.78]",
          tone === "dark" ? "text-pearl/55 peer-focus:text-gold-2" : "text-stone peer-focus:text-husk",
        )}
      >
        {label}
        {required && <span className={tone === "dark" ? "text-gold" : "text-husk"}> *</span>}
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** Visually hidden honeypot. Real users never see or fill it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
