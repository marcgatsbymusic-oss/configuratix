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

async function extractSystems() {
    try {
        await sql.connect(sqlConfig);
        
        // 1. We will extract fundamental PVC systems
        // In Cantor, main articles are mapped to these variants. 
        // We'll define the main PVC profiles based on common mappings in ALTERNATIVPRODUKTTYPEN we saw
        const systems = [
            { id: "I5", name: "Iglo 5", type: "PVC", description: "Standard 5-chamber PVC profile" },
            { id: "IE", name: "Iglo Energy", type: "PVC", description: "Energy efficient 7-chamber PVC profile" },
            { id: "IP", name: "Iglo Premier", type: "PVC", description: "Premium PVC profile" }
        ];

        // Let's get articles for these systems
        // Any article containing I5O, IEO etc.
        const qArticles = await sql.query(`
            SELECT ARTNR, BEZEICHNUNG, MINBREITE, MINHOEHE, MAXBREITE, MAXHOEHE, BESTELLGRUPPE, PRODUKTTYP, ALTERNATIVPRODUKTTYPEN, BITMAPNAME
            FROM ARTIKEL 
            WHERE ALTERNATIVPRODUKTTYPEN LIKE '%I5%' OR ALTERNATIVPRODUKTTYPEN LIKE '%IE%'
        `);

        // Group articles by System
        let mappedArticles = [];
        for(let art of qArticles.recordset) {
            let supportedSystems = [];
            if(art.ALTERNATIVPRODUKTTYPEN.includes('I5')) supportedSystems.push('I5');
            if(art.ALTERNATIVPRODUKTTYPEN.includes('IE')) supportedSystems.push('IE');
            
            mappedArticles.push({
                id: art.ARTNR,
                name: art.BEZEICHNUNG,
                minWidth: art.MINBREITE,
                minHeight: art.MINHOEHE,
                maxWidth: art.MAXBREITE,
                maxHeight: art.MAXHOEHE,
                image: art.BITMAPNAME,
                systems: supportedSystems
            });
        }

        const outputData = {
            profiles: systems,
            articles: mappedArticles
        };

        const outPath = path.resolve('./scripts/data');
        if(!fs.existsSync(outPath)) fs.mkdirSync(outPath);
        
        fs.writeFileSync(path.join(outPath, 'pvc_profiles.json'), JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`Successfully extracted ${mappedArticles.length} PVC articles mapped to profiles.`);

    } catch (err) {
        console.error("Error executing query:", err.message);
    } finally {
        await sql.close();
    }
}

extractSystems();
