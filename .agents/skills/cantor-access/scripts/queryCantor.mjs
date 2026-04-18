import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function executeQuery() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: node queryCantor.mjs \"<SQL_QUERY>\" or node queryCantor.mjs <path_to_sql_file>");
        process.exit(1);
    }
    
    let queryStr = args[0];
    if (queryStr.endsWith('.sql')) {
        queryStr = await fs.readFile(queryStr, 'utf-8');
    }

    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(queryStr);
        console.log(JSON.stringify(result.recordset, null, 2));
    } catch (err) {
        console.error("SQL Error:", err.message || err);
        process.exit(1);
    } finally {
        await sql.close();
    }
}

executeQuery();
