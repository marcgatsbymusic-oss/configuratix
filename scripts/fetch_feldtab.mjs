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

async function checkFeldtab() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Checking structure of FELDTAB...");
        const res = await req.query("SELECT TOP 5 * FROM FELDTAB WHERE NAME LIKE 'ES%' OR NAME = 'ES1010' OR FELD LIKE 'ES%' OR VARIABLE LIKE 'ES%' OR PROPERTY LIKE 'ES%'");
        // We catch an error if column names are unknown by doing a safe search if the first one fails
    } catch (err) {
        // Fallback to select *
        try {
            const req = new sql.Request();
            console.log("Falling back: fetching all FELDTAB");
            const res = await req.query("SELECT * FROM FELDTAB");
            
            const rows = res.recordset;
            // Let's find ES...
            const esRows = rows.filter(r => {
                for (let v of Object.values(r)) {
                    if (typeof v === 'string' && v.startsWith('ES')) return true;
                }
                return false;
            });
            
            console.log(`Found ${esRows.length} 'ES' variables in FELDTAB.`);
            
            if (rows.length > 0) {
                await fs.writeFile('variable_map_dump.json', JSON.stringify({ feldtab: rows }, null, 2));
                console.log(`Saved full FELDTAB to variable_map_dump.json (${rows.length} rows)`);
            }
        } catch (e) {
            console.error(e);
        }
    } finally {
        await sql.close();
    }
}
checkFeldtab();
