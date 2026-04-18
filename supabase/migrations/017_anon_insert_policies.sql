-- Allow anonymous key to seed data
CREATE POLICY "cantor_systems_upsert_all" ON public.cantor_systems FOR INSERT WITH CHECK (true);
CREATE POLICY "cantor_systems_update_all" ON public.cantor_systems FOR UPDATE USING (true);

CREATE POLICY "cantor_articles_upsert_all" ON public.cantor_articles FOR INSERT WITH CHECK (true);
CREATE POLICY "cantor_articles_update_all" ON public.cantor_articles FOR UPDATE USING (true);

CREATE POLICY "cantor_pricing_rules_upsert_all" ON public.cantor_pricing_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "cantor_pricing_rules_update_all" ON public.cantor_pricing_rules FOR UPDATE USING (true);

CREATE POLICY "cantor_formula_matrices_upsert_all" ON public.cantor_formula_matrices FOR INSERT WITH CHECK (true);
CREATE POLICY "cantor_formula_matrices_update_all" ON public.cantor_formula_matrices FOR UPDATE USING (true);
CREATE POLICY "cantor_formula_matrices_delete_all" ON public.cantor_formula_matrices FOR DELETE USING (true);
