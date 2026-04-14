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
        console.log("--- Checking EXPORTHISTORIE ---");
        try {
            const hist = await sql.query(`SELECT TOP 5 * FROM EXPORTHISTORIE`);
            console.log(JSON.stringify(hist.recordset, null, 2));
        } catch (e) {
            console.log(e.message);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
investigate();
