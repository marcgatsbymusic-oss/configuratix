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

async function investigate() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Looking for VKPREISFAKTOR columns...");
        const cols = await req.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%VKPREISFAKTOR%' OR COLUMN_NAME LIKE '%FAKTOR%'");
        console.log("Tables containing FAKTOR / VKPREISFAKTOR:");
        console.log([...new Set(cols.recordset.map(r => r.TABLE_NAME))].join(', '));
        
        console.log("\nLooking for fn_PRICE_GROUPS function or object...");
        const routines = await req.query("SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME LIKE '%PRICE_GROUP%'");
        console.log("Routines:", routines.recordset);

        // Also check if it's a table
        const tables = await req.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%PRICE_GROUP%' OR TABLE_NAME LIKE '%PREISGRUPPE%'");
        console.log("Tables related to Price Groups:", tables.recordset.map(r => r.TABLE_NAME).join(', '));
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
investigate();
