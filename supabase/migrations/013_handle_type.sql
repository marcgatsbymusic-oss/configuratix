-- ============================================================
-- Supplier Catalog & Mapping
-- Migration: 013_handle_type.sql
-- ============================================================

-- ─── Handle Type ─────────────────────────────────────────────
CREATE TABLE public.supplier_handle_type (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  image_url TEXT, -- Rendered 3D thumbnail or photo
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction: Supplier Products <-> Handle Type ─────────────
CREATE TABLE public.supplier_product_handle_type (
  product_code TEXT REFERENCES public.supplier_products(code) ON DELETE CASCADE,
  handle_type_code TEXT REFERENCES public.supplier_handle_type(code) ON DELETE CASCADE,
  PRIMARY KEY (product_code, handle_type_code)
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.supplier_handle_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_product_handle_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_read" ON public.supplier_handle_type FOR SELECT USING (TRUE);
CREATE POLICY "catalog_read" ON public.supplier_product_handle_type FOR SELECT USING (TRUE);

-- ─── Insert Handle Types ─────────────────────────────────────
INSERT INTO public.supplier_handle_type (code, description) VALUES
('-', 'No holes for spindle and mounting screws'),
('ALU_A', 'Aluminum handle I5 / IL (FKS model 1006)'),
('ALU_AK', 'Aluminum handle I5 / IL with key (FKS model 1006A)'),
('ALU_AP', 'Aluminum handle I5 with a button (FKS model 1006D)'),
('Atlanta', 'Hoppe handle Secustic Atlanta'),
('Kwadrat', 'Aluminium handle Square'),
('KwadratK', 'Aluminium handle Square with key'),
('Mistral', 'Aluminium handle Mistral'),
('MistralK', 'Aluminium handle Mistral with key'),
('AtlantaK', 'Hoppe handle Secustic Atlanta with key'),
('AtlantaP', 'Hoppe handle Secustic Atlanta with button'),
('Toulon', 'Hoppe handle Secustic Toulon'),
('ToulonSF', 'Hoppe handle Secuforte Toulon'),
('Hamburg', 'Hoppe handle Secustic Hamburg'),
('HamburgSF', 'Hoppe handle Secuforte Hamburg'),
('Tokyo', 'Hoppe Tokyo handle + KISI (child safety lock)'),
('ALU_B', 'Aluminium handle IE'),
('ALU_BK', 'Aluminum handle IE with key - (FKS model 1007A)'),
('Dublin', 'Aluminum handle DUBLIN'),
('DublinK', 'Aluminum handle DUBLIN with key'),
('DublinP', 'Aluminum handle DUBLIN with button'),
('ALUR', 'Flat window handle (roller shutter)'),
('ATESTK', 'Window handle with key - ATEST'),
('ALUW', 'Aluminum pull handle "conductor"'),
('MA_1010', 'MA 1010 stainless steel window handle')
ON CONFLICT (code) DO NOTHING;

-- ─── Link to ALL Window Product Codes ────────────────────────
-- Handle types apply to windows
INSERT INTO public.supplier_product_handle_type (product_code, handle_type_code)
SELECT p.code, h.code
FROM public.supplier_products p
CROSS JOIN public.supplier_handle_type h
WHERE p.code NOT IN (
  'ROL', 'CAS', 'MKT', 'MKT_CR', 'MKT_TZ', 'MKTFS', 'MKTO', 'MKTR', 'ZAL', 'ZAL WEW', 'BS', 'BRG'
)
ON CONFLICT (product_code, handle_type_code) DO NOTHING;
