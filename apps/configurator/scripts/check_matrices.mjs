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

async function check() {
    try {
        await sql.connect(sqlConfig);
        const request = new sql.Request();
        
        const matQuery = `
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME LIKE '%MAT%' OR TABLE_NAME LIKE '%PREIS%' OR TABLE_NAME LIKE '%WERT%'
        `;

        const result = await request.query(matQuery);
        console.log("Found tables containing MAT, PREIS, WERT:");
        console.log(result.recordset.map(r => r.TABLE_NAME));

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
check();
