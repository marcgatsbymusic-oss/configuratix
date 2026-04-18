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
        
        const viewsQuery = `
            SELECT TABLE_NAME, TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME LIKE '%PANEL%' OR 
                  TABLE_NAME LIKE '%ROL%' OR 
                  TABLE_NAME LIKE '%ALL_DOD%' OR
                  TABLE_NAME LIKE '%DOD%' 
        `;

        const result = await request.query(viewsQuery);
        console.log("Found:", result.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
check();
