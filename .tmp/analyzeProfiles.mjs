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

async function analyze() {
    try {
        await sql.connect(sqlConfig);

        const tablesToInspect = ['PRODUKTSYSTEME', 'PROFILING', 'PREISE', 'ARTIKEL', 'ARTPREISE'];

        for (const table of tablesToInspect) {
            console.log(`\n--- TABLE: ${table} ---`);
            const cols = await sql.query(`
                SELECT COLUMN_NAME, DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${table}'
            `);
            console.log("Columns:", cols.recordset.map(c => `${c.COLUMN_NAME} (${c.DATA_TYPE})`).join(', '));
            
            try {
                const sample = await sql.query(`SELECT TOP 2 * FROM ${table}`);
                console.log("Sample Data:", JSON.stringify(sample.recordset, null, 2));
            } catch(e) {
                console.log("Could not sample:", e.message);
            }
        }

    } catch (err) {
        console.error("Connection Error:", err);
    } finally {
        await sql.close();
    }
}

analyze();
