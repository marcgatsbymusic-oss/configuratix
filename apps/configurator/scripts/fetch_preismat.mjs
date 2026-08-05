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

async function extract() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Checking columns for PREISMAT...");
        const cols = await req.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='PREISMAT'");
        console.log("Columns:", cols.recordset.map(r => r.COLUMN_NAME).join(', '));
        
        // Fetch all of PREISMAT because it might not be huge, or find matching rows
        console.log("Fetching matching rows from PREISMAT...");
        const result = await req.query("SELECT * FROM PREISMAT");
        const rows = result.recordset;
        
        const matching = rows.filter(r => {
            for (let val of Object.values(r)) {
                if (typeof val === 'string' && (
                    val.startsWith('PANEL_') || 
                    val.startsWith('ROL_') || 
                    val.startsWith('ALL_DOD') ||
                    val.includes('F100') ||
                    val.includes('PVC_') ||
                    val.includes('S11') ||
                    val.includes('AL_') ||
                    val.includes('I5S') ||
                    val.includes('IG5')
                )) {
                    return true;
                }
            }
            return false;
        });

        console.log(`Found ${matching.length} matching matrix rows in PREISMAT.`);
        
        await fs.writeFile('matrix_data_dump.json', JSON.stringify({ preismat: matching }, null, 2));
        console.log('Saved to matrix_data_dump.json');
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
extract();
