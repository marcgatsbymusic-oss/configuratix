import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function run() {
    try {
        await sql.connect(sqlConfig);
        console.log('[✓] Connected to Cantor DB');

        // 1. Get FELDTAB columns
        const cols = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'FELDTAB' 
            ORDER BY ORDINAL_POSITION
        `);
        console.log('\n=== FELDTAB Columns ===');
        cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}`));

        // 2. Get a sample FELDTAB row to understand geometry data
        const samples = await sql.query(`
            SELECT TOP 20
                AUFNR, REFPOSNR, FELDNR, LFDNR,
                FENSTNAME, PROFILNR, ANSCHLAG, LAGE,
                FLUEGELFELD, STULPNACHBAR, VERGLAST,
                FFMHOEHE, FFMBREITE, HATSOEHNE,
                PROFILRICHTUNG, FELDNR2,
                XA, YA, XE, YE, RADIUS,
                TYPKLASSE, XM, YM
            FROM FELDTAB
            ORDER BY AUFNR DESC, REFPOSNR, FELDNR, LFDNR
        `);
        console.log('\n=== Sample FELDTAB rows (latest order) ===');
        console.log(JSON.stringify(samples.recordset, null, 2));

        // 3. Get distinct TYPKLASSE values
        const types = await sql.query(`
            SELECT DISTINCT TYPKLASSE, COUNT(*) as cnt 
            FROM FELDTAB 
            WHERE TYPKLASSE IS NOT NULL AND TYPKLASSE != ''
            GROUP BY TYPKLASSE 
            ORDER BY cnt DESC
        `);
        console.log('\n=== Distinct TYPKLASSE values ===');
        types.recordset.forEach(t => console.log(`  ${t.TYPKLASSE}: ${t.cnt} rows`));

        await sql.close();
    } catch (e) {
        console.error('[x] Error:', e.message);
    }
}

run();
