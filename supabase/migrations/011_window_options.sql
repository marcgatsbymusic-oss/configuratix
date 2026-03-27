-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 011_window_options.sql
-- ============================================================

-- ─── Window Options ──────────────────────────────────────────
CREATE TABLE public.supplier_window_options (
  code TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT, -- Rendered 3D thumbnail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Window Options ──────────
CREATE TABLE public.supplier_product_window_options (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  window_option_code TEXT REFERENCES public.supplier_window_options(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, window_option_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_window_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_window_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_window_options FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_window_options FOR SELECT USING (TRUE);

-- ─── Insert Window Options ───────────────────────────────────
INSERT INTO public.supplier_window_options (code, category, description, image_url) VALUES
('STANDARD', 'Fitting safety class', 'Standard safety class of fittings', '/assets/options/safety/safety_standard_1774618050306.png'),
('4ZA', 'Fitting safety class', '4 anti-burglary catches', '/assets/options/safety/safety_4za_1774617734255.png'),
('MAX', 'Fitting safety class', 'Anti-burglary fittings (Max) DE2', '/assets/options/safety/safety_max_1774617805064.png'),
('RC2', 'Fitting safety class', 'RC2 window', '/assets/options/safety/safety_rc2_1774617883059.png'),
('RC2N', 'Fitting safety class', 'No glued-in pane RC2 window', '/assets/options/safety/safety_rc2n_1774617965615.png')
ON CONFLICT (code) DO NOTHING;

-- ─── Link Options to ALL Window Product Codes ────────────────
-- Links these window options to all existing supplier products
-- (excluding non-window accessories like shutters/nets)
INSERT INTO public.supplier_product_window_options (product_code, window_option_code)
SELECT p.code, o.code
FROM public.supplier_products p
CROSS JOIN public.supplier_window_options o
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, window_option_code) DO NOTHING;
