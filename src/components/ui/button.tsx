import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "outline-light" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-[0.01em] transition-[background-color,color,border-color,transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-pearl hover:bg-forest shadow-[0_10px_30px_-12px_rgba(27,49,37,0.6)]",
  gold: "bg-gold text-ink hover:bg-gold-2 shadow-[0_12px_40px_-14px_rgba(198,161,91,0.8)]",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-pearl",
  "outline-light": "border border-pearl/30 text-pearl hover:border-pearl hover:bg-pearl hover:text-ink",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-pearl text-ink hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface LinkProps extends Omit<React.ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
}

export function ButtonLink({ variant, size, className, arrow, children, ...props }: LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      <span>{children}</span>
      {arrow && (
        <ArrowUpRight
          className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
          strokeWidth={1.8}
        />
      )}
    </Link>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
