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

async function fixExtractPricing() {
    try {
        await sql.connect(sqlConfig);
        
        // Fetch valid PVC matrices
        const qMat = await sql.query(`
            SELECT PREISMATRIX, BREITE, HOEHE, PREIS
            FROM PREISMAT
            WHERE PREISMATRIX LIKE 'PVC_%'
            ORDER BY PREISMATRIX, BREITE, HOEHE
        `);

        // Format into hierarchical JSON: { "PVC_F100": { "1000x1200": 1500, ... } }
        let pricingGrids = {};
        for(let row of qMat.recordset) {
            if(!pricingGrids[row.PREISMATRIX]) {
                pricingGrids[row.PREISMATRIX] = {};
            }
            pricingGrids[row.PREISMATRIX][`${row.BREITE}x${row.HOEHE}`] = row.PREIS;
        }

        const outPath = path.resolve('./scripts/data');
        if(!fs.existsSync(outPath)) fs.mkdirSync(outPath);
        
        fs.writeFileSync(path.join(outPath, 'base_pricing_grids.json'), JSON.stringify(pricingGrids, null, 2), 'utf8');
        console.log(`Successfully extracted ${Object.keys(pricingGrids).length} PVC Pricing Matrices.`);

    } catch (err) {
        console.error("Error executing query:", err.message);
    } finally {
        await sql.close();
    }
}

fixExtractPricing();
