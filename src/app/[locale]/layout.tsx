import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { enabledLocales, isEnabledLocale, localeDir } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSiteContent } from "@/lib/content/queries";
import { env } from "@/lib/env";
import { organizationSchema, pageMetadata } from "@/lib/seo/metadata";
import { BackToTop } from "@/components/layout/back-to-top";
import { BrandIntro } from "@/components/layout/brand-intro";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/layout/json-ld";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/layout/providers";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ChatWidget } from "@/components/chat/chat-widget";

const display = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT"], variable: "--font-display-face", display: "swap", preload: true, adjustFontFallback: true });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans-face", display: "swap", preload: true, adjustFontFallback: true });

/** Content is statically rendered and refreshed every 5 minutes (admin saves revalidate instantly). */
export const revalidate = 300;

export function generateStaticParams() {
  return enabledLocales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#1b3125",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const content = await getSiteContent();
  return {
    metadataBase: new URL(env.siteUrl),
    ...pageMetadata({ content, locale, path: "/" }),
    applicationName: content.company.name.replace(/^\[|\]$/g, ""),
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isEnabledLocale(locale)) notFound();
  const [dict, content] = await Promise.all([getDictionary(locale), getSiteContent()]);
  const { company, settings, collections } = content;
  const navExtras = {
    products: collections.products.map((p) => ({ name: p.name, slug: p.slug })),
    images: { about: settings.imageAbout, products: settings.imageProducts, processing: settings.imageProcessing, export: settings.imageExport },
  };

  return (
    <html lang={locale} dir={localeDir(locale)} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <BrandIntro name={company.name} logoUrl={company.logoUrl} />
        <I18nProvider locale={locale} dict={dict}>
          <Providers>
            <ScrollProgress />
            <Navbar company={{ name: company.name, logoUrl: company.logoUrl, logoDarkUrl: company.logoDarkUrl, phone: company.phone, email: company.email, whatsapp: company.whatsapp }} extras={navExtras} />
            <main id="main">{children}</main>
            <Footer content={content} dict={dict} locale={locale} />
            <ChatWidget company={{ name: company.name, whatsapp: company.whatsapp, email: company.email, phone: company.phone }} />
            <BackToTop />
          </Providers>
        </I18nProvider>
        <JsonLd data={organizationSchema(content)} />
      </body>
    </html>
  );
}
