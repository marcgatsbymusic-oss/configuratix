-- ============================================================
-- Mammut – Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'partner');
  END IF;
END $$;

-- ─── Profiles ────────────────────────────────────────────────
-- Extends Supabase auth.users with role-based profile data
CREATE TABLE public.profiles (
  id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role             user_role   NOT NULL DEFAULT 'customer',
  full_name        TEXT,
  company_name     TEXT,         -- Partners only
  company_tax_id   TEXT,         -- Partners only (CIF / NIF)
  phone            TEXT,
  address          TEXT,
  country          TEXT        NOT NULL DEFAULT 'ES',
  partner_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Configurator Saves ──────────────────────────────────────
-- Stores 3D window/door configurator sessions per user
CREATE TABLE public.configurator_saves (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                TEXT        NOT NULL,                   -- User-defined save name
  product_line        TEXT        NOT NULL,                   -- e.g. 'iglo-edge', 'iglo-light'
  product_type        TEXT        NOT NULL,                   -- 'window' | 'door' | 'terrace'
  material            TEXT        NOT NULL,                   -- 'pvc' | 'aluminum' | 'wood'
  configuration       JSONB       NOT NULL,                   -- Full config: dimensions, color, glass, hardware
  screenshot_url      TEXT,                                   -- Hosted snapshot URL (Supabase Storage)
  is_quote_requested  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_configurator_saves_user_id ON public.configurator_saves(user_id);
CREATE INDEX idx_configurator_saves_created_at ON public.configurator_saves(created_at DESC);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurator_saves ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Configurator saves: full CRUD for own records only
CREATE POLICY "saves_select_own" ON public.configurator_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saves_insert_own" ON public.configurator_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saves_update_own" ON public.configurator_saves
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saves_delete_own" ON public.configurator_saves
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Auto-update timestamp trigger ───────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_saves_updated_at
  BEFORE UPDATE ON public.configurator_saves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Auto-create profile on user signup ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
