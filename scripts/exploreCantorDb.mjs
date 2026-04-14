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

const keywords = [
    'PROFIL', 'SYSTEM', 'GLAS', 'PREIS', 'VARIAN', 'KALK', 'ARTIKEL', 'FARBE', 'BESCHLAG'
];

async function explore() {
    try {
        await sql.connect(sqlConfig);
        
        const tablesQuery = `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE='BASE TABLE' 
            AND (${keywords.map(k => `TABLE_NAME LIKE '%${k}%'`).join(' OR ')})
            ORDER BY TABLE_NAME
        `;
        
        const result = await sql.query(tablesQuery);
        console.log("Found Tables:");
        result.recordset.forEach(r => console.log(r.TABLE_NAME));

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

explore();
