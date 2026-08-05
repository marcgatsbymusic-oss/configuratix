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

async function checkAssemblies() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`SELECT TOP 100 * FROM PROFILBAUGRUPPE`);
        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\profile_assemblies.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("Done extracting PROFILBAUGRUPPE");
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

checkAssemblies();
