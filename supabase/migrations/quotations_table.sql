-- ============================================================
-- Quotations Table Migration
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number  TEXT UNIQUE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('draft', 'pending', 'approved', 'factory', 'exported')),

  -- Customer Data
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT,
  company_name      TEXT,
  delivery_address  TEXT,
  country           TEXT,
  notes             TEXT,

  -- Order Data (full cart snapshot)
  items             JSONB NOT NULL DEFAULT '[]',
  total_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'EUR',

  -- Admin workflow
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  valid_until       TIMESTAMPTZ,
  requested_date    TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate quotation numbers: Q-100001, Q-100002, etc.
CREATE SEQUENCE IF NOT EXISTS quotation_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_number IS NULL OR NEW.quotation_number = '' THEN
    NEW.quotation_number := 'Q-' || nextval('quotation_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quotation_number ON public.quotations;
CREATE TRIGGER set_quotation_number
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION generate_quotation_number();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotations_updated_at ON public.quotations;
CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Public can INSERT (for web submissions), only authenticated admin can SELECT/UPDATE
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quotation"
  ON public.quotations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view quotations"
  ON public.quotations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quotations"
  ON public.quotations FOR UPDATE
  USING (auth.role() = 'authenticated');
