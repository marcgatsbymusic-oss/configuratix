-- ============================================================
-- Configurator Seed Expansion
-- Migration: 004_add_drutex_window_types.sql
-- ============================================================

INSERT INTO public.window_types (slug, label, product_category, sash_count, opening_type, allowed_materials, sort_order) VALUES
  ('1-flugel', '1 Flügel', 'window', 1, 'turn', ARRAY['pvc','aluminum','wood'], 10),
  ('1-flugel-oberlicht', '1 Flügel mit Oberlicht', 'window', 2, 'turn', ARRAY['pvc','aluminum','wood'], 11),
  ('1-flugel-unterlicht', '1 Flügel mit Unterlicht', 'window', 2, 'turn', ARRAY['pvc','aluminum','wood'], 12),
  ('2-flugel', '2 Flügel', 'window', 2, 'turn', ARRAY['pvc','aluminum','wood'], 13),
  ('2-flugel-oberlicht', '2 Flügel mit Oberlicht', 'window', 3, 'turn', ARRAY['pvc','aluminum','wood'], 14),
  ('2-flugel-oberlicht-asym', '2 Flügel asym. mit Oberlicht', 'window', 3, 'turn', ARRAY['pvc','aluminum','wood'], 15),
  ('2-flugel-unterlicht', '2 Flügel mit Unterlicht', 'window', 3, 'turn', ARRAY['pvc','aluminum','wood'], 16),
  ('2-flugel-unterlicht-asym', '2 Flügel asym. mit Unterlicht', 'window', 3, 'turn', ARRAY['pvc','aluminum','wood'], 17),
  ('3-flugel', '3 Flügel', 'window', 3, 'turn', ARRAY['pvc','aluminum','wood'], 18),
  ('3-flugel-oberlicht', '3 Flügel mit Oberlicht', 'window', 4, 'turn', ARRAY['pvc','aluminum','wood'], 19),
  ('3-flugel-oberlicht-asym', '3 Flügel asym. mit Oberlicht', 'window', 4, 'turn', ARRAY['pvc','aluminum','wood'], 20),
  ('3-flugel-unterlicht', '3 Flügel mit Unterlicht', 'window', 4, 'turn', ARRAY['pvc','aluminum','wood'], 21),
  ('3-flugel-unterlicht-asym', '3 Flügel asym. mit Unterlicht', 'window', 4, 'turn', ARRAY['pvc','aluminum','wood'], 22),
  ('4-flugel', '4 Flügel', 'window', 4, 'turn', ARRAY['pvc','aluminum','wood'], 23);
