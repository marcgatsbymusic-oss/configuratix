-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 010_pvc_colors.sql
-- ============================================================

-- ─── Exterior Colors ─────────────────────────────────────────
CREATE TABLE public.supplier_exterior_colors (
  code TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  description_1 TEXT NOT NULL,
  description_2 TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Interior Colors ─────────────────────────────────────────
CREATE TABLE public.supplier_interior_colors (
  code TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  description_1 TEXT NOT NULL,
  description_2 TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junctions: Supplier Products <-> Colors ─────────────────
CREATE TABLE public.supplier_product_exterior_colors (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  exterior_color_code TEXT REFERENCES public.supplier_exterior_colors(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, exterior_color_code)
);

CREATE TABLE public.supplier_product_interior_colors (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  interior_color_code TEXT REFERENCES public.supplier_interior_colors(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, interior_color_code)
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.supplier_exterior_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_interior_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_exterior_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_interior_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_exterior_colors FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_interior_colors FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_exterior_colors FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_interior_colors FOR SELECT USING (TRUE);

-- ─── Inserts ─────────────────────────────────────────────────
INSERT INTO public.supplier_exterior_colors (code, group_name, description_1, description_2, image_url) VALUES
('0002', 'Group 1', 'Chocolate brown', 'REN. 887505-167
0003,Dark - oak,REN. 2052089-167
0004,Mahogany,REN. 2097013-167
0005,Anthracite,REN. 701605-167
0006,Golden oak,REN. 2178001-167
0007,Nut,REN. 2178007-167
0008,Macore,REN. 3162002-167
0013,CREAMY,REN. 137905-167
0014,Gray,REN. 715505-167
0024,Quartz grey,REN. 703905-167
0026,Winchester XA,REN. 49240015-148
0027,Quartz grey (smooth),REN. 703905-097
0030,Light grey,REN. 725105-167
0031,FX white,REN. 915205-168
0035,Smooth anthracite,REN. 701605-097
0041,Sheffield Oak Light (Whitened oak),REN. F456-3081
0052,Black ulti-matt,REN. 02.20.01.000002-504700-047
0053,Anthracite ulti-matt,REN. 02.20.71.000001-504700-047
0054,Turner oak,REN. F470-3001
0057,Jet Black Mattex CC+,REN. 476-6062', '/assets/windowcolors/textures/braz-czekoladowy.jpg'),
('0009', 'Group 2', 'Oregon', 'REN. 2115008-167
0011,Douglas,REN. 3152009-167
0012,Natural oak,REN. 3118076-167
0015,Palisander,REN. 851805-167
0016,Brillant blue,REN. 1500705
0019,Dark - green,REN. 612505-167
0020,Moss green,REN. 600505-167
0021,Dark - red,REN. 308105-167
0025,Steel blue,REN. 515005-167
0029,Basalt grey,REN. 701205-167
0034,Smooth basalt grey,REN. 701205-097
0038,Concrete grey,REN. 702305-167
0046,Crown Platinum,REN. 9.1293001-195
0047,Iron glimmer slate,REN. (DB703) 1.0065002-097
0048,Slate grey smooth,REN. (7015) 02.11.71.000040-097
0058,White Sand Ulti-Matt,REN. PX 9152
0059,Graphite sandblasted matt,REN. 436-6023
0060,Turner Oak Toffee,REN. 470-3004
0061,Turner Oak Walnut,REN. 470-9036
0062,Shine Deep Bronze Mattex,REN. 470-1029', '/assets/windowcolors/textures/oregon_kk.jpg'),
('0045', 'Group 3', 'Pyrite', 'REN. 02.12.17.000001-195', '/assets/windowcolors/textures/piryt.jpg')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.supplier_interior_colors (code, group_name, description_1, description_2, image_url) VALUES
('0002', 'Group 1', 'Chocolate brown', 'REN. 887505-167
0003,Dark - oak,REN. 2052089-167
0004,Mahogany,REN. 2097013-167
0005,Anthracite,REN. 701605-167
0006,Golden oak,REN. 2178001-167
0007,Nut,REN. 2178007-167
0008,Macore,REN. 3162002-167
0013,CREAMY,REN. 137905-167
0014,Gray,REN. 715505-167
0024,Quartz grey,REN. 703905-167
0026,Winchester XA,REN. 49240015-148
0027,Quartz grey (smooth),REN. 703905-097
0030,Light grey,REN. 725105-167
0031,FX white,REN. 915205-168
0035,Smooth anthracite,REN. 701605-097
0041,Sheffield Oak Light (Whitened oak),REN. F456-3081
0052,Black ulti-matt,REN. 02.20.01.000002-504700-047
0053,Anthracite ulti-matt,REN. 02.20.71.000001-504700-047
0054,Turner oak,REN. F470-3001
0057,Jet Black Mattex CC+,REN. 476-6062', '/assets/windowcolors/textures/braz-czekoladowy.jpg'),
('0009', 'Group 2', 'Oregon', 'REN. 2115008-167
0011,Douglas,REN. 3152009-167
0012,Natural oak,REN. 3118076-167
0015,Palisander,REN. 851805-167
0016,Brillant blue,REN. 1500705
0019,Dark - green,REN. 612505-167
0020,Moss green,REN. 600505-167
0021,Dark - red,REN. 308105-167
0025,Steel blue,REN. 515005-167
0029,Basalt grey,REN. 701205-167
0034,Smooth basalt grey,REN. 701205-097
0038,Concrete grey,REN. 702305-167
0046,Crown Platinum,REN. 9.1293001-195
0047,Iron glimmer slate,REN. (DB703) 1.0065002-097
0048,Slate grey smooth,REN. (7015) 02.11.71.000040-097
0058,White Sand Ulti-Matt,REN. PX 9152
0059,Graphite sandblasted matt,REN. 436-6023
0060,Turner Oak Toffee,REN. 470-3004
0061,Turner Oak Walnut,REN. 470-9036
0062,Shine Deep Bronze Mattex,REN. 470-1029', '/assets/windowcolors/textures/oregon_kk.jpg'),
('0045', 'Group 3', 'Pyrite', 'REN. 02.12.17.000001-195', '/assets/windowcolors/textures/piryt.jpg')
ON CONFLICT (code) DO NOTHING;

-- ─── Link to PVC Products ────────────────────────────────────
-- PVC products typically begin with IG5, IGE, IGL, IG, N76, I7NL in our supplier list
INSERT INTO public.supplier_product_exterior_colors (product_code, exterior_color_code)
SELECT p.code, c.code
FROM public.supplier_products p
CROSS JOIN public.supplier_exterior_colors c
WHERE p.code IN (
  'IG5', 'IG5CL', 'IG5R', 'IG5CLR', 'IG5A', 'IG5CLA',
  'IGE', 'IGEAC', 'IGECL', 'IGER', 'IGECLR', 'IGEA', 'IGEAAC', 'IGEACL', 'IGEDGE',
  'IGAC HS', 'IGL', 'IGLR', 'IGLA', 'IG EXT', 'IG EXTR', 'IGPR', 'IGPRR',
  'IG HS', 'IG SL', 'IGEDGE S',
  'N76A', 'N76M', 'N76MR', 'N76MM', 'I7NL'
)
ON CONFLICT (product_code, exterior_color_code) DO NOTHING;

INSERT INTO public.supplier_product_interior_colors (product_code, interior_color_code)
SELECT p.code, c.code
FROM public.supplier_products p
CROSS JOIN public.supplier_interior_colors c
WHERE p.code IN (
  'IG5', 'IG5CL', 'IG5R', 'IG5CLR', 'IG5A', 'IG5CLA',
  'IGE', 'IGEAC', 'IGECL', 'IGER', 'IGECLR', 'IGEA', 'IGEAAC', 'IGEACL', 'IGEDGE',
  'IGAC HS', 'IGL', 'IGLR', 'IGLA', 'IG EXT', 'IG EXTR', 'IGPR', 'IGPRR',
  'IG HS', 'IG SL', 'IGEDGE S',
  'N76A', 'N76M', 'N76MR', 'N76MM', 'I7NL'
)
ON CONFLICT (product_code, interior_color_code) DO NOTHING;
