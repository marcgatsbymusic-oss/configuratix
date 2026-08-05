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

async function checkArticles() {
    try {
        await sql.connect(sqlConfig);
        
        // Find main window typologies that represent whole systems
        console.log("Searching ARTIKEL with Elementtyp filtering:");
        const q1 = await sql.query(`
            SELECT TOP 200 ARTNR, BEZEICHNUNG, PRODUKTTYP, ELEMENTTYP, BEMASSUNGSART, ALTERNATIVPRODUKTTYPEN 
            FROM ARTIKEL 
            WHERE 
                BEZEICHNUNG LIKE '%PVC%' OR 
                ALTERNATIVPRODUKTTYPEN LIKE '%I5%' OR 
                ALTERNATIVPRODUKTTYPEN LIKE '%IE%' OR 
                ARTNR LIKE 'O%' OR
                BEZEICHNUNG LIKE '%Iglo%'
        `);
        
        fs.writeFileSync('c:\\Users\\Shadow\\AppData\\Local\\Temp\\potential_pvc_articles.json', JSON.stringify(q1.recordset, null, 2), 'utf8');
        console.log(`Extracted ${q1.recordset.length} potential PVC articles to temp file.`);

    } catch (err) {
        console.error("Error executing query:", err.message);
    } finally {
        await sql.close();
    }
}

checkArticles();
