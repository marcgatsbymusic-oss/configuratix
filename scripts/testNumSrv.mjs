import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true },
    driver: 'msnodesqlv8'
};

async function testNumSrv() {
    try {
        await sql.connect(sqlConfig);
        const res = await sql.query(`SELECT CODE, SUBCODE, BEZEICHNUNG, WERT FROM NUMSRV WHERE BEZEICHNUNG LIKE '%Zlecenia%' OR BEZEICHNUNG LIKE '%Auftrag%'`);
        console.log(JSON.stringify(res.recordset, null, 2));
    } catch(e) { console.error(e) } finally { await sql.close(); }
}
testNumSrv();
