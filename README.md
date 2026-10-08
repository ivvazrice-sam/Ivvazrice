# Rice Export Website

Corporate website, product catalogue, export platform and content admin for a rice milling and rice export company. Every company-specific detail (name, logo, products, images, videos, certifications, export countries, contact details, statistics) is edited from the admin panel. Nothing company-specific is hard-coded.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber · Motion · Lenis · Zod · Supabase (optional)

---

## Quick start

```bash
npm install
cp .env.example .env.local        # then edit
npm run hash-password -- "choose-a-strong-password"   # paste the output into .env.local
npm run dev
```

- Website: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

Without Supabase variables, the site runs on the **local JSON store**: content starts from `data/seed.json` and edits, leads and uploads are written to `DATA_DIR` (default `.data/`).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | Quality checks |
| `npm run hash-password -- "…"` | Generate `ADMIN_PASSWORD_HASH` + `SESSION_SECRET` |
| `node scripts/seed-supabase.mjs` | Load the placeholder content into Supabase |

---

## Frontend / Backend map

This is a Next.js App Router project, so frontend and backend live under the same `src/` tree (Next.js requires it). Here is which part is which:

### Frontend (UI — runs in the browser)

| Path | What it is |
| --- | --- |
| `src/app/[locale]/` | Public website pages (home, about, products, export, contact, quote, etc.) |
| `src/app/admin/` | Admin CMS UI (login, dashboard, content editors, inquiries, messages) |
| `src/components/` | React components — `sections/`, `three/` (WebGL), `ui/`, `layout/`, `forms/`, `admin/` |
| `src/hooks/` | Client-side React hooks |
| `src/i18n/` | Locale config, dictionaries, client provider |
| `src/app/globals.css` | Global styles (Tailwind) |
| `public/`, `brand/` | Static assets served as-is |

### Backend (server — runs on Node)

| Path | What it is |
| --- | --- |
| `src/app/api/` | HTTP API routes — `inquiries/`, `contact/`, `admin/` (upload, inquiries export) |
| `src/app/media/[...path]/` | Serves local uploads with Range support for video |
| `src/lib/content/` | Data layer — types, defaults, file & Supabase store implementations |
| `src/lib/admin/` | Admin schema, payload validation, field whitelisting |
| `src/lib/auth/` | Sessions, roles, permissions |
| `src/lib/email/`, `security/`, `seo/`, `validation/`, `media/`, `supabase/` | Server utilities |
| `src/lib/env.ts` | Environment variable loading |
| `src/proxy.ts` | Locale routing middleware |
| `supabase/migrations/` | Database schema, RLS policies, storage bucket |
| `scripts/` | One-off scripts (seed Supabase, build brand assets, hash password) |
| `data/seed.json` | Default content loaded on first run |

### Shared / config

`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json`, `.env*`.

---

## Placeholder policy (important)

The site ships with **no invented facts**. There are no fake statistics, certifications, testimonials, export countries, buyer logos or specifications.

- Unfilled text is written as `[Bracketed placeholder]`.
- **Placeholder mode** (*Admin → Site settings → Show placeholder slots*) shows labelled empty slots so you can see the layout. **Turn it off before launch.** Empty sections and bracketed text are then hidden from visitors.
- Rules that apply automatically:
  - Testimonials are hidden until real ones are published.
  - Statistics with no value are hidden.
  - "Why partner with us" and "Technology" cards stay hidden while their descriptions are still placeholders.
  - Seed export countries are flagged `isPlaceholder` and labelled as sample positions on the globe.
- Until real photography is uploaded, images are replaced by **generative rice-grain artwork** (server-rendered SVG, zero JS). Each upload replaces its artwork automatically.
- The admin dashboard has a **launch checklist**.

### Brand (Ivvaz)

- The source logo is `brand/ivvaz-logo-source.png`. `node scripts/build-brand.mjs` regenerates:
  - transparent wordmarks: `public/brand/ivvaz-{white,green,gold}.png`
  - the leaf "I" mark
  - favicons: `src/app/icon.png` and `src/app/apple-icon.png`
- In **Admin → Company profile**, set two logos:
  - *Logo — light version*: the white logo, used on the hero, footer and dark sections.
  - *Logo — dark version*: the green logo, used on the cream navigation bar after scrolling. The navigation cross-fades between the two.
- First view per session shows a short brand reveal (pure CSS, skipped for reduced motion).

### Photoreal 3D rice

- `src/components/three/rice-grain.ts` defines the realistic grain model:
  - real proportions, a bowed back, a tapered tip and an embryo notch
  - a PBR material with fake translucency and striations
  - a natural-heap generator (angle of repose, ambient-occlusion shading)
- The model is used in four places:
  - the hero animation
  - the live, draggable heap in the product **Expression studio**
  - the 3D grains on the **grain-length ruler**
  - baked heap images, used for product cards without photos and as the no-WebGL fallback
- To re-bake the heap images after changing the model, start `npm run dev`, then run `node scripts/bake-renders.mjs` (needs Chrome). This regenerates `public/renders/heap-*.png`.

### Sample photography

The starter content includes free stock photos from Pexels (rice grains, paddy, warehouses, ports) so the site looks finished while you prepare real photography.

- They are flagged by their host (`images.pexels.com`) and carry a **"Sample photo"** badge.
- They are **removed automatically when placeholder mode is switched off**, so stock images are never presented as your own facility.
- Replace them in the admin with your own mill, product and factory photos.

---

## Site structure

- **Home** (key information only):
  - 3D hero
  - about teaser with stats
  - featured products
  - animated mill line (teaser)
  - export globe
  - "Discover" photo cards
  - testimonials (when published)
  - quote call-to-action
- **About ▾**: About · Infrastructure · Videos
- **Products ▾**: All products (filterable catalogue) · each product · Packaging
- **Processing ▾**: Inside the Mill (scroll-driven machine walkthrough) · Technology · Quality Control
- **Global Export ▾**: Export Markets (globe) · Export Process · Track an inquiry
- **Contact**, plus the **Request a Quote** button

On desktop the menus open as mega menus with a photo card. On mobile they become an animated accordion.

### Animated mill line

`src/components/mill/` draws ten working machines as SVG with CSS animations:

1. Tipper truck and bucket elevator
2. Vibrating pre-cleaner
3. Destoner
4. **Rubber-roll sheller** (husker), with husk blown out
5. Optical sorter with camera beam and air-ejector
6. Mist polisher
7. Inspection bench
8. Rotary grader
9. Bag filling and stitching
10. Container crane and ship

Grain flows between the machines through overhead pipes, changing colour from husk to brown to cream to white.

On `/processing` the line is pinned: scrolling pans across the machines and shows each machine's CMS description and photo. On the home page it glides past on its own; hover pauses it, and clicking a machine opens the walkthrough at that machine.

The animations pause when off-screen and respect reduced-motion settings.

---

## Architecture

```
src/
  app/
    [locale]/              Public site (home, about, products, products/[slug], processing, quality,
                           export, infrastructure, videos, contact, quote, quote/status, privacy, terms)
    admin/                 Admin CMS (login, dashboard, company, settings, content/[collection], inquiries, messages)
    api/                   inquiries · inquiries/status · contact · admin/upload · admin/inquiries/export
    media/[...path]        Serves local uploads (file-store mode) with Range support for video
    sitemap.ts robots.ts manifest.ts icon.svg global-not-found.tsx
  components/
    sections/              One component per website section
    three/                 WebGL: hero rice-grain scene, export globe, land-mask builder
    ui/ layout/ forms/ admin/
  i18n/                    Locale config, dictionaries, client provider
  lib/
    content/               Types, defaults, store interface + file & Supabase implementations
    admin/                 Declarative admin schema, payload coercion/whitelisting
    auth/                  Sessions, roles, permissions
    seo/  security/  email/  validation/  media/
  proxy.ts                 Locale routing (clean URLs for English)
data/seed.json             Placeholder content
supabase/migrations/       Schema, RLS policies, storage bucket
```

### Content model and admin

`src/lib/admin/schema.ts` declares every editable collection and its fields. The admin's forms, list views and server-side field whitelist are all generated from it. To add a field, add it to the type in `lib/content/types.ts`, the default in `lib/content/defaults.ts`, the schema, and (for Supabase) a column.

The admin manages all of the following:
- Company information, logo, story, statistics and contact details
- Products: add, edit, delete, publish/unpublish, images, videos, specifications and packaging
- Processing steps, technology, quality checks, certifications and the trust/credibility items
- Export countries, export routes and export steps
- Factory media, videos, packaging, testimonials, "why us" reasons and social links
- SEO, legal pages, and inquiry and message leads

Saving content revalidates the statically rendered site immediately.

### Inquiry system

1. The form validates on the client with the Zod schemas shared with the API.
2. `POST /api/inquiries` then applies its own checks:
   - same-origin check
   - rate limit: 5 requests per 10 minutes per IP
   - Zod validation, then sanitisation
   - a honeypot field and a minimum fill time
3. The inquiry is stored with a reference such as `RQ-260928-7KQ2M`.
4. After the response is sent (`after()`), the system:
   - emails the admin
   - sends the buyer a confirmation (when Resend is configured)
   - calls the optional webhook
5. Buyers track their inquiry status at `/quote/status` using the reference and their email.
6. Staff manage the pipeline in *Admin → Inquiries*:
   - statuses: new → contacted → quoted → negotiation → won/lost/spam
   - internal notes, email/WhatsApp reply, and CSV export (protected against formula injection)

### 3D and performance

- **Hero:**
  - A single instanced mesh of up to 2,400 rice grains, with a custom shader that morphs each grain from ridged husk to polished pearl.
  - Eight scroll-driven formations: Paddy → Processing → Cleaning → Sorting (with an optical beam and rejected grains) → Polishing → Premium Rice → Packaging → Export.
  - Adaptive quality: if frame time degrades, the grain count and pixel ratio are halved.
- **Export globe:**
  - Continents are drawn as dots rasterised from world-atlas data, with India highlighted.
  - Great-circle shipping lanes carry animated comets and moving container markers.
  - Drag to rotate. Hovering a market focuses its lane. HTML labels are projected from 3D.
  - The globe is downloaded only when its section approaches the viewport.
- **Device tiers** (`useDeviceTier`):
  - `none`: reduced motion, data-saver, no WebGL or weak hardware. Uses the fallback: the hero video, generative art, or a 2D canvas map.
  - `low`: phones and tablets get fewer particles and a lower pixel ratio.
  - `high`: capable desktops get the full effects.
- The WebGL canvases stop rendering when they are off-screen.
- The 3D code is split into lazy chunks (`next/dynamic`, `ssr: false`).
- Videos never load until played (YouTube via `youtube-nocookie`). Ambient videos load only when near the viewport.
- Images go through `next/image` (AVIF/WebP, responsive `srcset`). Uploaded media is served with immutable caching.
- Public pages are statically generated with 5-minute ISR, which makes them CDN-ready.

### SEO

- Unique titles and descriptions per page, canonical URLs and `hreflang` alternates
- Open Graph and X cards, plus a generated OG image
- Schema.org data: Organization (site-wide), Product (product pages) and BreadcrumbList (inner pages)
- `sitemap.xml`, `robots.txt` and a web manifest
- Semantic landmarks and alt text

Default keywords are editable in *Site settings*. Keep them limited to products you actually sell.

### Internationalisation

- Routes live under `app/[locale]`. English is served from clean URLs; `/en/...` redirects there.
- Arabic, French and Spanish are pre-configured and **disabled** in `src/i18n/config.ts`, with RTL support for Arabic.
- To launch a language:
  1. Add a dictionary.
  2. Register it in `get-dictionary.ts`.
  3. Set `enabled: true`.
- Company content is never machine-translated automatically. The Supabase tables include a `translations` JSON column for approved translations.

### Security

- **Admin authentication:**
  - Supabase Auth plus an `admin_users` role table, or
  - local credentials with a scrypt-hashed password and an HMAC-signed, httpOnly, 8-hour session cookie.
- **Roles:** `admin` has full access, `editor` manages content and uploads, `sales` manages inquiries and messages.
- Roles are checked in every admin page, server action and API route, and again at the database by Supabase RLS.
- Admin payloads are whitelisted against the schema. URL fields accept only `https://` or site-relative paths, which blocks `javascript:` URLs.
- **Uploads:**
  - Authenticated and same-origin only.
  - Type is detected by magic bytes. JPG, PNG, WebP, AVIF, GIF, PDF, MP4 and WebM are accepted; SVG and HTML are rejected.
  - Size limits apply, and files are renamed to random UUIDs.
  - Files are served with `nosniff` and a sandbox CSP.
- **Also covered:**
  - Rate-limited public forms and login
  - Input sanitisation, and structured data escaped against `</script>` injection
  - Security headers (HSTS, frame options, referrer and permissions policies)
  - `noindex` on admin pages
  - Secrets used only on the server (`server-only` imports)

The rate limiter is in-memory, which suits a single instance. For multiple instances, back it with Redis/Upstash (same interface in `lib/security/rate-limit.ts`).

---

## Production deployment

### Option A — Supabase + Vercel (recommended)

1. Create a Supabase project. Run `supabase/migrations/0001_init.sql` in the SQL editor. This creates the tables, RLS policies and the public `media` storage bucket.
2. Seed the placeholder content:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed-supabase.mjs
   ```
3. Create your user in *Authentication → Users*, then grant access:

   ```sql
   insert into admin_users (user_id, role) values ('<user-uuid>', 'admin');
   ```
4. Set these environment variables:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optionally `RESEND_API_KEY`, `EMAIL_FROM` and `INQUIRY_NOTIFY_EMAIL`
5. Deploy. Uploads go to Supabase Storage (50 MB per file). For long factory films, prefer YouTube or Vimeo links.

### Option B — Single Node server (VPS)

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL`.
2. Point `DATA_DIR` at a persistent, backed-up directory.
3. Run `npm run build && npm start` behind HTTPS (nginx or Caddy).

Serverless hosts have read-only file systems, so use Option A there.

### Before launch

- [ ] Replace every `[placeholder]`: company profile, products, steps, packaging, export countries
- [ ] Upload the logo, product photography, factory images and videos
- [ ] Add only verified certifications, statistics and trust items
- [ ] Set a real Google Maps embed, the WhatsApp number and social links
- [ ] Write the privacy policy and terms
- [ ] Switch **placeholder mode off**
- [ ] Configure email notifications and test an inquiry end-to-end
