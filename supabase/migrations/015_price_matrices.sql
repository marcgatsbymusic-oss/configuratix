-- ============================================================
-- Price Matrices Setup
-- Migration: 015_price_matrices.sql
-- ============================================================

CREATE TABLE public.price_matrices (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_system_id UUID        REFERENCES public.profile_systems(id) ON DELETE CASCADE,
  window_type_id    UUID        REFERENCES public.window_types(id) ON DELETE CASCADE,
  width_mm          SMALLINT    NOT NULL,
  height_mm         SMALLINT    NOT NULL,
  price_eur         NUMERIC(10,2) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each matrix cell is unique per profile & window type
  UNIQUE(profile_system_id, window_type_id, width_mm, height_mm)
);

CREATE INDEX idx_price_matrices_search 
  ON public.price_matrices(profile_system_id, window_type_id, width_mm, height_mm);

-- RLS Policies
ALTER TABLE public.price_matrices ENABLE ROW LEVEL SECURITY;

-- Anyone can read price matrices (needed for config tool)
CREATE POLICY "price_matrices_read" ON public.price_matrices
  FOR SELECT USING (TRUE);

-- Only admins/partners should insert/update/delete.
-- For now we will allow all authenticated users (since admin roles aren't strictly defined yet)
CREATE POLICY "price_matrices_all" ON public.price_matrices
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Generate Dummy Pricing Data
-- ============================================================
-- For each valid combination of profile system and window type (defined in constraints),
-- generate widths and heights from 500mm to 2500mm in 100mm increments.
INSERT INTO public.price_matrices (profile_system_id, window_type_id, width_mm, height_mm, price_eur)
SELECT 
  c.profile_system_id,
  c.window_type_id,
  width_series.w AS width_mm,
  height_series.h AS height_mm,
  -- Dummy price calculation: Base + Area Factor + small variation
  round((200 + (width_series.w * height_series.h / 10000.0) * 1.5 + (random() * 20))::numeric, 2) AS price_eur
FROM public.constraints c
CROSS JOIN generate_series(500, 2500, 100) AS width_series(w)
CROSS JOIN generate_series(500, 2500, 100) AS height_series(h)
WHERE width_series.w >= c.min_width_mm AND width_series.w <= LEAST(c.max_width_mm, 2500)
  AND height_series.h >= c.min_height_mm AND height_series.h <= LEAST(c.max_height_mm, 2500)
ON CONFLICT DO NOTHING;
