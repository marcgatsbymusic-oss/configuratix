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

async function searchDB() {
    try {
        await sql.connect(sqlConfig);
        console.log("Querying SPRBAUM...");
        const result = await sql.query("SELECT TOP 20 * FROM SPRBAUM WHERE FFARTNR = '2-24'");
        console.log(result.recordset);
    } catch(e) {
        console.error(e);
    } finally {
        await sql.close();
    }
}
searchDB();
