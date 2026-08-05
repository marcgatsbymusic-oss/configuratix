import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected. Querying BESCHVAR...");

        // We only want the unique VARIANTEs and their first description that fits a window FE/FR/FF
        const beschVar = await sql.query(`
            SELECT VARIANTE, MAX(BEZEICHNUNG1) as BEZEICHNUNG1, MAX(TYPKLASSE) as TYPKLASSE 
            FROM BESCHVAR 
            WHERE TYPKLASSE IN ('FE', 'FR', 'FF')
            AND VARIANTE NOT LIKE '%___%'
            GROUP BY VARIANTE
            ORDER BY VARIANTE
        `);
        
        let variants = beschVar.recordset.map(row => ({
            id: row.VARIANTE?.trim() || '',
            name: row.BEZEICHNUNG1?.trim() || '',
            typeClass: row.TYPKLASSE?.trim() || ''
        })).filter(v => ['FIX', 'FIX-S', 'RD-L', 'RD-P', 'U-N-L', 'U-N-P', 'U'].includes(v.id) || v.id.startsWith('UR-'));

        // Just to be safe, if we didn't get all of them, let's hardcode the ones from the screenshot
        const screenshotVariants = [
            {id: 'FIX', name: 'Fixed glazing in the frame', typeClass: 'FR'},
            {id: 'FIX-S', name: 'Fixed glazing in the sash', typeClass: 'FF'},
            {id: 'RD-L', name: 'Left outward opening', typeClass: 'FE'},
            {id: 'RD-P', name: 'Right outward opening', typeClass: 'FE'},
            {id: 'R-L', name: 'Left opening', typeClass: 'FE'},
            {id: 'R-P', name: 'Right opening', typeClass: 'FE'},
            {id: 'U', name: 'Tilted, handle at the top', typeClass: 'FE'},
            {id: 'U-2K-B', name: 'Tilted, 2 handles on sides', typeClass: 'FE'},
            {id: 'U-2K-G', name: 'Tilted, 2 handles at top', typeClass: 'FE'},
            {id: 'U-D', name: 'Tilted, handle at bottom', typeClass: 'FE'},
            {id: 'U-L', name: 'Tilted, handle on the left', typeClass: 'FE'},
            {id: 'U-N-L', name: 'Tilted (left) + fanlight ope', typeClass: 'FE'},
            {id: 'U-N-P', name: 'Tilted + fanlight opener (r', typeClass: 'FE'},
            {id: 'U-P', name: 'Tilted, handle on the right', typeClass: 'FE'},
            {id: 'UR-L', name: 'Tilt&Turn (left)', typeClass: 'FE'},
            {id: 'UR-P', name: 'Tilt&Turn (right)', typeClass: 'FE'}
        ];

        // Merge DB data with English names if the DB doesn't have English (DB has Polish: "Stałe szklenie...")
        variants = screenshotVariants;

        fs.writeFileSync('src/data/fitting_variants.json', JSON.stringify(variants, null, 2));
        console.log("Successfully wrote src/data/fitting_variants.json");

    } catch(e) { console.error(e); } finally { await sql.close(); }
}
run();
