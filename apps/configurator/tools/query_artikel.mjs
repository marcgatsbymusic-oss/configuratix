import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    await sql.connect(sqlConfig);

    // Look for where window types (F104, F100, etc.) are catalogued
    // These are the ARTNR values in AUFPOS
    const artnrs = await sql.query(`
        SELECT DISTINCT ARTNR FROM AUFPOS 
        WHERE ARTTYP = 'E'
        ORDER BY ARTNR
    `);
    console.log('=== Window article codes (ARTTYP=E) from orders ===');
    artnrs.recordset.forEach(r => console.log(' ', r.ARTNR));

    // Look at ARTIKEL table (the master article catalog)
    const artCols = await sql.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ARTIKEL' ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== ARTIKEL columns ===');
    console.log(artCols.recordset.map(c => c.COLUMN_NAME).join(', '));

    // Sample ARTIKEL for window types
    const artSample = await sql.query(`
        SELECT TOP 20 ARTNR, BEZEICHNUNG, ARTTYP, BESCHAUSF
        FROM ARTIKEL
        WHERE ARTTYP IN ('E','F','W')
        ORDER BY ARTNR
    `);
    console.log('\n=== ARTIKEL sample (E/F/W types) ===');
    artSample.recordset.forEach(r => console.log(JSON.stringify(r)));

    // Check PRODTYP - may define the global window type definitions  
    const prodtyp = await sql.query(`SELECT TOP 10 * FROM PRODTYP`);
    console.log('\n=== PRODTYP ===');
    if (prodtyp.recordset.length > 0) {
        console.log('Columns:', Object.keys(prodtyp.recordset[0]).join(', '));
        prodtyp.recordset.forEach(r => console.log(JSON.stringify(r)));
    }

    // Check AUFTYPEN
    const auftypen = await sql.query(`SELECT TOP 10 * FROM AUFTYPEN`);
    console.log('\n=== AUFTYPEN ===');
    if (auftypen.recordset.length > 0) {
        console.log('Columns:', Object.keys(auftypen.recordset[0]).join(', '));
        auftypen.recordset.forEach(r => console.log(JSON.stringify(r)));
    }

    // Check if there's a BESCHLAG/fitting table linking ARTNR to typology
    const beschlag = await sql.query(`
        SELECT TOP 5 COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'BESCHLAG' ORDER BY ORDINAL_POSITION
    `);
    if (beschlag.recordset.length > 0) {
        console.log('\n=== BESCHLAG columns ===');
        console.log(beschlag.recordset.map(c => c.COLUMN_NAME).join(', '));
        const bs = await sql.query(`SELECT TOP 10 * FROM BESCHLAG WHERE ARTNR IN ('F100','F104','F200')`);
        bs.recordset.forEach(r => console.log(JSON.stringify(r)));
    }

    await sql.close();
}

run().catch(e => console.error(e.message));
