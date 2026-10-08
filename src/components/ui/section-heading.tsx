import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "./reveal";

export function Eyebrow({ children, className, tone = "dark" }: { children: React.ReactNode; className?: string; tone?: "dark" | "light" }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", tone === "light" ? "text-gold-2" : "text-husk", className)}>
      <span className={cn("h-px w-8", tone === "light" ? "bg-gold-2/60" : "bg-husk/60")} aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "dark",
  align = "left",
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center [&_p.eyebrow]:justify-center", className)}>
      {eyebrow && (
        <Reveal y={12}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <RevealText
        as={as}
        text={title}
        className={cn("display mt-5 text-[2.5rem] sm:text-5xl lg:text-[4.25rem]", tone === "light" ? "text-pearl" : "text-ink")}
      />
      {lede && (
        <Reveal delay={0.15}>
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed sm:text-lg", align === "center" && "mx-auto", tone === "light" ? "text-pearl/65" : "text-stone")}>
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function PlaceholderTag({ children = "Placeholder", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-dashed border-current/40 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-70", className)}>
      <span className="size-1 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}
