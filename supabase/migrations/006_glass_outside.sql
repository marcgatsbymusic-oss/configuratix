-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 006_glass_outside.sql
-- ============================================================

-- ─── External Glazing (EXTGL) ────────────────────────────────
CREATE TABLE public.supplier_extgl (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  image_url TEXT, -- Field for possible image upload
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> EXTGL ───────────────────
CREATE TABLE public.supplier_product_extgl (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  extgl_code TEXT REFERENCES public.supplier_extgl(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, extgl_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_extgl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_extgl ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_extgl FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_extgl FOR SELECT USING (TRUE);

-- ─── Insert External Glazing Options ─────────────────────────
INSERT INTO public.supplier_extgl (code, description) VALUES
('FL4', 'Float 4mm'),
('FL6', 'Float 6mm'),
('FL8', 'Float 8mm'),
('FL10', 'Float 10mm'),
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
('RFB', 'Stopsol Brown 6mm'),
('RFN', 'Stopsol Blue 6mm'),
('SAT4', 'Satinovo matte - 4mm'),
('SAT4H', 'Satinovo matte ESG - 4mm'),
('SS6', 'Silverstar Selekt - 6mm'),
('BCL', 'Bioclean Cool-Lite SKN 176 - 6mm'),
('CG4', 'Clima Guard 1.0 - 4mm'),
('CG6', 'Clima Guard 1.0 - 6mm'),
('CG4H', 'Clima Guard 1.0 ESG - 4mm'),
('CG6H', 'Clima Guard 1.0 ESG - 6mm'),
('SR9', 'Sound Reduction 44.2 SR - 8.8mm'),
('TSR9', 'Thermo Sound Reduction 44.2 SR - 8.8mm'),
('SN63', 'SunGuard Super Neutral SN 63 - 6mm'),
('SG8', 'SunGuard SN 63 8mm'),
('SG8H', 'SunGuard SN 63 ESG 8mm'),
('SN51L', 'SunGuard SN 51 Lami 4.4.1 PVB - 8.4mm'),
('SGX4', 'SGG Cool-Lite Xtreme 61/29 - 4mm'),
('SGX6', 'SGG Cool-Lite Xtreme 61/29 - 6mm'),
('GS441', 'Guardian Sun laminate safe 4.4.1'),
('LG8', 'LamiGlass ExtraClear 11 mm 4.4.8 PVB: Clear'),
('S354', 'Guardian Sun 35 - 4mm'),
('LG12', 'LamiGlass ExtraClear 15 mm 6.6.8 PVB: Clear'),
('CLS4', 'Cool Lite SKN 176 - 4mm'),
('CLS4H', 'Cool Lite SKN 176 ESG - 4mm'),
('CLS6', 'Cool Lite SKN 176 - 6mm'),
('CLS6H', 'Cool Lite SKN 176 ESG - 6mm'),
('H01', 'Float ESG 4mm'),
('H02', 'Float ESG 6mm'),
('H03', 'Float ESG 8mm'),
('FL10H', 'Float ESG 10mm'),
('H04', 'Thermo ESG 4mm'),
('H05', 'Thermo ESG 6mm'),
('H06', 'Thermo ESG 8mm'),
('T10H', 'Thermo ESG 10mm'),
('AS4H', 'Antisol Gray ESG 4mm'),
('AZ4H', 'Antisol Green ESG 4mm'),
('AB6H', 'Antisol Brąz ESG 6mm'),
('AS6H', 'Antisol Gray ESG 6mm'),
('AZ6H', 'Antisol Green ESG 6mm'),
('ADB6H', 'Antisol Blue ESG 6mm [Planibel Dark Blue]'),
('RB6H', 'Stopsol Brown ESG 6mm'),
('RN6H', 'Stopsol Blue ESG 6mm'),
('SS6H', 'Silverstar Selekt ESG - 6mm'),
('MS4H', 'Mirastar ESG 4mm'),
('SGX4H', 'SGG Cool-Lite Xtreme 61/29 ESG - 4mm'),
('SGX6H', 'SGG Cool-Lite Xtreme 61/29 ESG - 6mm'),
('SN63H', 'SunGuard Super Neutral SN 63 ESG - 6mm'),
('S354H', 'Guardian Sun 35 ESG - 4mm')
ON CONFLICT (code) DO NOTHING;

-- ─── Link EXTGL to ALL Window Product Codes ──────────────────
-- Links all external glazing options to all existing supplier products
-- (accessories like ZAL WEW are excluded to keep it relevant to windows/doors)
INSERT INTO public.supplier_product_extgl (product_code, extgl_code)
SELECT p.code, e.code
FROM public.supplier_products p
CROSS JOIN public.supplier_extgl e
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, extgl_code) DO NOTHING;
