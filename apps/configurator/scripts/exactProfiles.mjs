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

async function exactProfiles() {
    try {
        await sql.connect(sqlConfig);
        
        const q1 = await sql.query(`SELECT TOP 50 ARTNR, BEZEICHNUNG, PRODUKTTYP, ELEMENTTYP, BEMASSUNGSART, ALTERNATIVPRODUKTTYPEN FROM ARTIKEL WHERE BEZEICHNUNG LIKE '%Iglo 5%' OR BEZEICHNUNG LIKE '%Iglo Energy%'`);
        
        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\iglo_articles.json', JSON.stringify(q1.recordset, null, 2), 'utf8');
        console.log("Wrote Iglo Articles");

        // Finding distinct groups or systems linked to Iglo
        const q2 = await sql.query(`SELECT DISTINCT PRODUKTTYP, (SELECT TOP 1 BEZEICHNUNG FROM PRODUKTSYSTEME WHERE PRODUKTSYSTEM = CAST(a.PRODUKTTYP AS varchar)) as sys FROM ARTIKEL a WHERE BEZEICHNUNG LIKE '%Iglo%'`);
        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\iglo_types.json', JSON.stringify(q2.recordset, null, 2), 'utf8');

    } catch (err) {
        console.error("Error executing query:", err.message);
    } finally {
        await sql.close();
    }
}

exactProfiles();
