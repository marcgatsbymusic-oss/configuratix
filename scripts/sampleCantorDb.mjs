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

const tablesToSample = [
    'PRODUKTSYSTEME',
    'ARTIKEL',
    'PREISE',
    'PREISSCHEMA',
    'FF_GLAS',
    'GLASS_PANE',
    'FARBEN'
];

async function sample() {
    try {
        await sql.connect(sqlConfig);
        
        for (const table of tablesToSample) {
            console.log(`\n--- Sampling ${table} ---`);
            const result = await sql.query(`SELECT TOP 2 * FROM ${table}`);
            console.log(JSON.stringify(result.recordset, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

sample();
