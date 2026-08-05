import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected to Cantor DB.");

        console.log("Extracting Window Typologies from ARTIKEL...");
        const query = `
            SELECT 
                ARTNR, 
                BEZEICHNUNG, 
                FELDANZAHL, 
                BITMAPNAME 
            FROM ARTIKEL 
            WHERE PRODUKTTYP = 90 
            ORDER BY ARTNR ASC
        `;
        
        const result = await sql.query(query);
        
        const typologies = result.recordset.map(row => ({
            id: row.ARTNR.trim(),
            name: row.BEZEICHNUNG.trim(),
            sashes: row.FELDANZAHL || 1,
            // Provide a clean fallback file target inside our own app directory structure
            image: `/images/typologies/${row.ARTNR.trim()}.svg`
        }));
        
        const targetPath = path.resolve('src/data/window_typologies.json');
        fs.writeFileSync(targetPath, JSON.stringify(typologies, null, 2));

        console.log(`Successfully extracted ${typologies.length} typologies to ${targetPath}`);

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
