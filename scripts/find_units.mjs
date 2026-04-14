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

        const unitsQuery = `SELECT TOP 10 ARTNR, BEZEICHNUNG, FELDANZAHL FROM ARTIKEL WHERE PRODUKTTYP = 90 AND (ARTNR LIKE 'F%' OR ARTNR LIKE 'D%')`;
        const units = await sql.query(unitsQuery);
        console.log("Units Field Counts:", units.recordset);

        const openQuery = `SELECT TOP 10 * FROM BESCHLAGSPAKET`;
        const opens = await sql.query(openQuery);
        console.log("BESCHLAGSPAKET Rows:", opens.recordset);


    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
