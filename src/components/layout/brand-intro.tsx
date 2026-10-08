import Script from "next/script";

/**
 * First-view brand reveal (once per browser session). Pure CSS — the inline script marks
 * repeat views before first paint so the overlay never flashes; reduced-motion users skip it.
 */
export function BrandIntro({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <>
      <Script id="brand-intro-check" strategy="beforeInteractive">
        {"try{if(sessionStorage.getItem('brand-intro'))document.documentElement.classList.add('intro-seen');else sessionStorage.setItem('brand-intro','1')}catch(e){document.documentElement.classList.add('intro-seen')}"}
      </Script>
      <div className="brand-intro" aria-hidden>
        <div className="flex flex-col items-center gap-6">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="bi-word h-14 w-auto sm:h-20" />
          ) : (
            <span className="bi-word font-display text-6xl text-pearl">{name.replace(/^\[|\]$/g, "")}</span>
          )}
          <span className="bi-line h-px bg-gold-2" />
          <span className="bi-tag eyebrow text-[0.7rem] text-gold-2/90">Premium Rice · India</span>
        </div>
      </div>
    </>
  );
}
