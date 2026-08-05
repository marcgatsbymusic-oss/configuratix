import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected. Querying F100 linkages...");

        const f100Query = await sql.query("SELECT * FROM ARTVARBL WHERE ARTNR = 'F100'");
        console.log("ARTVARBL for F100:", f100Query.recordset);
        
        // Is there an FEBESCH table? (FluegelBeschlag = Sash Fitting)
        const feTables = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%FEBESCH%' OR TABLE_NAME LIKE '%BESCHL%'");
        console.log("FEBESCH Tables:", feTables.recordset.map(t => t.TABLE_NAME));

        const varfld = await sql.query("SELECT TOP 5 * FROM VARFLDZUORD");
        console.log("VARFLDZUORD sample:", varfld.recordset);

        // Also check OEFF tables that might exist
        const oeffTables = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'OEFF%'");
        console.log("OEFF Tables:", oeffTables.recordset.map(t => t.TABLE_NAME));

    } catch(e) { console.error(e); } finally { await sql.close(); }
}
run();
