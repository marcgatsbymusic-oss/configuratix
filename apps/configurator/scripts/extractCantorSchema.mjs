import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

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

async function extractSchema() {
    try {
        await sql.connect(sqlConfig);
        
        let output = {};

        for (const table of tablesToSample) {
            console.log(`Sampling ${table}`);
            const result = await sql.query(`SELECT TOP 5 * FROM ${table}`);
            
            // Also get column types
            const columns = await sql.query(`
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${table}'
            `);

            output[table] = {
                columns: columns.recordset,
                sample: result.recordset
            };
        }

        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\cantor_schema_samples.json', JSON.stringify(output, null, 2));
        console.log("Written to temp file");

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

extractSchema();
