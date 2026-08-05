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
        console.log("Connected. Querying BESCHVAR columns for Image...");

        const cols = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BESCHVAR'
        `);
        console.log("BESCHVAR columns:", cols.recordset);
    } catch(e) { console.error(e); } finally { await sql.close(); }
}
run();
