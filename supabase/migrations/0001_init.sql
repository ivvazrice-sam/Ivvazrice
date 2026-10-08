-- ════════════════════════════════════════════════════════════════════════
-- Rice export website — database schema, roles and row-level security.
-- Run in the Supabase SQL editor (or `supabase db push`), then run
-- `node scripts/seed-supabase.mjs` to load the placeholder content.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Roles ──────────────────────────────────────────────────────────────
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'sales')),
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

create or replace function public.admin_role() returns text
language sql stable security definer set search_path = public as $$
  select role from admin_users where user_id = auth.uid()
$$;

create policy "admins read own role" on admin_users for select using (user_id = auth.uid() or admin_role() = 'admin');
create policy "admins manage roles" on admin_users for all using (admin_role() = 'admin') with check (admin_role() = 'admin');

-- ─── Company & settings ─────────────────────────────────────────────────
create table if not exists companies (
  id text primary key default 'default',
  name text not null default '',
  legal_name text default '',
  tagline text default '',
  short_description text default '',
  story text default '',
  logo_url text default '',
  logo_dark_url text default '',
  founded_year text default '',
  hero_headline text default '',
  hero_subheadline text default '',
  hero_video_url text default '',
  hero_poster_url text default '',
  about_media_url text default '',
  about_media_type text default 'image',
  address text default '',
  phone text default '',
  email text default '',
  whatsapp text default '',
  business_hours text default '',
  map_embed_url text default '',
  map_link text default '',
  origin_label text default 'India',
  origin_country text default 'India',
  origin_lat double precision default 22.8,
  origin_lng double precision default 70.0,
  origin_port text default '',
  highlights jsonb not null default '[]',
  stats jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ─── Content collections ────────────────────────────────────────────────
create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  slug text not null unique,
  name text not null,
  variety text default '',
  category text default '',
  short_description text default '',
  overview text default '',
  grain_length text default '',
  texture text default '',
  appearance text default '',
  packaging_options jsonb not null default '[]',
  available_quantities text default '',
  export_availability text default '',
  specifications jsonb not null default '[]',
  quality_info text default '',
  applications jsonb not null default '[]',
  grain_tone text default 'white',
  featured boolean not null default false,
  expressions jsonb not null default '[]',
  character_tags jsonb not null default '[]',
  market_tags jsonb not null default '[]',
  cooked_length text default '',
  sample_data boolean not null default false,
  translations jsonb not null default '{}'
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products (id) on delete cascade,
  url text not null,
  alt text default '',
  sort_order int not null default 0
);

create table if not exists product_videos (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products (id) on delete cascade,
  title text default '',
  provider text not null default 'youtube' check (provider in ('mp4', 'youtube', 'vimeo')),
  url text not null,
  poster_url text default '',
  sort_order int not null default 0
);

create table if not exists processing_steps (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  number text default '', title text not null, summary text default '', description text default '',
  icon text default 'circle', media_url text default '', media_type text default 'image',
  translations jsonb not null default '{}'
);

create table if not exists technologies (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null, description text default '', icon text default 'cog', media_url text default '', media_type text default 'image',
  translations jsonb not null default '{}'
);

create table if not exists quality_checks (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null, description text default '', icon text default 'check',
  translations jsonb not null default '{}'
);

create table if not exists certifications (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null, kind text not null default 'certification' check (kind in ('certification', 'standard')),
  issuer text default '', certificate_number text default '', valid_until text default '', image_url text default '', document_url text default ''
);

create table if not exists trust_items (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  kind text not null check (kind in ('registration', 'export-document', 'buyer-logo', 'award', 'membership', 'association')),
  title text not null, description text default '', image_url text default '', url text default ''
);

create table if not exists export_countries (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null, region text default '', lat double precision not null default 0, lng double precision not null default 0,
  port text default '', is_major_market boolean not null default false, note text default '', is_placeholder boolean not null default false
);

create table if not exists export_routes (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null, origin_port text default '', origin_lat double precision default 0, origin_lng double precision default 0,
  destination_port text default '', destination_lat double precision default 0, destination_lng double precision default 0,
  mode text default 'sea' check (mode in ('sea', 'air', 'land')), transit_note text default ''
);

create table if not exists export_steps (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  number text default '', title text not null, description text default '', icon text default 'circle',
  translations jsonb not null default '{}'
);

create table if not exists factory_media (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text default '', description text default '',
  category text not null default 'rice-mill' check (category in ('rice-mill', 'processing-plant', 'machinery', 'storage', 'warehouse', 'packaging', 'laboratory', 'loading', 'container')),
  type text not null default 'image' check (type in ('image', 'video')),
  url text not null, poster_url text default '', provider text default 'mp4' check (provider in ('mp4', 'youtube', 'vimeo'))
);

create table if not exists videos (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null, description text default '', category text default '',
  provider text not null default 'youtube' check (provider in ('mp4', 'youtube', 'vimeo')),
  url text not null, poster_url text default '', duration text default '', featured boolean not null default false
);

create table if not exists kitchen_videos (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null, tag text default '', description text default '',
  video_url text not null, video_hd_url text default '', poster_url text default ''
);

create table if not exists packaging (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  name text not null, pack_type text not null default 'consumer' check (pack_type in ('consumer', 'bulk', 'export', 'custom')),
  description text default '', sizes text default '', material text default '', private_label text default '', moq text default '', image_url text default ''
);

create table if not exists testimonials (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  customer_name text not null, company text default '', country text default '', image_url text default '', quote text not null
);

create table if not exists partner_reasons (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  title text not null, description text default '', icon text default 'check',
  translations jsonb not null default '{}'
);

create table if not exists social_links (
  id text primary key default gen_random_uuid()::text,
  sort_order int not null default 0,
  published boolean not null default false,
  platform text not null, url text not null
);

-- ─── Leads ──────────────────────────────────────────────────────────────
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null,
  company text default '',
  country text not null,
  email text not null,
  phone text default '',
  product text default '',
  quantity text not null,
  packaging text default '',
  message text default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'negotiation', 'won', 'lost', 'spam')),
  notes text default '',
  locale text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists inquiries_created_idx on inquiries (created_at desc);
create index if not exists inquiries_status_idx on inquiries (status);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text default '',
  subject text default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- ─── Row-level security ─────────────────────────────────────────────────
-- Public (anon) visitors: read published content only.
-- editor/admin: manage content.  sales/admin: manage leads.
-- Public inquiry/contact inserts go through the server API with the service role (rate-limited, validated).
do $$
declare t text;
begin
  foreach t in array array['products','processing_steps','technologies','quality_checks','certifications','trust_items','export_countries','export_routes','export_steps','factory_media','videos','kitchen_videos','packaging','testimonials','partner_reasons','social_links']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read published" on %I', t);
    execute format('create policy "public read published" on %I for select using (published or admin_role() in (''admin'',''editor''))', t);
    execute format('drop policy if exists "editors write" on %I', t);
    execute format('create policy "editors write" on %I for all using (admin_role() in (''admin'',''editor'')) with check (admin_role() in (''admin'',''editor''))', t);
  end loop;
end $$;

alter table product_images enable row level security;
alter table product_videos enable row level security;
create policy "public read" on product_images for select using (true);
create policy "public read" on product_videos for select using (true);
create policy "editors write" on product_images for all using (admin_role() in ('admin', 'editor')) with check (admin_role() in ('admin', 'editor'));
create policy "editors write" on product_videos for all using (admin_role() in ('admin', 'editor')) with check (admin_role() in ('admin', 'editor'));

alter table companies enable row level security;
alter table site_settings enable row level security;
create policy "public read" on companies for select using (true);
create policy "public read" on site_settings for select using (true);
create policy "admins write" on companies for all using (admin_role() = 'admin') with check (admin_role() = 'admin');
create policy "admins write" on site_settings for all using (admin_role() = 'admin') with check (admin_role() = 'admin');

alter table inquiries enable row level security;
alter table contact_messages enable row level security;
create policy "sales read" on inquiries for select using (admin_role() in ('admin', 'sales'));
create policy "sales update" on inquiries for update using (admin_role() in ('admin', 'sales')) with check (admin_role() in ('admin', 'sales'));
create policy "admin delete" on inquiries for delete using (admin_role() = 'admin');
create policy "sales read" on contact_messages for select using (admin_role() in ('admin', 'sales'));
create policy "sales update" on contact_messages for update using (admin_role() in ('admin', 'sales')) with check (admin_role() in ('admin', 'sales'));
create policy "admin delete" on contact_messages for delete using (admin_role() = 'admin');

-- ─── Storage bucket for media ───────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','image/gif','application/pdf','video/mp4','video/webm'])
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "editors upload media" on storage.objects for insert with check (bucket_id = 'media' and admin_role() in ('admin', 'editor'));
create policy "editors delete media" on storage.objects for delete using (bucket_id = 'media' and admin_role() in ('admin', 'editor'));

-- ─── First admin ────────────────────────────────────────────────────────
-- After creating a user in Authentication → Users, grant access:
--   insert into admin_users (user_id, role) values ('<auth-user-uuid>', 'admin');
