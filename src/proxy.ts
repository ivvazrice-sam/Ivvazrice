import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, enabledLocales } from "@/i18n/config";

/**
 * Locale routing. The site lives under app/[locale]; the default locale is served
 * from clean, prefix-free URLs (/products) by rewriting internally to /en/products.
 * Additional locales, once enabled, are served from /ar/..., /fr/..., etc.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  // /en/products -> /products (one canonical URL per page). Metadata image routes are served as-is.
  if (first === defaultLocale) {
    if (/\/(opengraph|twitter)-image/.test(pathname)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if ((enabledLocales as string[]).includes(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|media|_next|.*\\..*).*)"],
};
