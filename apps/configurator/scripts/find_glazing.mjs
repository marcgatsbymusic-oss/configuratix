import sql from 'mssql/msnodesqlv8.js';

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
        const tablesQuery = `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FF_GLAS'`;
        const queries = [
            "SELECT TOP 50 ARTIKELNR, BEZEICHNUNG FROM ARTIKEL WHERE ARTIKELGRP='GLAS' OR BEZEICHNUNG LIKE '%Szko%' OR BEZEICHNUNG LIKE '%Glass%'",
            "SELECT TOP 50 * FROM GLASS_PANE WHERE GLASSTYPE = 6 OR GLASSTYPE = 3"
        ];
        
        for (let q of queries) {
            try {
                const res = await sql.query(q);
                if (res.recordset && res.recordset.length > 0) {
                    console.log(`Matched Query: ${q}`);
                    console.log(`Results: `, res.recordset);
                } else {
                    console.log(`No results for: ${q}`);
                }
            } catch(e) {
                console.error(`Error executing ${q}:`, e.message);
            }
        }


    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
