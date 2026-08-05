import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function checkPVC() {
    try {
        await sql.connect(sqlConfig);
        
        const result = await sql.query(`
            SELECT PRODUKTSYSTEM, BEZEICHNUNG 
            FROM PRODUKTSYSTEME
        `);
        
        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\pvc_systems_utf8.json', JSON.stringify(result.recordset, null, 2), 'utf8');

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

checkPVC();
