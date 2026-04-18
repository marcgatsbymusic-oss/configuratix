import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    await sql.connect(sqlConfig);

    // Get full ARTIKEL rows for our window codes
    const arts = await sql.query(`
        SELECT ARTNR, BEZEICHNUNG, BEZEICHNUNG2, FELDANZAHL, TUER, STULP, 
               MINBREITE, MINHOEHE, MAXBREITE, MAXHOEHE, BITMAPNAME, 
               MATERIALART, PRODUKTTYP, ELEMENTTYP
        FROM ARTIKEL
        WHERE ARTNR IN ('F100','F104','F105','F106','F200','F300','F350','F401','CV203')
        ORDER BY ARTNR
    `);
    console.log('=== Window type ARTIKEL entries ===');
    arts.recordset.forEach(r => console.log(JSON.stringify(r)));

    // BITMAPNAME is the key! Check what it contains
    // Also: FELDANZAHL tells us how many sashes

    // Now query the BESCHLAG table (fitting catalog) to find ANSCHLAG mappings
    const beschCols = await sql.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'BESCHLAG' ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== BESCHLAG columns ===', beschCols.recordset.map(c=>c.COLUMN_NAME).join(', '));

    const besch = await sql.query(`SELECT TOP 10 * FROM BESCHLAG ORDER BY ARTNR`);
    if (besch.recordset.length) {
        besch.recordset.forEach(r => console.log(JSON.stringify(r)));
    }

    // Also check AUFART which has the sash tree (VATER/KIND hierarchy)
    const aufartCols = await sql.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'AUFART' ORDER BY ORDINAL_POSITION
    `);
    console.log('\n=== AUFART columns ===', aufartCols.recordset.map(c=>c.COLUMN_NAME).join(', '));

    // Sample AUFART for a recent window order
    const aufart = await sql.query(`
        SELECT TOP 30 AUFNR, REFPOSNR, LFDNR, VATER, NEXT, KIND, KINDART, EKZ,
               FENSTNR, BESCHLAG, FFARTNR, BREITE, HOEHE, DREHWINKEL
        FROM AUFART 
        WHERE AUFNR = (SELECT TOP 1 AUFNR FROM AUFART ORDER BY AUFNR DESC)
        ORDER BY LFDNR
    `);
    console.log('\n=== AUFART full tree for latest order ===');
    aufart.recordset.forEach(r => console.log(JSON.stringify(r)));

    await sql.close();
}

run().catch(e => console.error(e.message));
