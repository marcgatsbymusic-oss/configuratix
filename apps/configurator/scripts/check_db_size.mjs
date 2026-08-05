import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'master', // Must query master for database sizes easily, or DRUTEX_DEALER
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function checkSize() {
    try {
        await sql.connect(sqlConfig);
        const req = new sql.Request();
        
        console.log("Checking size of DRUTEX_DEALER...");
        const query = `
            SELECT 
                database_name = DB_NAME(database_id),
                log_size_mb = CAST(SUM(CASE WHEN type_desc = 'LOG' THEN size END) * 8. / 1024 AS DECIMAL(8,2)),
                row_size_mb = CAST(SUM(CASE WHEN type_desc = 'ROWS' THEN size END) * 8. / 1024 AS DECIMAL(8,2)),
                total_size_mb = CAST(SUM(size) * 8. / 1024 AS DECIMAL(8,2))
            FROM sys.master_files
            WHERE DB_NAME(database_id) = 'DRUTEX_DEALER'
            GROUP BY database_id
        `;
        
        const result = await req.query(query);
        console.table(result.recordset);
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
checkSize();
