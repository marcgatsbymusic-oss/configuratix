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
        console.log("Connected. Querying Window Typologies (PRODUKTTYP 90) for BITMAPNAME and Profile Linking...");
        
        // 1. Get a few window units and their BITMAPNAME
        const units = await sql.query("SELECT TOP 5 ARTNR, BEZEICHNUNG, BITMAPNAME, HERSTELLERSYSTEM, MATERIALART FROM ARTIKEL WHERE PRODUKTTYP = 90 AND ARTNR LIKE 'F%'");
        console.log("Window Units Samples:", units.recordset);

        // 2. Discover link between units and profiles. Is there a table mapping them?
        // Let's check tables with PROFILE and ASSIGNMENT or SYSTEM
        const tables = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%PROFIL%' OR TABLE_NAME LIKE '%BAUGRUPPE%'");
        console.log("Profile / Assembly related tables:", tables.recordset.map(t => t.TABLE_NAME).slice(0, 15));

        // Let's also check if BITMAPNAME refers to a database table or filesystem
        // Is there a BITMAPS or IMAGES table?
        const imgTables = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%BITMAP%' OR TABLE_NAME LIKE '%IMAGE%' OR TABLE_NAME LIKE '%ICON%'");
        console.log("Image tables:", imgTables.recordset.map(t => t.TABLE_NAME));

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
