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

async function exportDatabase() {
    console.log('Starting export script...');
    try {
        await sql.connect(sqlConfig);
        console.log('Connected to DB');

        const request = new sql.Request();
        
        console.log('Fetching CUSTOM_* tables...');
        const result = await request.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE='BASE TABLE' AND TABLE_NAME LIKE 'CUSTOM_%'
        `);
        
        const customData = {};
        for (let row of result.recordset) {
            const tableName = row.TABLE_NAME;
            console.log(`Exporting ${tableName}...`);
            const tableRes = await request.query(`SELECT * FROM ${tableName}`);
            customData[tableName] = tableRes.recordset;
        }

        await fs.writeFile('scripts/drutex_custom_tables.json', JSON.stringify(customData, null, 2));
        console.log('Saved drutex_custom_tables.json');

        const otherTables = ['PREISE', 'PREISGRUPPE', 'ARTIKEL', 'ARTPREISE', 'FARBEN', 'TEXTE'];
        for (let table of otherTables) {
            console.log(`Exporting ${table}...`);
            const tableRes = await request.query(`SELECT * FROM ${table}`);
            await fs.writeFile(`scripts/drutex_${table.toLowerCase()}.json`, JSON.stringify(tableRes.recordset, null, 2));
            console.log(`Saved drutex_${table.toLowerCase()}.json`);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
        console.log('Finished export!');
    }
}
exportDatabase();
