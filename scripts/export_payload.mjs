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

async function exportPayload() {
    console.log('Connecting to DB...');
    try {
        await sql.connect(sqlConfig);
        console.log('Connected to DB');

        const request = new sql.Request();
        
        const payload = {};
        
        // 1. Systems
        try {
            console.log('Fetching PRODUKTSYSTEME...');
            const systemsRes = await request.query(`SELECT * FROM PRODUKTSYSTEME`);
            payload.systems = systemsRes.recordset;
        } catch (e) {
            console.error('Failed to fetch PRODUKTSYSTEME:', e.message);
        }

        // 2. Formulas
        try {
            console.log('Fetching PREISE (formulas)...');
            const formulasRes = await request.query(`SELECT * FROM PREISE`);
            payload.formulas = formulasRes.recordset;
        } catch (e) {
            console.error('Failed to fetch PREISE:', e.message);
        }

        // 3. Articles
        try {
            console.log('Fetching ARTIKEL...');
            const articlesRes = await request.query(`SELECT * FROM ARTIKEL`);
            payload.articles = articlesRes.recordset;
        } catch (e) {
            console.error('Failed to fetch ARTIKEL:', e.message);
        }
        
        try {
             console.log('Fetching PREISGRUPPE...');
             const pgRes = await request.query(`SELECT * FROM PREISGRUPPE`);
             payload.price_groups = pgRes.recordset;
        } catch(e) {}
        
        await fs.writeFile('database_tables_dump.json', JSON.stringify(payload, null, 2));
        console.log('Successfully saved database_tables_dump.json (size: ' + (await fs.stat('database_tables_dump.json')).size + ' bytes)');
        
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await sql.close();
        console.log('Finished export!');
    }
}

exportPayload();
