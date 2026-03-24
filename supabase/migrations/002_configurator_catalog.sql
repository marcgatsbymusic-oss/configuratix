-- ============================================================
-- Configurator Catalog Schema
-- Migration: 002_configurator_catalog.sql
-- ============================================================

-- ─── Product Categories ───────────────────────────────────────
-- Top-level entrypoint: Windows, Front Doors, Sliding Doors, etc.
CREATE TABLE public.product_categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       TEXT        NOT NULL UNIQUE,
  label      TEXT        NOT NULL,
  icon_url   TEXT,
  sort_order SMALLINT    NOT NULL DEFAULT 0
);

-- ─── Profile Systems ─────────────────────────────────────────
-- e.g. "Drutex Iglo Edge 5" (PVC), "MB-86N" (ALU)
CREATE TABLE public.profile_systems (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id    UUID        REFERENCES public.product_categories(id) ON DELETE SET NULL,
  slug           TEXT        NOT NULL UNIQUE,
  name           TEXT        NOT NULL,
  material       TEXT        NOT NULL CHECK (material IN ('pvc','aluminum','wood','wood-aluminum')),
  depth_mm       SMALLINT,                    -- Frame depth in mm
  uw_value       NUMERIC(4,2),               -- U-value W/(m²K)
  description    TEXT,
  image_url      TEXT,
  allowed_types  TEXT[]      DEFAULT '{}',   -- window / door / terrace
  sort_order     SMALLINT    NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ─── Window Types ────────────────────────────────────────────
-- Sash configurations: 1-leaf fixed, 2-leaf tilt-turn, etc.
CREATE TABLE public.window_types (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug               TEXT        NOT NULL UNIQUE,
  label              TEXT        NOT NULL,
  product_category   TEXT        NOT NULL DEFAULT 'window', -- window | door
  sash_count         SMALLINT    NOT NULL DEFAULT 1,
  opening_type       TEXT        NOT NULL DEFAULT 'fixed',  -- fixed | tilt | turn | tilt-turn | sliding
  svg_template       TEXT,                   -- SVG string or key for renderer
  allowed_materials  TEXT[]      DEFAULT '{}', -- ['pvc','aluminum',…]
  sort_order         SMALLINT    NOT NULL DEFAULT 0,
  is_active          BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ─── Options ────────────────────────────────────────────────
-- Generic option rows. 'group' drives which UI section renders them.
-- e.g. group='glazing', key='triple', label='Triple glazing (3-fach)'
CREATE TABLE public.options (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name   TEXT        NOT NULL,   -- e.g. 'glazing' | 'color_exterior' | 'hardware' | 'security'
  key          TEXT        NOT NULL,
  label        TEXT        NOT NULL,
  description  TEXT,
  icon_url     TEXT,
  value_json   JSONB       NOT NULL DEFAULT '{}', -- extra metadata (ral_hex, u_value_delta, db_rating, …)
  sort_order   SMALLINT    NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  -- which profile materials support this option (empty = all)
  allowed_materials TEXT[] DEFAULT '{}',
  UNIQUE(group_name, key)
);

-- ─── Constraints ─────────────────────────────────────────────
-- Min/max dimensions per (profile_system × window_type) pair
CREATE TABLE public.constraints (
  id                UUID     DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_system_id UUID     REFERENCES public.profile_systems(id) ON DELETE CASCADE,
  window_type_id    UUID     REFERENCES public.window_types(id)    ON DELETE CASCADE,
  min_width_mm      SMALLINT NOT NULL DEFAULT 400,
  max_width_mm      SMALLINT NOT NULL DEFAULT 3000,
  min_height_mm     SMALLINT NOT NULL DEFAULT 400,
  max_height_mm     SMALLINT NOT NULL DEFAULT 2500,
  max_area_m2       NUMERIC(5,2),   -- optional hard cap (structural limit)
  UNIQUE(profile_system_id, window_type_id)
);

-- ─── Pricing Rules ───────────────────────────────────────────
-- Server-side pricing: base rate + deltas per option selection
CREATE TABLE public.pricing_rules (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_system_id UUID        REFERENCES public.profile_systems(id) ON DELETE CASCADE,
  -- if both group_name and option_key are NULL → this is the base area rate
  group_name        TEXT,               -- matches options.group_name
  option_key        TEXT,               -- matches options.key
  -- exactly one of the two pricing modes should be set:
  price_delta_eur   NUMERIC(10,2),      -- flat add-on per unit (e.g. +50 for RC2 lock)
  price_per_m2_eur  NUMERIC(10,2),      -- area-based rate (used for base price row)
  UNIQUE(profile_system_id, group_name, option_key)
);

-- ─── Configurations ──────────────────────────────────────────
-- Anonymous or logged-in user build saves
CREATE TABLE public.configurations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        TEXT        NOT NULL,    -- anonymous session identifier
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  product_category  TEXT        NOT NULL DEFAULT 'window',
  profile_system_id UUID        REFERENCES public.profile_systems(id) ON DELETE SET NULL,
  window_type_id    UUID        REFERENCES public.window_types(id)    ON DELETE SET NULL,
  width_mm          SMALLINT    NOT NULL,
  height_mm         SMALLINT    NOT NULL,
  options_json      JSONB       NOT NULL DEFAULT '{}', -- { glazing: 'triple', color_exterior: 'ral9016', … }
  total_price_eur   NUMERIC(10,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Quote Requests ──────────────────────────────────────────
CREATE TABLE public.quote_requests (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id UUID        REFERENCES public.configurations(id) ON DELETE SET NULL,
  name             TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  phone            TEXT,
  message          TEXT,
  status           TEXT        NOT NULL DEFAULT 'new', -- new | read | replied
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_profile_systems_material      ON public.profile_systems(material);
CREATE INDEX idx_profile_systems_category      ON public.profile_systems(category_id);
CREATE INDEX idx_window_types_category         ON public.window_types(product_category);
CREATE INDEX idx_options_group                 ON public.options(group_name);
CREATE INDEX idx_constraints_profile_window    ON public.constraints(profile_system_id, window_type_id);
CREATE INDEX idx_pricing_rules_profile         ON public.pricing_rules(profile_system_id);
CREATE INDEX idx_configurations_session        ON public.configurations(session_id);
CREATE INDEX idx_configurations_created        ON public.configurations(created_at DESC);
CREATE INDEX idx_quote_requests_created        ON public.quote_requests(created_at DESC);
CREATE INDEX idx_quote_requests_status         ON public.quote_requests(status);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.product_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_systems     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.window_types        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests      ENABLE ROW LEVEL SECURITY;

-- Catalog tables: public read-only
CREATE POLICY "catalog_read" ON public.product_categories  FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.profile_systems     FOR SELECT USING (is_active = TRUE);
CREATE POLICY "catalog_read" ON public.window_types        FOR SELECT USING (is_active = TRUE);
CREATE POLICY "catalog_read" ON public.options             FOR SELECT USING (is_active = TRUE);
CREATE POLICY "catalog_read" ON public.constraints         FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.pricing_rules       FOR SELECT USING (TRUE);

-- Configurations: anyone can insert (anonymous session), owner can read
CREATE POLICY "config_insert" ON public.configurations
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "config_select_own" ON public.configurations
  FOR SELECT USING (
    session_id = current_setting('app.session_id', TRUE)
    OR auth.uid() = user_id
  );

-- Quote requests: anyone can insert (linked to a config), no public read
CREATE POLICY "quote_insert" ON public.quote_requests
  FOR INSERT WITH CHECK (TRUE);
