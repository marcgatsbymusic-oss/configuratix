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

async function fetchSysvars() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Fetching CASYSVAR* tables...");
        const payload = {};
        
        const tables = [
            'CASYSVAR',
            'SYSVARS',
            'CASYSVARTRANSLATION'
        ];
        
        for (const t of tables) {
            try {
                const res = await req.query(`SELECT * FROM ${t}`);
                payload[t] = res.recordset;
                console.log(`Fetched ${res.recordset.length} rows from ${t}`);
            } catch(e) {
                console.error(`Failed to fetch ${t}:`, e.message);
            }
        }
        
        await fs.writeFile('variable_map_dump.json', JSON.stringify(payload, null, 2));
        console.log("Saved variable mappings to variable_map_dump.json");
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
fetchSysvars();
