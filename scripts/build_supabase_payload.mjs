import fs from 'fs/promises';

async function buildPayload() {
    console.log('Loading raw data dumps...');
    try {
        const rawData = JSON.parse(await fs.readFile('./database_tables_dump.json', 'utf8'));

        console.log('Building Phase 1 Processed Payload Context...');

        // Transform Systems
        const systems = (rawData.systems || []).map(sys => ({
            cantor_key: sys.PRODUKTSYSTEM,
            name: sys.BEZEICHNUNG,
            type_class: sys.TYPKLASSE || "DEFAULT", // Assuming placeholder if not native
            pricing_group: sys.PREISGRUPPE || "DEFAULT_GRP",
            base_price: 0,
            dimensional_constraints: {
                // If system table doesn't hold these natively, we inject sensible bound defaults
                min_width: 200,
                max_width: 3000,
                min_height: 200,
                max_height: 3000
            },
            // Since assigning millions of formulas to a system is heavy, we'll assign top 5 matching formulas
            // or just a subset of relevant formulas
            pricing_rules: (rawData.formulas || []).slice(0, 5).map(f => ({
                description: `${f.KEY1 || f.PREISGRUPPE} Rule`,
                rule_type: "PERCENTAGE_SURCHARGE", // Derived logic placeholder
                formula_string: f.FORMEL,
                modifier: f.PROZENT || 1.0
            })),
            articles: []
        }));

        // Transform Articles and distribute them
        const articles = (rawData.articles || []).slice(0, 50).map(art => ({
            article_code: art.ARTNR,
            name: art.BEZEICHNUNG,
            price_value: art.PREISSTUECK || 0
        }));

        // Simply attach articles to the first system for the schema example, 
        // in reality you would group by 'HERSTELLERSYSTEM' or 'PRODUKTTYPEN'
        if (systems.length > 0) {
            systems[0].articles = articles;
        }

        const payload = {
            product_systems: systems
        };

        await fs.writeFile('processed_output_payload.json', JSON.stringify(payload, null, 2));
        
        console.log('Successfully generated processed_output_payload.json');
        console.log('Ready for Phase 2 Confirmation!');

    } catch (e) {
        console.error('Failed to build payload:', e);
    }
}

buildPayload();
