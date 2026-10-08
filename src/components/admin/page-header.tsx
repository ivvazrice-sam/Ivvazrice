import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: { href: string; label: string }; actions?: React.ReactNode }) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-stone hover:text-ink">
          <ChevronLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-stone">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
