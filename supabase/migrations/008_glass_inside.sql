-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 008_glass_inside.sql
-- ============================================================

-- ─── Inside Glazing (Glass Inside) ───────────────────────────
CREATE TABLE public.supplier_glass_inside (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  image_url TEXT, -- Field for possible image upload
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Glass Inside ────────────
CREATE TABLE public.supplier_product_glass_inside (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  glass_inside_code TEXT REFERENCES public.supplier_glass_inside(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, glass_inside_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_glass_inside ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_glass_inside ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_glass_inside FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_glass_inside FOR SELECT USING (TRUE);

-- ─── Insert Inside Glazing Options ───────────────────────────
INSERT INTO public.supplier_glass_inside (code, description) VALUES
('T4', 'Thermo 4mm'),
('T6', 'Thermo 6mm'),
('T8', 'Thermo 8mm'),
('T10', 'Thermo 10mm'),
('TA4', 'Thermo 44.4 anti-burglary - 9.5mm'),
('TA552', 'Thermo 55.2 anti-burglary - 10.76mm'),
('B1', 'Safe 33.1 - 6.4mm'),
('B2', 'Safe 33.2 - 6.8mm'),
('B4', '44.2 safety - 8.8mm'),
('B8.1', 'Safe 44.1 - 8.38mm'),
('M8.2', '44.2 safety matt foil - 8.76mm'),
('MB2', 'Matte Laminate ''Safe'' 33.2 - 6.8mm'),
('TB1', 'Thermo Safe 33.1 - 6.4mm'),
('TB2', 'Thermo Safe 33.2 - 6.8mm'),
('TB8.1', 'Thermo Safe 44.1 - 8.38mm'),
('TB4', 'Thermo 44.2 safety - 8.8mm'),
('A4', '44.4 anti-burglary - 9.5mm'),
('A5', 'Anti-burglary 44.6 - 10.3mm'),
('AB4H', 'Antisol Brąz ESG 4mm'),
('ANB', 'Antisol Brown 4mm'),
('ANS', 'Antisol Grey 4mm'),
('ANZ', 'Antisol Green 4mm'),
('AB6', 'Antisol Brown 6mm'),
('AS6', 'Antisol Gray 6mm'),
('AZ6', 'Antisol Green 6mm'),
('ADB6', 'Antisol Blue 6mm [Planibel Dark Blue]'),
('SAT4', 'Satinovo matte - 4mm'),
('SAT4H', 'Satinovo matte ESG - 4mm'),
('CG4', 'Clima Guard 1.0 - 4mm'),
('CG6', 'Clima Guard 1.0 - 6mm'),
('CG4H', 'Clima Guard 1.0 ESG - 4mm'),
('CG6H', 'Clima Guard 1.0 ESG - 6mm'),
('SR9', 'Sound Reduction 44.2 SR - 8.8mm'),
('TSR9', 'Thermo Sound Reduction 44.2 SR - 8.8mm'),
('LG8', 'LamiGlass ExtraClear 11 mm 4.4.8 PVB: Clear'),
('LG12', 'LamiGlass ExtraClear 15 mm 6.6.8 PVB: Clear'),
('H04', 'Thermo ESG 4mm'),
('H05', 'Thermo ESG 6mm'),
('H06', 'Thermo ESG 8mm'),
('T10H', 'Thermo ESG 10mm'),
('AS4H', 'Antisol Gray ESG 4mm'),
('AZ4H', 'Antisol Green ESG 4mm'),
('AB6H', 'Antisol Brąz ESG 6mm'),
('AS6H', 'Antisol Gray ESG 6mm'),
('AZ6H', 'Antisol Green ESG 6mm'),
('ADB6H', 'Antisol Blue ESG 6mm [Planibel Dark Blue]')
ON CONFLICT (code) DO NOTHING;

-- ─── Link to ALL Window Product Codes ────────────────────────
-- Links all inside glazing options to all existing supplier products
-- (excluding non-window accessories)
INSERT INTO public.supplier_product_glass_inside (product_code, glass_inside_code)
SELECT p.code, g.code
FROM public.supplier_products p
CROSS JOIN public.supplier_glass_inside g
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, glass_inside_code) DO NOTHING;
