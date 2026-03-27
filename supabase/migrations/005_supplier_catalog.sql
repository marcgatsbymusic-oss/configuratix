-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 005_supplier_catalog.sql
-- ============================================================

-- ─── Supplier Products ───────────────────────────────────────
CREATE TABLE public.supplier_products (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Supplier Glazing ────────────────────────────────────────
CREATE TABLE public.supplier_glazing (
  filling TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Glazing ─────────────────
CREATE TABLE public.supplier_product_glazing (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  glazing_filling TEXT REFERENCES public.supplier_glazing(filling) ON DELETE CASCADE,
  PRIMARY KEY (product_code, glazing_filling)
);

-- ─── Configurator Mapping ────────────────────────────────────
CREATE TABLE public.supplier_profile_mapping (
  configurator_profile_id TEXT PRIMARY KEY, -- The string ID used in frontend UI state (e.g. 'iglo5')
  supplier_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_glazing         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_glazing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profile_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_products        FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_glazing         FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_glazing FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_profile_mapping FOR SELECT USING (TRUE);

-- ─── Insert Supplier Products ────────────────────────────────
INSERT INTO public.supplier_products (code, name) VALUES
-- Image 1
('IG5', 'IGLO 5'),
('IG5CL', 'IGLO 5 CLASSIC'),
('IG5R', 'IGLO 5 RENOVATIVE'),
('IG5CLR', 'IGLO 5 CLASSIC RENOVATIVE'),
('IG5A', 'IGLO 5 ADAPTATIVE'),
('IG5CLA', 'IGLO 5 CLASSIC ADAPTATIVE'),
('IGE', 'IGLO ENERGY'),
('IGEAC', 'IGLO ENERGY ALUCOVER'),
('IGECL', 'IGLO ENERGY CLASSIC'),
('IGER', 'IGLO ENERGY RENOVATIVE'),
('IGECLR', 'IGLO ENERGY CLASSIC renovation'),
('IGEA', 'IGLO ENERGY ADAPTATIVE'),
('IGEAAC', 'IGLO ENERGY ALUCOVER adaptive'),
('IGEACL', 'IGLO ENERGY CLASSIC ADAPTATIVE'),
('IGEDGE', 'IGLO EDGE'),
('IGAC HS', 'IGLO HS ALUCOVER'),
('IGL', 'IGLO LIGHT'),
('IGLR', 'IGLO LIGHT RENOVATIVE'),
('IGLA', 'IGLO LIGHT ADAPTATIVE'),
('IG EXT', 'IGLO EXT'),
('IG EXTR', 'IGLO EXT RENOVATIVE'),
('IGPR', 'IGLO PREMIER'),
('IGPRR', 'IGLO PREMIER RENOVATIVE'),
('IG HS', 'IGLO HS'),
('IG SL', 'IGLO SLIDE'),
('IGEDGE S', 'IGLO EDGE SLIDE'),
('N76A', 'IDEAL NEO 76 AD'),
('N76M', 'IDEAL NEO 76 MD'),
('N76MR', 'IDEAL NEO 76 MD RENOVATION'),
('N76MM', 'IDEAL NEO MD MONOBLOCK'),
('I7NL', 'IDEAL 7000 NL'),

-- Image 2
('MB77 HS', 'MB77 HS Hi'),
('MB77M H', 'MB77 HS Hi MONORAIL'),
('SG', 'SLIDE GLASS'),
('MB SL', 'MB SLIDE'),
('MB86HD', 'MB86 FOLD LINE HD (Bifold doors)'),
('MB45 A', 'MB45 AUTOMATICALLY SLIDED DOOR'),
('MB59S A', 'MB59S AUTOMATICALLY SLIDED DOOR'),
('MB79S A', 'MB79N Automatically slide doors'),
('MB60 3', 'MB60 EI30 (FIREPROOF JOINERY)'),
('MB78 3', 'MB78 EI30 (FIREPROOF WOODWORK)'),
('MB78 6', 'MB78 EI60 (FIREPROOF WOODWORK)'),
('BS', 'GLASS BALUSTRADE'),
('BRG', 'GARAGE DOORS'),

-- Image 3
('SL68', 'SOFTLINE 68'),
('SL78', 'SOFTLINE 78'),
('SL88', 'SOFTLINE 88'),
('SL68 HS', 'SOFTLINE 68 HS'),
('SL78 HS', 'SOFTLINE 78 HS'),
('SL88 HS', 'SOFTLINE 88 HS'),
('DL68', 'DUOLINE 68'),
('DL78', 'DUOLINE 78'),
('DL88', 'DUOLINE 88'),
('DL68 HS', 'DUOLINE 68 HS'),
('DL78 HS', 'DUOLINE 78 HS'),
('DL88 HS', 'DUOLINE88 HS'),
('ROL', 'Roller roller shutters'),
('CAS', 'CASSONETTO'),
('MKT', 'PLEATED INSECT SCREEN'),
('MKT_CR', 'ROLL-UP MOSQUITO NET CLICK-ROLL'),
('MKT_TZ', 'PLEATED INSECT SCREEN TOP-ZAG'),
('MKTFS', 'MOSQUITO FLEX-SCREEN'),
('MKTO', 'DOOR MOSQUITO NET'),
('MKTR', 'FRAME MOSQUITO NET'),
('ZAL', 'VENEER Roller roller shutters'),
('ZAL WEW', 'ŻALUZJE WEWNETRZNE'),
('MB45', 'MB45'),
('MB70', 'MB70'),
('MB79', 'MB79N SI+'),
('MB79A', 'MB79N ADAPTACJA'),
('MB79R', 'MB79N SI+ RENOWACYJNA'),
('MB86N', 'MB86N SI'),
('MB86NP', 'MB86N PIVOT DOOR'),
('CVP', 'COR VISION PLUS')
ON CONFLICT (code) DO NOTHING;

-- ─── Insert Supplier Glazing ─────────────────────────────────
INSERT INTO public.supplier_glazing (filling, description) VALUES
('2-18', 'Double-glazed 18mm'),
('2-20', 'Double-glazed 20mm'),
('2-22', 'Double-glazed 22mm'),
('2-24', 'Double-glazed 24mm'),
('2-26', 'Double-glazed 26mm'),
('2-28', 'Double-glazed 28mm'),
('2-30', 'Double-glazed 30mm'),
('2-32', 'Double-glazed 32mm'),
('2-34', 'Double-glazed 34mm'),
('2-36', 'Double-glazed 36mm'),
('2-38', 'Double-glazed 38mm'),
('2-40', 'Double-glazed 40mm'),
('3-24', 'Triple-glazed 24mm'),
('3-28', 'Triple-glazed 28mm'),
('3-30', 'Triple-glazed 30mm'),
('3-32', 'Triple-glazed 32mm'),
('3-34', 'Triple-glazed 34mm'),
('3-36', 'Triple-glazed 36mm'),
('3-38', 'Triple-glazed 38mm'),
('3-40', 'Triple-glazed 40mm'),
('3-42', 'Triple-glazed 42mm'),
('3-44', 'Triple-glazed 44mm'),
('3-46', 'Triple-glazed 44mm'),
('3-48', 'Triple-glazed 48mm'),
('3-50', 'Triple-glazed 50mm'),
('3-52', 'Triple-glazed 52mm')
ON CONFLICT (filling) DO NOTHING;

-- ─── Link Glazing to Requested Frames ────────────────────────
INSERT INTO public.supplier_product_glazing (product_code, glazing_filling)
SELECT p.code, g.filling
FROM public.supplier_products p
CROSS JOIN public.supplier_glazing g
WHERE p.code IN ('IG5', 'IG5CL', 'IG5R', 'IG5CLR', 'IG5A', 'IG5CLA')
ON CONFLICT (product_code, glazing_filling) DO NOTHING;

INSERT INTO public.supplier_product_glazing (product_code, glazing_filling)
SELECT p.code, g.filling
FROM public.supplier_products p
CROSS JOIN public.supplier_glazing g
WHERE p.code IN ('IGE', 'IGEAC', 'IGECL', 'IGER', 'IGECLR', 'IGEA', 'IGEAAC', 'IGEACL')
  AND g.filling IN ('2-24', '2-26', '2-28', '2-30', '2-32', '2-34', '2-36', '2-38', '2-40', '3-24', '3-28', '3-30', '3-32', '3-34', '3-36', '3-38', '3-40', '3-42', '3-44', '3-46', '3-48', '3-50', '3-52')
ON CONFLICT (product_code, glazing_filling) DO NOTHING;

-- ─── Insert Configurator Frontend Mappings ───────────────────
INSERT INTO public.supplier_profile_mapping (configurator_profile_id, supplier_code) VALUES
('iglo5', 'IG5'),
('iglo5classic', 'IG5CL'),
('iglolight', 'IGL'),
('igloenergy', 'IGE'),
('igloenergyclassic', 'IGECL'),
('igloedge', 'IGEDGE'),
('igloext', 'IG EXT'),
('iglopremier', 'IGPR'),
('igloenergyalucover', 'IGEAC'),
('softline68', 'SL68'),
('softline78', 'SL78'),
('softline88', 'SL88'),
('duoline68', 'DL68'),
('duoline78', 'DL78'),
('duoline88', 'DL88')
ON CONFLICT (configurator_profile_id) DO NOTHING;

-- ─── Insert Supplier Glazing (IGEDGE specifics) ──────────────
INSERT INTO public.supplier_glazing (filling, description) VALUES
('2-30.', 'Double-glazed 30mm'),
('2-32.', 'Double-glazed 32mm'),
('2-34.', 'Double-glazed 34mm'),
('2-36.', 'Double-glazed 36mm'),
('2-38.', 'Double-glazed 38mm'),
('3-30.', 'Triple-glazed 30mm'),
('3-32.', 'Triple-glazed 32mm'),
('3-34.', 'Triple-glazed 34mm'),
('3-36.', 'Triple-glazed 36mm'),
('3-38.', 'Triple-glazed 38mm'),
('3-40.', 'Triple-glazed 40mm'),
('3-42.', 'Triple-glazed 42mm'),
('3-44.', 'Triple-glazed 44mm'),
('3-46.', 'Triple-glazed 44mm'),
('3-48.', 'Triple-glazed 48mm'),
('3-50.', 'Triple-glazed 50mm'),
('3-52.', 'Triple-glazed 52mm'),
('3-54.', 'Triple-glazed 54mm'),
('3-56.', 'Triple-glazed 56mm'),
('3-58.', 'Triple-glazed 58mm'),
('4-58.', 'Quadruple-glazed 58mm')
ON CONFLICT (filling) DO NOTHING;

-- ─── Link Glazing to IGEDGE ──────────────────────────────────
INSERT INTO public.supplier_product_glazing (product_code, glazing_filling)
SELECT p.code, g.filling
FROM public.supplier_products p
CROSS JOIN public.supplier_glazing g
WHERE p.code IN ('IGEDGE')
  AND g.filling IN ('2-30.', '2-32.', '2-34.', '2-36.', '2-38.', '3-30.', '3-32.', '3-34.', '3-36.', '3-38.', '3-40.', '3-42.', '3-44.', '3-46.', '3-48.', '3-50.', '3-52.', '3-54.', '3-56.', '3-58.', '4-58.')
ON CONFLICT (product_code, glazing_filling) DO NOTHING;
