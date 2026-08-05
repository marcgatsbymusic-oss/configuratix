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
        const res = await sql.query("SELECT TOP 20 * FROM BESCHVAR");
        console.log("BESCHVAR:", res.recordset);
        
        const res2 = await sql.query("SELECT TOP 10 * FROM BESCHVARZUORD");
        console.log("BESCHVARZUORD:", res2.recordset);
    } catch(e) { console.error(e); } finally { await sql.close(); }
}
run();
