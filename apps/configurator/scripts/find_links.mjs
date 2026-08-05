import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log("Checking PROFILING system relationships...");
        
        const q1 = `SELECT TOP 1 * FROM PROFILING`;
        const r1 = await sql.query(q1);
        console.log("PROFILING Cols:", Object.keys(r1.recordset[0] || {}));

        console.log("Checking PROFILBAUGRUPPE cols...");
        try {
            const q3 = `SELECT TOP 1 * FROM PROFILBAUGRUPPE`;
            const r3 = await sql.query(q3);
            console.log("PROFILBAUGRUPPE cols:", Object.keys(r3.recordset[0] || {}));
        } catch(e) { console.log(e.message); }

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
