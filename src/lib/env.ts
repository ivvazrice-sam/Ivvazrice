import "server-only";

/** Server-side environment helpers. Nothing here is ever sent to the browser. */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseMediaBucket: process.env.SUPABASE_MEDIA_BUCKET || "media",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "",
  notifyEmail: process.env.INQUIRY_NOTIFY_EMAIL || "",
  inquiryWebhookUrl: process.env.INQUIRY_WEBHOOK_URL || "",
  dataDir: process.env.DATA_DIR || ".data",
};

export const isSupabaseConfigured = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isLocalAdminConfigured = () => Boolean(env.adminEmail && env.adminPasswordHash && env.sessionSecret.length >= 32);
export const isEmailConfigured = () => Boolean(env.resendApiKey && env.emailFrom);
