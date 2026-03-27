-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 007_glass_middle.sql
-- ============================================================

-- ─── Middle Glazing (Glass Middle) ───────────────────────────
CREATE TABLE public.supplier_glass_middle (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  image_url TEXT, -- Field for possible image upload
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Glass Middle ────────────
CREATE TABLE public.supplier_product_glass_middle (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  glass_middle_code TEXT REFERENCES public.supplier_glass_middle(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, glass_middle_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_glass_middle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_glass_middle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_glass_middle FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_glass_middle FOR SELECT USING (TRUE);

-- ─── Insert Middle Glazing Options ───────────────────────────
INSERT INTO public.supplier_glass_middle (code, description) VALUES
('FL4', 'Float 4mm'),
('FL6', 'Float 6mm'),
('FL8', 'Float 8mm'),
('FL10', 'Float 10mm'),
('B1', 'Safe 33.1 - 6.4mm'),
('B2', 'Safe 33.2 - 6.8mm'),
('B4', '44.2 safety - 8.8mm'),
('B8.1', 'Safe 44.1 - 8.38mm'),
('M8.2', '44.2 safety matt foil - 8.76mm'),
('MB2', 'Matte Laminate ''Safe'' 33.2 - 6.8mm'),
('A4', '44.4 anti-burglary - 9.5mm'),
('A5', 'Anti-burglary 44.6 - 10.3mm'),
('AB4H', 'Antisol Brąz ESG 4mm'),
('OCH', 'Ornament Chinchila 101 - 4mm'),
('OCA', 'Ornament Catedral 109 - 4mm'),
('ODT', 'Ornament Delta 121 - 4mm'),
('OPR', 'Ornament Deszczyk (Waterfall) 105 - 4mm'),
('OSI', 'Ornament Silvit 118 - 4mm'),
('OMC', 'Ornament Master Carre 4mm'),
('SAT4', 'Satinovo matte - 4mm'),
('SAT4H', 'Satinovo matte ESG - 4mm'),
('SR9', 'Sound Reduction 44.2 SR - 8.8mm'),
('H01', 'Float ESG 4mm'),
('H02', 'Float ESG 6mm'),
('H03', 'Float ESG 8mm'),
('FL10H', 'Float ESG 10mm'),
('H04', 'Thermo ESG 4mm'),
('H05', 'Thermo ESG 6mm'),
('H06', 'Thermo ESG 8mm'),
('AS4H', 'Antisol Gray ESG 4mm'),
('AZ4H', 'Antisol Green ESG 4mm'),
('AB6H', 'Antisol Brąz ESG 6mm'),
('AS6H', 'Antisol Gray ESG 6mm'),
('AZ6H', 'Antisol Green ESG 6mm'),
('ADB6H', 'Antisol Blue ESG 6mm [Planibel Dark Blue]'),
('RB6H', 'Stopsol Brown ESG 6mm'),
('RN6H', 'Stopsol Blue ESG 6mm'),
('MS4H', 'Mirastar ESG 4mm')
ON CONFLICT (code) DO NOTHING;

-- ─── Link Glass Middle to ALL Window Product Codes ───────────
-- Links all middle glazing options to all existing supplier products
-- (excluding accessories)
INSERT INTO public.supplier_product_glass_middle (product_code, glass_middle_code)
SELECT p.code, g.code
FROM public.supplier_products p
CROSS JOIN public.supplier_glass_middle g
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, glass_middle_code) DO NOTHING;
