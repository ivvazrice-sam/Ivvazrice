/**
 * Content model for the whole website.
 *
 * Every piece of company-specific information lives in one of these shapes and is
 * stored either in the local JSON store (development / self-hosting) or in Supabase
 * (production). Nothing company-specific is hard-coded in the UI.
 */

export type GrainTone = "white" | "cream" | "golden" | "brown" | "husk";
export type MediaType = "image" | "video";
export type VideoProvider = "mp4" | "youtube" | "vimeo";

export interface Stat {
  label: string;
  /** Leave empty until real figures are supplied — the UI renders a placeholder. */
  value: string;
  prefix?: string;
  suffix?: string;
  note?: string;
}

export interface Highlight {
  title: string;
  text: string;
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  tagline: string;
  shortDescription: string;
  story: string;
  logoUrl: string;
  logoDarkUrl: string;
  foundedYear: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroVideoUrl: string;
  heroPosterUrl: string;
  aboutMediaUrl: string;
  aboutMediaType: MediaType;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  businessHours: string;
  mapEmbedUrl: string;
  mapLink: string;
  originLabel: string;
  originCountry: string;
  originLat: number;
  originLng: number;
  originPort: string;
  highlights: Highlight[];
  stats: Stat[];
}

export interface SiteSettings {
  /** When true, empty sections render labelled placeholder slots. Turn off before launch. */
  showPlaceholders: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImageUrl: string;
  twitterHandle: string;
  exportHeadline: string;
  exportIntro: string;
  shippingCapability: string;
  internationalSupply: string;
  majorMarketsNote: string;
  qualityIntro: string;
  privacyPolicy: string;
  terms: string;
  /** Page header photographs (one per inner page). */
  imageAbout: string;
  imageProducts: string;
  imagePackaging: string;
  imageProcessing: string;
  imageQuality: string;
  imageExport: string;
  imageInfrastructure: string;
  imageVideos: string;
  imageContact: string;
  imageQuote: string;
}

interface BaseItem {
  id: string;
  sortOrder: number;
  published: boolean;
}

export interface Spec {
  label: string;
  value: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface VideoRef {
  title: string;
  provider: VideoProvider;
  url: string;
  posterUrl: string;
}

/** A processing expression of a variety (Raw, Steam, Creamy Sella…) with its own specification. */
export interface RiceExpression {
  name: string;
  /** Hex colour used to render the grain (e.g. #ead8ae). */
  tone: string;
  toneLabel: string;
  description: string;
  avgLength: string;
  cookedLength: string;
  whiteness: string;
  moisture: string;
  broken: string;
  imageUrl: string;
}

export interface Product extends BaseItem {
  slug: string;
  name: string;
  variety: string;
  category: string;
  shortDescription: string;
  overview: string;
  grainLength: string;
  texture: string;
  appearance: string;
  packagingOptions: string[];
  availableQuantities: string;
  exportAvailability: string;
  specifications: Spec[];
  qualityInfo: string;
  applications: string[];
  grainTone: GrainTone;
  featured: boolean;
  images: ProductImage[];
  videos: VideoRef[];
  /** Processing expressions with specifications (drives the expression studio + length ruler). */
  expressions: RiceExpression[];
  characterTags: string[];
  marketTags: string[];
  /** Typical cooked length, e.g. "20–22 mm" (shown as elongation on the ruler). */
  cookedLength: string;
  /** Starter/sample data: shown with a "Sample specification" badge, hidden when placeholder mode is off. */
  sampleData: boolean;
}

export interface ProcessingStep extends BaseItem {
  number: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  mediaUrl: string;
  mediaType: MediaType;
}

export interface Technology extends BaseItem {
  title: string;
  description: string;
  icon: string;
  mediaUrl: string;
  mediaType: MediaType;
}

export interface QualityCheck extends BaseItem {
  title: string;
  description: string;
  icon: string;
}

export interface Certification extends BaseItem {
  name: string;
  kind: "certification" | "standard";
  issuer: string;
  certificateNumber: string;
  validUntil: string;
  imageUrl: string;
  documentUrl: string;
}

export type TrustKind = "registration" | "export-document" | "buyer-logo" | "award" | "membership" | "association";

export interface TrustItem extends BaseItem {
  kind: TrustKind;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export interface ExportCountry extends BaseItem {
  name: string;
  region: string;
  lat: number;
  lng: number;
  port: string;
  isMajorMarket: boolean;
  note: string;
  /** Seed entries are marked as placeholders so they are never mistaken for real markets. */
  isPlaceholder: boolean;
}

export interface ExportRoute extends BaseItem {
  name: string;
  originPort: string;
  originLat: number;
  originLng: number;
  destinationPort: string;
  destinationLat: number;
  destinationLng: number;
  mode: "sea" | "air" | "land";
  transitNote: string;
}

export interface ExportStep extends BaseItem {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export type FactoryCategory =
  | "rice-mill"
  | "processing-plant"
  | "machinery"
  | "storage"
  | "warehouse"
  | "packaging"
  | "laboratory"
  | "loading"
  | "container";

export interface FactoryMedia extends BaseItem {
  title: string;
  description: string;
  category: FactoryCategory;
  type: MediaType;
  url: string;
  posterUrl: string;
  provider: VideoProvider;
}

export interface Video extends BaseItem {
  title: string;
  description: string;
  category: string;
  provider: VideoProvider;
  url: string;
  posterUrl: string;
  duration: string;
  featured: boolean;
}

/** Vertical recipe / serving reels for the Kitchen Creativity section. */
export interface KitchenVideo extends BaseItem {
  title: string;
  tag: string;
  description: string;
  /** Light (~540×960) MP4 used in the autoplaying cards. */
  videoUrl: string;
  /** Optional high-resolution MP4 for the full-screen viewer. */
  videoHdUrl: string;
  posterUrl: string;
}

export interface Packaging extends BaseItem {
  name: string;
  packType: "consumer" | "bulk" | "export" | "custom";
  description: string;
  sizes: string;
  material: string;
  privateLabel: string;
  moq: string;
  imageUrl: string;
}

export interface Testimonial extends BaseItem {
  customerName: string;
  company: string;
  country: string;
  imageUrl: string;
  quote: string;
}

export interface PartnerReason extends BaseItem {
  title: string;
  description: string;
  icon: string;
}

export interface SocialLink extends BaseItem {
  platform: string;
  url: string;
}

export interface CollectionMap {
  products: Product;
  processingSteps: ProcessingStep;
  technologies: Technology;
  qualityChecks: QualityCheck;
  certifications: Certification;
  trustItems: TrustItem;
  exportCountries: ExportCountry;
  exportRoutes: ExportRoute;
  exportSteps: ExportStep;
  factoryMedia: FactoryMedia;
  videos: Video;
  kitchenVideos: KitchenVideo;
  packaging: Packaging;
  testimonials: Testimonial;
  partnerReasons: PartnerReason;
  socialLinks: SocialLink;
}

export type CollectionKey = keyof CollectionMap;
export type CollectionItem<K extends CollectionKey = CollectionKey> = CollectionMap[K];

export const COLLECTION_KEYS: CollectionKey[] = [
  "products",
  "processingSteps",
  "technologies",
  "qualityChecks",
  "certifications",
  "trustItems",
  "exportCountries",
  "exportRoutes",
  "exportSteps",
  "factoryMedia",
  "videos",
  "kitchenVideos",
  "packaging",
  "testimonials",
  "partnerReasons",
  "socialLinks",
];

export interface ContentSnapshot {
  company: CompanyProfile;
  settings: SiteSettings;
  collections: { [K in CollectionKey]: CollectionMap[K][] };
}

export const INQUIRY_STATUSES = ["new", "contacted", "quoted", "negotiation", "won", "lost", "spam"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Inquiry {
  id: string;
  reference: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  packaging: string;
  message: string;
  status: InquiryStatus;
  notes: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}
