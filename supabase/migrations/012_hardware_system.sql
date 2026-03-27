-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 012_hardware_system.sql
-- ============================================================

-- ─── Hardware System ─────────────────────────────────────────
CREATE TABLE public.supplier_hardware_system (
  code TEXT PRIMARY KEY,
  description_1 TEXT NOT NULL,
  description_2 TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Hardware System ─────────
CREATE TABLE public.supplier_product_hardware_system (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  hardware_system_code TEXT REFERENCES public.supplier_hardware_system(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, hardware_system_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_hardware_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_hardware_system ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_hardware_system FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_hardware_system FOR SELECT USING (TRUE);

-- ─── Insert Hardware System Options ──────────────────────────
INSERT INTO public.supplier_hardware_system (code, description_1, description_2, image_url) VALUES
('MATIC', 'Maco Multi Matic', NULL, '/assets/options/hardware/matic.jpg'),
('POWER', 'Maco Multi Power (hidden hinges)', NULL, '/assets/options/hardware/power.jpg')
ON CONFLICT (code) DO NOTHING;

-- ─── Link to ALL Window Product Codes ────────────────────────
-- Hardware systems typically apply to windows
INSERT INTO public.supplier_product_hardware_system (product_code, hardware_system_code)
SELECT p.code, h.code
FROM public.supplier_products p
CROSS JOIN public.supplier_hardware_system h
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, hardware_system_code) DO NOTHING;
