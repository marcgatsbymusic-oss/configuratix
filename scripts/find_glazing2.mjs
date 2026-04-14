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
        const res = await sql.query("SELECT TOP 50 SCHEIBENR, BEZEICHNUNG, STAERKE FROM FF_GLAS WHERE SCHEIBENR LIKE '%-%' OR BEZEICHNUNG LIKE '%24mm%' OR BEZEICHNUNG LIKE '%glaz%' OR BEZEICHNUNG LIKE '%szyb%'");
        console.log("Top 20 Valid Glazing Packages:");
        console.log(res.recordset);
    } catch(e) {
        console.error(e);
    } finally {
        await sql.close();
    }
}
run();
