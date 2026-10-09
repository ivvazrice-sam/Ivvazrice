import type { CollectionKey, CollectionMap, CompanyProfile, SiteSettings } from "./types";

/** Empty templates used to normalise stored records and to create new ones in the admin. */
export const companyDefaults: CompanyProfile = {
  name: "",
  legalName: "",
  tagline: "",
  shortDescription: "",
  story: "",
  logoUrl: "",
  logoDarkUrl: "",
  foundedYear: "",
  heroHeadline: "Premium Rice. Advanced Processing. Global Export.",
  heroSubheadline: "",
  heroVideoUrl: "",
  heroPosterUrl: "",
  aboutMediaUrl: "",
  aboutMediaType: "image",
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  businessHours: "",
  mapEmbedUrl: "",
  mapLink: "",
  originLabel: "India",
  originCountry: "India",
  originLat: 22.8,
  originLng: 70.0,
  originPort: "",
  highlights: [],
  stats: [],
};

export const settingsDefaults: SiteSettings = {
  showPlaceholders: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  brandAliases: [],
  googleSiteVerification: "",
  bingSiteVerification: "",
  ogImageUrl: "",
  twitterHandle: "",
  exportHeadline: "From India to Global Markets.",
  exportIntro: "",
  shippingCapability: "",
  internationalSupply: "",
  majorMarketsNote: "",
  qualityIntro: "",
  privacyPolicy: "",
  terms: "",
  imageAbout: "",
  imageProducts: "",
  imagePackaging: "",
  imageProcessing: "",
  imageQuality: "",
  imageExport: "",
  imageInfrastructure: "",
  imageVideos: "",
  imageContact: "",
  imageQuote: "",
};

const base = { id: "", sortOrder: 0, published: false };

export const collectionDefaults: { [K in CollectionKey]: CollectionMap[K] } = {
  products: {
    ...base,
    slug: "",
    name: "",
    variety: "",
    category: "",
    shortDescription: "",
    overview: "",
    grainLength: "",
    texture: "",
    appearance: "",
    packagingOptions: [],
    availableQuantities: "",
    exportAvailability: "",
    specifications: [],
    qualityInfo: "",
    applications: [],
    grainTone: "white",
    featured: false,
    images: [],
    videos: [],
    expressions: [],
    characterTags: [],
    marketTags: [],
    cookedLength: "",
    sampleData: false,
  },
  processingSteps: { ...base, number: "", title: "", summary: "", description: "", icon: "circle", mediaUrl: "", mediaType: "image" },
  technologies: { ...base, title: "", description: "", icon: "cog", mediaUrl: "", mediaType: "image" },
  qualityChecks: { ...base, title: "", description: "", icon: "check" },
  certifications: { ...base, name: "", kind: "certification", issuer: "", certificateNumber: "", validUntil: "", imageUrl: "", documentUrl: "" },
  trustItems: { ...base, kind: "registration", title: "", description: "", imageUrl: "", url: "" },
  exportCountries: { ...base, name: "", region: "", lat: 0, lng: 0, port: "", isMajorMarket: false, note: "", isPlaceholder: false },
  exportRoutes: {
    ...base,
    name: "",
    originPort: "",
    originLat: 0,
    originLng: 0,
    destinationPort: "",
    destinationLat: 0,
    destinationLng: 0,
    mode: "sea",
    transitNote: "",
  },
  exportSteps: { ...base, number: "", title: "", description: "", icon: "circle" },
  factoryMedia: { ...base, title: "", description: "", category: "rice-mill", type: "image", url: "", posterUrl: "", provider: "mp4" },
  videos: { ...base, title: "", description: "", category: "", provider: "youtube", url: "", posterUrl: "", duration: "", featured: false },
  kitchenVideos: { ...base, title: "", tag: "", description: "", videoUrl: "", videoHdUrl: "", posterUrl: "" },
  packaging: { ...base, name: "", packType: "consumer", description: "", sizes: "", material: "", privateLabel: "", moq: "", imageUrl: "" },
  testimonials: { ...base, customerName: "", company: "", country: "", imageUrl: "", quote: "" },
  partnerReasons: { ...base, title: "", description: "", icon: "check" },
  socialLinks: { ...base, platform: "", url: "" },
};

export function normalizeItem<K extends CollectionKey>(key: K, raw: Partial<CollectionMap[K]>): CollectionMap[K] {
  return { ...collectionDefaults[key], ...stripNulls(raw) } as CollectionMap[K];
}

export function normalizeCompany(raw: Partial<CompanyProfile> | null | undefined): CompanyProfile {
  return { ...companyDefaults, ...stripNulls(raw ?? {}) };
}

export function normalizeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  return { ...settingsDefaults, ...stripNulls(raw ?? {}) };
}

function stripNulls<T extends object>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined) out[k] = v;
  return out as Partial<T>;
}
