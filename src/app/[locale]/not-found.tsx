import Link from "next/link";
import en from "@/i18n/dictionaries/en";
import { buttonClass } from "@/components/ui/button";
import { GrainArt } from "@/components/ui/grain-art";

export default function NotFound() {
  return (
    <section className="noise relative flex min-h-[90svh] items-center overflow-hidden bg-ink text-pearl">
      <div className="absolute inset-0 opacity-30">
        <GrainArt seed="404" tone="husk" background="none" />
      </div>
      <div className="container-x relative">
        <p className="eyebrow text-gold-2">404</p>
        <h1 className="display mt-5 text-6xl sm:text-8xl">{en.common.notFoundTitle}</h1>
        <p className="mt-6 max-w-md text-pearl/60">{en.common.notFoundBody}</p>
        <Link href="/" className={buttonClass("gold", "lg", "mt-10")}>
          {en.common.goHome}
        </Link>
      </div>
    </section>
  );
}
