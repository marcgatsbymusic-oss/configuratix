import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function run() {
    await sql.connect(sqlConfig);
    console.log('[✓] Connected\n');

    // 1. Find window type catalog tables
    const tables = await sql.query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        AND (
            TABLE_NAME LIKE '%FENST%' OR TABLE_NAME LIKE '%WINTYP%' OR 
            TABLE_NAME LIKE '%TYP%' OR TABLE_NAME LIKE '%ARTIKEL%'
        )
        ORDER BY TABLE_NAME
    `);
    console.log('=== Tables with TYP/FENST/ARTIKEL ===');
    tables.recordset.forEach(t => console.log(' ', t.TABLE_NAME));

    // 2. Look at ARTTAB which is the article/window-type catalog
    try {
        const art = await sql.query(`
            SELECT TOP 5 * FROM ARTTAB WHERE ARTTYP = 'E' ORDER BY ARTNR
        `);
        console.log('\n=== ARTTAB sample (E = window units) ===');
        if (art.recordset.length > 0) {
            console.log('Columns:', Object.keys(art.recordset[0]).join(', '));
            console.log(JSON.stringify(art.recordset[0], null, 2));
        }
    } catch(e) { console.log('ARTTAB not found:', e.message); }

    // 3. Look at FENSTYP table if it exists
    try {
        const ft = await sql.query(`SELECT TOP 10 * FROM FENSTTYP`);
        console.log('\n=== FENSTTYP sample ===');
        console.log('Columns:', Object.keys(ft.recordset[0]).join(', '));
        ft.recordset.forEach(r => console.log(JSON.stringify(r)));
    } catch(e) { console.log('FENSTTYP not found:', e.message); }

    // 4. Look at WINTYP or TYPBEZ
    for (const tbl of ['WINTYP', 'TYPBEZ', 'ARTTYP', 'TYPDESC', 'FELDTYP']) {
        try {
            const r = await sql.query(`SELECT TOP 3 * FROM ${tbl}`);
            console.log(`\n=== ${tbl} ===`);
            console.log('Columns:', Object.keys(r.recordset[0]).join(', '));
        } catch(e) { /* not found */ }
    }

    // 5. Find ANSCHLAG codes from FELDTAB
    const anschlag = await sql.query(`
        SELECT DISTINCT ANSCHLAG, TYPKLASSE, FLUEGELFELD, COUNT(*) cnt 
        FROM FELDTAB 
        WHERE FLUEGELFELD = 'J'
        GROUP BY ANSCHLAG, TYPKLASSE, FLUEGELFELD
        ORDER BY TYPKLASSE, ANSCHLAG
    `);
    console.log('\n=== ANSCHLAG codes per TYPKLASSE (sash fields only) ===');
    anschlag.recordset.forEach(r => console.log(`  TYPKLASSE=${r.TYPKLASSE} ANSCHLAG=${r.ANSCHLAG} cnt=${r.cnt}`));

    // 6. Get a full multi-sash window from FELDTAB to see hierarchy
    const multifeld = await sql.query(`
        SELECT TOP 1 AUFNR, REFPOSNR FROM FELDTAB 
        WHERE HATSOEHNE = 'J' ORDER BY AUFNR DESC
    `);
    if (multifeld.recordset.length > 0) {
        const { AUFNR, REFPOSNR } = multifeld.recordset[0];
        const full = await sql.query(`
            SELECT FELDNR, LFDNR, FENSTNAME, ANSCHLAG, LAGE, FLUEGELFELD, 
                   FFMHOEHE, FFMBREITE, HATSOEHNE, PROFILRICHTUNG, FELDNR2,
                   XA, YA, XE, YE, TYPKLASSE, XM, YM
            FROM FELDTAB 
            WHERE AUFNR=${AUFNR} AND REFPOSNR=${REFPOSNR}
            ORDER BY FELDNR, LFDNR
        `);
        console.log(`\n=== Multi-sash window AUFNR=${AUFNR} full geometry ===`);
        console.log(JSON.stringify(full.recordset, null, 2));
    }

    await sql.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
