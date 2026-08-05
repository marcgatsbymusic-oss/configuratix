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

async function extract() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected to Cantor DB.");

        console.log("Extracting Colors from FARBEN...");
        const colorsQuery = `SELECT FARBE, BEZEICHNUNG FROM FARBEN WHERE STATUS = 1`;
        const colorsResult = await sql.query(colorsQuery);
        
        console.log("Extracting Articles from ARTIKEL (Profiles/Sashes)...");
        const articlesQuery = `SELECT TOP 200 ARTNR, BEZEICHNUNG, PRODUKTTYP FROM ARTIKEL WHERE (BEZEICHNUNG LIKE '%profil%' OR BEZEICHNUNG LIKE '%skrzydlo%' OR BEZEICHNUNG LIKE '%Iglo 5%')`;
        const articlesResult = await sql.query(articlesQuery);
        
        console.log("Extracting Glazing Packages from FF_GLAS...");
        const glassQuery = `SELECT TOP 20 SCHEIBENR, BEZEICHNUNG, STAERKE FROM FF_GLAS`;
        const glassResult = await sql.query(glassQuery);

        console.log("Extracting Glass Panes from GLASS_PANE...");
        const paneQuery = `SELECT TOP 50 ARTICLENO, THICKNESS, GLASSTYPE FROM GLASS_PANE`;
        const paneResult = await sql.query(paneQuery);

        console.log("Extracting Glass Spacers from GLASS_SPACER...");
        const spacerQuery = `SELECT TOP 50 ARTICLENO, THICKNESS, SPACERSTYLE FROM GLASS_SPACER`;
        const spacerResult = await sql.query(spacerQuery);

        console.log("Assembling JSON structure...");
        const outputJSON = {
            product_systems: [
                {
                    cantor_key: "I5S",
                    name: "IGLO 5",
                    type_class: "S11",
                    pricing_group: "P_IG5",
                    base_price: 0,
                    dimensional_constraints: {
                        min_width: 210,
                        max_width: 1576,
                        min_height: 210,
                        max_height: 3078
                    },
                    pricing_rules: [
                        {
                            description: "Kolor - dopłata",
                            rule_type: "PERCENTAGE_SURCHARGE",
                            formula_string: "GRPRS * PMATALL(...)",
                            modifier: 0.15 
                        }
                    ],
                    colors: colorsResult.recordset.map(c => ({
                        cantor_code: c.FARBE,
                        name: c.BEZEICHNUNG
                    })),
                    articles: articlesResult.recordset.map(a => ({
                        article_code: a.ARTNR,
                        name: a.BEZEICHNUNG,
                        product_type: a.PRODUKTTYP
                    })),
                    glazing: glassResult.recordset.map(g => ({
                        cantor_code: g.SCHEIBENR,
                        name: g.BEZEICHNUNG,
                        thickness: g.STAERKE,
                        base_price_modifier: 1.0 + (g.STAERKE / 100) // pseudo logic for surcharge based on thickness
                    })),
                    panes: paneResult.recordset.map(p => ({
                        code: p.ARTICLENO,
                        thickness: p.THICKNESS,
                        glass_type: p.GLASSTYPE
                    })),
                    spacers: spacerResult.recordset.map(s => ({
                        code: s.ARTICLENO,
                        thickness: s.THICKNESS,
                        spacer_style: s.SPACERSTYLE
                    }))
                }
            ]
        };

        const targetPath = path.join(process.cwd(), 'src', 'data', 'iglo5_data.json');
        
        // Ensure directory exists
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(targetPath, JSON.stringify(outputJSON, null, 2), 'utf-8');
        console.log(`Successfully extracted and mapped data to: ${targetPath}`);

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

extract();
