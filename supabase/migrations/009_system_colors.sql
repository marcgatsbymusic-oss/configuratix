-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 009_system_colors.sql
-- ============================================================

-- ─── System Colors ───────────────────────────────────────────
CREATE TABLE public.supplier_system_colors (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> System Colors ───────────
CREATE TABLE public.supplier_product_system_colors (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  system_color_code TEXT REFERENCES public.supplier_system_colors(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, system_color_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_system_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_system_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_system_colors FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_system_colors FOR SELECT USING (TRUE);

-- ─── Insert System Colors From Image ─────────────────────────
INSERT INTO public.supplier_system_colors (code, description) VALUES
('W-W', 'OUT: White / IN: White'),
('DEK-W', 'OUT: decor / IN: White'),
('W-DEK', 'OUT: White / IN: Decor'),
('DEK-DEK', 'OUT: Decor / IN: Decor')
ON CONFLICT (code) DO NOTHING;

-- ─── Link System Colors to PVC Profiles ──────────────────────
-- Safely linking to the known PVC product families extracted earlier:
-- Iglo 5, Iglo Energy, Iglo Edge, Iglo Light, Iglo EXT, Iglo Premier, Ideal Neo, Ideal 7000
INSERT INTO public.supplier_product_system_colors (product_code, system_color_code)
SELECT p.code, c.code
FROM public.supplier_products p
CROSS JOIN public.supplier_system_colors c
WHERE p.code IN (
  'IG5', 'IG5CL', 'IG5R', 'IG5CLR', 'IG5A', 'IG5CLA',
  'IGE', 'IGEAC', 'IGECL', 'IGER', 'IGECLR', 'IGEA', 'IGEAAC', 'IGEACL', 'IGEDGE',
  'IGAC HS', 'IGL', 'IGLR', 'IGLA', 'IG EXT', 'IG EXTR', 'IGPR', 'IGPRR',
  'IG HS', 'IG SL', 'IGEDGE S',
  'N76A', 'N76M', 'N76MR', 'N76MM', 'I7NL'
)
ON CONFLICT (product_code, system_color_code) DO NOTHING;
