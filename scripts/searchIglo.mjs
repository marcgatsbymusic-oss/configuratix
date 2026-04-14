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

async function searchIglo() {
    try {
        await sql.connect(sqlConfig);
        
        console.log("Searching PROFILING:");
        const pr = await sql.query(`SELECT TOP 10 * FROM PROFILING`);
        console.log("PROFILING Table:");
        console.dir(pr.recordset, { depth: null });
        
        console.log("Searching SYSTEMCONFIG:");
        const sc = await sql.query(`SELECT TOP 5 * FROM SYSTEMCONFIG`);
        console.log("SYSTEMCONFIG Table:");
        console.dir(sc.recordset, { depth: null });

    } catch (err) {
        console.error("Error executing query:", err.message);
    } finally {
        await sql.close();
    }
}

searchIglo();
