-- ============================================================
-- Configurator Seed Data
-- Migration: 003_configurator_seed.sql
-- ============================================================

-- ─── Product Categories ──────────────────────────────────────
INSERT INTO public.product_categories (slug, label, sort_order) VALUES
  ('window',       'Windows',       0),
  ('front-door',   'Front Doors',   1),
  ('sliding-door', 'Sliding Doors', 2),
  ('french-door',  'French Doors',  3);

-- ─── Profile Systems ─────────────────────────────────────────
-- PVC profiles
INSERT INTO public.profile_systems (slug, name, material, depth_mm, uw_value, description, allowed_types, sort_order) VALUES
  ('iglo-edge-5', 'Iglo Edge 5',   'pvc', 70, 1.20, '5-chamber PVC profile, industry standard', ARRAY['window','door'], 0),
  ('iglo-light',  'Iglo Light',    'pvc', 60, 1.30, 'Slim sightline PVC, maximises glass area',  ARRAY['window'],        1),
  ('iglo-star-8', 'Iglo Star 8',   'pvc', 82, 0.95, '8-chamber passive-house PVC profile',       ARRAY['window','door'], 2);

-- ALU profiles
INSERT INTO public.profile_systems (slug, name, material, depth_mm, uw_value, description, allowed_types, sort_order) VALUES
  ('mb-86n',  'MB-86N',   'aluminum', 86, 1.10, 'Warm aluminium system – thermally broken',  ARRAY['window','door'], 3),
  ('mb-60e',  'MB-60E',   'aluminum', 60, 1.40, 'Classic aluminium, narrow sightlines',      ARRAY['window'],        4);

-- Wood profile
INSERT INTO public.profile_systems (slug, name, material, depth_mm, uw_value, description, allowed_types, sort_order) VALUES
  ('solid-pine-68', 'Solid Pine 68', 'wood', 68, 1.00, 'Certified European pine – natural finish', ARRAY['window','door'], 5);

-- ─── Window Types ────────────────────────────────────────────
INSERT INTO public.window_types (slug, label, product_category, sash_count, opening_type, allowed_materials, sort_order) VALUES
  ('1s-fixed',      '1 Sash – Fixed',          'window', 1, 'fixed',     ARRAY['pvc','aluminum','wood'], 0),
  ('1s-tilt-turn',  '1 Sash – Tilt & Turn',    'window', 1, 'tilt-turn', ARRAY['pvc','aluminum','wood'], 1),
  ('2s-both-turn',  '2 Sash – Both Turn',       'window', 2, 'turn',      ARRAY['pvc','aluminum','wood'], 2),
  ('2s-one-fixed',  '2 Sash – One Fixed',       'window', 2, 'turn',      ARRAY['pvc','aluminum','wood'], 3),
  ('3s-centre-turn','3 Sash – Centre Turn',     'window', 3, 'turn',      ARRAY['pvc','aluminum'],        4),
  ('door-1l-turn',  'Front Door – Single Leaf', 'door',   1, 'turn',      ARRAY['pvc','aluminum','wood'], 5),
  ('sliding-2t',    'Sliding – 2 Track',        'door',   2, 'sliding',   ARRAY['pvc','aluminum'],        6);

-- ─── Constraints ─────────────────────────────────────────────
-- Reference UUIDs via sub-select for portability
DO $$
DECLARE
  v_iglo5     UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-edge-5');
  v_igloL     UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-light');
  v_iglo8     UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-star-8');
  v_mb86      UUID := (SELECT id FROM public.profile_systems WHERE slug = 'mb-86n');
  v_mb60      UUID := (SELECT id FROM public.profile_systems WHERE slug = 'mb-60e');
  v_pine      UUID := (SELECT id FROM public.profile_systems WHERE slug = 'solid-pine-68');
  v_1sf       UUID := (SELECT id FROM public.window_types WHERE slug = '1s-fixed');
  v_1stt      UUID := (SELECT id FROM public.window_types WHERE slug = '1s-tilt-turn');
  v_2sbt      UUID := (SELECT id FROM public.window_types WHERE slug = '2s-both-turn');
  v_2sof      UUID := (SELECT id FROM public.window_types WHERE slug = '2s-one-fixed');
  v_3sct      UUID := (SELECT id FROM public.window_types WHERE slug = '3s-centre-turn');
  v_d1l       UUID := (SELECT id FROM public.window_types WHERE slug = 'door-1l-turn');
  v_sl2       UUID := (SELECT id FROM public.window_types WHERE slug = 'sliding-2t');
BEGIN
  INSERT INTO public.constraints
    (profile_system_id, window_type_id, min_width_mm, max_width_mm, min_height_mm, max_height_mm) VALUES
  -- Iglo Edge 5 + PVC constraints
  (v_iglo5, v_1sf,  400,  1500,  400, 2200),
  (v_iglo5, v_1stt, 400,  1250,  400, 1600),
  (v_iglo5, v_2sbt, 800,  2500,  400, 1600),
  (v_iglo5, v_2sof, 800,  2500,  400, 2000),
  (v_iglo5, v_3sct, 1200, 3000,  600, 1600),
  (v_iglo5, v_d1l,  700,  1200, 1900, 2500),
  -- Iglo Light
  (v_igloL, v_1sf,  400,  1400,  400, 2000),
  (v_igloL, v_1stt, 400,  1200,  400, 1500),
  (v_igloL, v_2sbt, 800,  2400,  400, 1500),
  -- Iglo Star 8 (passive, slightly smaller max)
  (v_iglo8, v_1sf,  400,  1400,  400, 2100),
  (v_iglo8, v_1stt, 400,  1200,  400, 1500),
  (v_iglo8, v_2sbt, 800,  2400,  400, 1500),
  (v_iglo8, v_d1l,  700,  1200, 1900, 2500),
  -- MB-86N Aluminium (wider spans)
  (v_mb86, v_1sf,   530,  2000,  530, 2800),
  (v_mb86, v_1stt,  530,  1250,  530, 2000),
  (v_mb86, v_2sbt, 1060,  3000,  530, 2000),
  (v_mb86, v_2sof, 1060,  3000,  530, 2500),
  (v_mb86, v_3sct, 1500,  4000,  800, 2000),
  (v_mb86, v_d1l,   700,  1300, 1900, 2800),
  (v_mb86, v_sl2,  1500,  5000, 2000, 2800),
  -- MB-60E Aluminium
  (v_mb60, v_1sf,   530,  1600,  530, 2400),
  (v_mb60, v_1stt,  530,  1200,  530, 1800),
  (v_mb60, v_2sbt, 1060,  2800,  530, 1800),
  -- Solid Pine Wood
  (v_pine, v_1sf,   400,  1200,  400, 2000),
  (v_pine, v_1stt,  400,  1100,  400, 1500),
  (v_pine, v_2sbt,  800,  2200,  400, 1500),
  (v_pine, v_d1l,   700,  1100, 1900, 2400);
END $$;

-- ─── Pricing Rules ───────────────────────────────────────────
DO $$
DECLARE
  v_iglo5 UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-edge-5');
  v_igloL UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-light');
  v_iglo8 UUID := (SELECT id FROM public.profile_systems WHERE slug = 'iglo-star-8');
  v_mb86  UUID := (SELECT id FROM public.profile_systems WHERE slug = 'mb-86n');
  v_mb60  UUID := (SELECT id FROM public.profile_systems WHERE slug = 'mb-60e');
  v_pine  UUID := (SELECT id FROM public.profile_systems WHERE slug = 'solid-pine-68');
BEGIN
  -- Base price per m² (group_name NULL = base rate row)
  INSERT INTO public.pricing_rules (profile_system_id, group_name, option_key, price_per_m2_eur) VALUES
  (v_iglo5, NULL, NULL, 280),
  (v_igloL, NULL, NULL, 260),
  (v_iglo8, NULL, NULL, 340),
  (v_mb86,  NULL, NULL, 480),
  (v_mb60,  NULL, NULL, 420),
  (v_pine,  NULL, NULL, 380);

  -- Glazing deltas (per m²)
  INSERT INTO public.pricing_rules (profile_system_id, group_name, option_key, price_delta_eur) VALUES
  (v_iglo5, 'glazing', 'double',   0),
  (v_iglo5, 'glazing', 'triple',  45),
  (v_igloL, 'glazing', 'double',   0),
  (v_igloL, 'glazing', 'triple',  45),
  (v_iglo8, 'glazing', 'double',   0),
  (v_iglo8, 'glazing', 'triple',  40),
  (v_mb86,  'glazing', 'double',   0),
  (v_mb86,  'glazing', 'triple',  60),
  (v_mb60,  'glazing', 'double',   0),
  (v_mb60,  'glazing', 'triple',  60),
  (v_pine,  'glazing', 'double',   0),
  (v_pine,  'glazing', 'triple',  50);

  -- Security level deltas (flat per unit)
  INSERT INTO public.pricing_rules (profile_system_id, group_name, option_key, price_delta_eur) VALUES
  (v_iglo5, 'security', 'standard', 0),
  (v_iglo5, 'security', 'rc1',      80),
  (v_iglo5, 'security', 'rc2',     160),
  (v_mb86,  'security', 'standard', 0),
  (v_mb86,  'security', 'rc1',     100),
  (v_mb86,  'security', 'rc2',     200);

  -- Color exterior deltas (flat per unit)
  INSERT INTO public.pricing_rules (profile_system_id, group_name, option_key, price_delta_eur) VALUES
  (v_iglo5, 'color_exterior', 'white',      0),
  (v_iglo5, 'color_exterior', 'anthracite', 80),
  (v_iglo5, 'color_exterior', 'golden-oak', 120),
  (v_iglo5, 'color_exterior', 'custom-ral', 150),
  (v_mb86,  'color_exterior', 'white',      0),
  (v_mb86,  'color_exterior', 'anthracite', 100),
  (v_mb86,  'color_exterior', 'custom-ral', 200),
  (v_pine,  'color_exterior', 'natural',    0),
  (v_pine,  'color_exterior', 'painted',    60);

  -- Warm Edge spacer (flat per unit)
  INSERT INTO public.pricing_rules (profile_system_id, group_name, option_key, price_delta_eur) VALUES
  (v_iglo5, 'spacer', 'standard', 0),
  (v_iglo5, 'spacer', 'warm-edge', 35),
  (v_mb86,  'spacer', 'standard', 0),
  (v_mb86,  'spacer', 'warm-edge', 40);
END $$;

-- ─── Options Catalog ─────────────────────────────────────────
INSERT INTO public.options (group_name, key, label, description, value_json, sort_order) VALUES
  -- Glazing
  ('glazing', 'double', 'Double glazing (2-fach)',
   'Standard double-pane insulation glass',
   '{"u_value": 1.1, "db_rating": 31}', 0),
  ('glazing', 'triple', 'Triple glazing (3-fach)',
   'High-performance triple-pane glass',
   '{"u_value": 0.6, "db_rating": 34}', 1),
  ('glazing', 'satin',  'Satin / frosted',
   'Privacy decorative glass – single or double',
   '{"u_value": 1.1, "db_rating": 30}', 2),

  -- Exterior colour
  ('color_exterior', 'white',       'White (RAL 9016)',   NULL, '{"ral": "9016", "hex": "#f1f0ea"}', 0),
  ('color_exterior', 'anthracite',  'Anthracite (RAL 7016)', NULL, '{"ral": "7016", "hex": "#404040"}', 1),
  ('color_exterior', 'golden-oak',  'Golden Oak',         NULL, '{"ral": null,   "hex": "#b5651d"}', 2),
  ('color_exterior', 'dark-brown',  'Dark Brown (RAL 8019)', NULL, '{"ral": "8019", "hex": "#3c2a1a"}', 3),
  ('color_exterior', 'custom-ral',  'Custom RAL',         'Any RAL colour on request', '{"ral": "custom", "hex": null}', 4),

  -- Interior colour (same swatches, tracked separately)
  ('color_interior', 'white',       'White (RAL 9016)',   NULL, '{"ral": "9016", "hex": "#f1f0ea"}', 0),
  ('color_interior', 'anthracite',  'Anthracite (RAL 7016)', NULL, '{"ral": "7016", "hex": "#404040"}', 1),
  ('color_interior', 'same-as-exterior', 'Same as exterior', NULL, '{}', 2),

  -- Security
  ('security', 'standard', 'Standard lock',  'Basic multi-point lock', '{}', 0),
  ('security', 'rc1',      'RC1 Security',   'Resistance class 1 – burglary resistant', '{}', 1),
  ('security', 'rc2',      'RC2 Security',   'Resistance class 2 – certified anti-burglary', '{}', 2),

  -- Spacer
  ('spacer', 'standard',  'Standard aluminium spacer', NULL, '{"u_delta": 0}', 0),
  ('spacer', 'warm-edge', 'Warm Edge spacer', 'TGI / Super Spacer – reduces cold edge condensation', '{"u_delta": -0.05}', 1),

  -- Handle
  ('handle', 'standard-silver', 'Standard – Silver',   NULL, '{"brand": "Hoppe", "finish": "silver"}', 0),
  ('handle', 'standard-gold',   'Standard – Gold',     NULL, '{"brand": "Hoppe", "finish": "gold"}',   1),
  ('handle', 'steel-brushed',   'Brushed Steel',       NULL, '{"brand": "Hoppe", "finish": "brushed"}',2),
  ('handle', 'smart-lock',      'Smart Lock Ready',    'Pre-drilled for smart cylinder', '{"brand": "Hoppe"}', 3);
