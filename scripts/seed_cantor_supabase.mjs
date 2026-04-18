import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Loading Cantor processed payloads...');
    try {
        const payloadStr = await fs.readFile('./processed_output_payload.json', 'utf8');
        const { product_systems } = JSON.parse(payloadStr);

        console.log(`Found ${product_systems.length} systems to migrate.`);

        for (const sys of product_systems) {
            console.log(`Upserting System: ${sys.name} (${sys.cantor_key})`);
            
            const { error: sysErr } = await supabase.from('cantor_systems').upsert({
                cantor_key: sys.cantor_key,
                name: sys.name,
                type_class: sys.type_class,
                pricing_group: sys.pricing_group,
                base_price: sys.base_price,
                min_width: sys.dimensional_constraints?.min_width,
                max_width: sys.dimensional_constraints?.max_width,
                min_height: sys.dimensional_constraints?.min_height,
                max_height: sys.dimensional_constraints?.max_height
            }, { onConflict: 'cantor_key' });
            
            if (sysErr) console.error('Sys Error:', sysErr);

            // Insert articles
            if (sys.articles && sys.articles.length > 0) {
                console.log(`Upserting ${sys.articles.length} articles...`);
                for (const art of sys.articles) {
                    await supabase.from('cantor_articles').upsert({
                        article_code: art.article_code,
                        system_key: sys.cantor_key,
                        name: art.name,
                        price_value: art.price_value
                    }, { onConflict: 'article_code' });
                }
            }

            // Insert pricing rules
            if (sys.pricing_rules && sys.pricing_rules.length > 0) {
                console.log(`Inserting ${sys.pricing_rules.length} pricing rules...`);
                for (const rule of sys.pricing_rules) {
                    await supabase.from('cantor_pricing_rules').insert({
                        system_key: sys.cantor_key,
                        description: rule.description,
                        rule_type: rule.rule_type,
                        formula_string: rule.formula_string,
                        modifier: rule.modifier
                    });
                }
            }
        }

        // We could also do matrix_data_dump if available
        try {
            const matrixStr = await fs.readFile('./matrix_data_dump.json', 'utf8');
            const { preismat } = JSON.parse(matrixStr);
            console.log(`Found ${preismat.length} matrices. Preparing for batch insertion...`);
            
            // Clear old matrices to prevent duplication bloat on re-seeds
            await supabase.from('cantor_formula_matrices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            const allMatrices = preismat.map((row) => ({
                matrix_name: row.PREISMATRIX,
                class_1: row.KLASSE1,
                class_2: row.KLASSE2,
                width: row.BREITE,
                height: row.HOEHE,
                prices: [row.PREIS, row.PREIS2, row.PREIS3, row.PREIS4, row.PREIS5, row.PREIS6, row.PREIS7, row.PREIS8, row.PREIS9, row.PREIS10].map(Number)
            }));

            // Supabase payload limit safety batching
            const batchSize = 1000;
            for (let i = 0; i < allMatrices.length; i += batchSize) {
                const batch = allMatrices.slice(i, i + batchSize);
                console.log(`Inserting matrix batch ${i} to ${i + batch.length}...`);
                const { error: mxErr } = await supabase.from('cantor_formula_matrices').insert(batch);
                if (mxErr) {
                    console.error('Matrix Batch Insert Error:', mxErr);
                }
            }

        } catch (e) {
            console.log('No matrix dump found or failed to seed:', e.message);
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Fatal error during seeding:', err);
    }
}

seed();
