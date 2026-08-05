import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function extractLists() {
    try {
        let pool = await sql.connect(sqlConfig);
        console.log("Connected to DB.");

        const results = {};

        // 1. ART table
        const art = await pool.request().query("SELECT DISTINCT DATEINAME FROM ART WHERE DATEINAME IS NOT NULL AND DATEINAME != ''");
        results.ART = art.recordset.map(r => r.DATEINAME);
        
        // 2. SBMAKRO
        const sbmakro = await pool.request().query("SELECT DISTINCT DATEINAME FROM SBMAKRO WHERE DATEINAME IS NOT NULL AND DATEINAME != ''");
        results.SBMAKRO = sbmakro.recordset.map(r => r.DATEINAME);

        // 3. FELDVORB
        const feldvorb = await pool.request().query("SELECT DISTINCT SPRBILD FROM FELDVORB WHERE SPRBILD IS NOT NULL AND SPRBILD != ''");
        results.FELDVORB = feldvorb.recordset.map(r => r.SPRBILD);

        // 4. SPRART
        const sprart = await pool.request().query("SELECT DISTINCT SPBILDTYP FROM SPRART WHERE SPBILDTYP IS NOT NULL AND SPBILDTYP != ''");
        results.SPRART = sprart.recordset.map(r => r.SPBILDTYP);
        
        await fs.writeFile('drutex_image_list.json', JSON.stringify(results, null, 2));
        console.log("Successfully extracted list to drutex_image_list.json");

        const allFiles = [...results.ART, ...results.SBMAKRO, ...results.FELDVORB, ...results.SPRART];
        const uniqueFiles = [...new Set(allFiles)].sort();
        await fs.writeFile('drutex_unique_images.json', JSON.stringify(uniqueFiles, null, 2));
        console.log(`Extracted ${uniqueFiles.length} unique files to drutex_unique_images.json`);

        pool.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

extractLists();
