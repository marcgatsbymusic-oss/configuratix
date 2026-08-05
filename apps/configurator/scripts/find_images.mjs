import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log("Checking for blob images in database...");
        
        try {
            const q = `SELECT TOP 1 * FROM ICONSET`;
            const r = await sql.query(q);
            console.log("ICONSET Cols:", Object.keys(r.recordset[0] || {}));
            if (r.recordset.length > 0) {
                console.log("ICONSET Sample Data:", r.recordset[0]);
            }
        } catch(e) { console.log(e.message); }

        try {
            const q = `SELECT TOP 1 * FROM ERP_ORDER_ITEM_IMAGES`;
            const r = await sql.query(q);
            console.log("ERP_ORDER_ITEM_IMAGES Cols:", Object.keys(r.recordset[0] || {}));
        } catch(e) { console.log(e.message); }

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
