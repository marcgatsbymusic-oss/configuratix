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

async function explore() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Looking for tables matching Variable/Attribute mappings...");
        const queries = [
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%EIGENSCHAFT%'",
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%MERKMAL%'",
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%FELD%'",
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%VAR%'"
        ];

        for (const q of queries) {
            try {
                const res = await req.query(q);
                if (res.recordset.length > 0) {
                    console.log(`Found via ${q.split("LIKE ")[1]}:`, res.recordset.map(r => r.TABLE_NAME));
                }
            } catch (e) {}
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
explore();
