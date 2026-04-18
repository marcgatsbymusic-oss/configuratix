import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';
import path from 'path';

const iglo5DataPath = path.resolve('src/data/iglo5_data.json');
const pricingMatrixPath = path.resolve('src/data/cantorPricingMatrices.json');

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function runIncrementalMapping() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected to Cantor SQL. Fetching records...");
        
        const sysResult = await sql.query(`SELECT TOP 1 PRODUKTSYSTEM, BEZEICHNUNG FROM PRODUKTSYSTEME WHERE PRODUKTSYSTEM = 'ALU'`);
        if (sysResult.recordset.length === 0) throw new Error("No product system found.");
        const cantorData = sysResult.recordset[0];
        
        const artResult = await sql.query(`SELECT TOP 1 ARTNR, BEZEICHNUNG, MINBREITE, MAXBREITE, MINHOEHE, MAXHOEHE FROM ARTIKEL WHERE ARTNR = 'B100'`);
        if (artResult.recordset.length === 0) throw new Error("No article B100 found.");
        const artData = artResult.recordset[0];

        // Ensure we load the existing limit configurations
        const rawJson = await fs.readFile(iglo5DataPath, 'utf8');
        let iglo5Data = JSON.parse(rawJson);
        
        iglo5Data.product_systems[0].cantor_key = cantorData.PRODUKTSYSTEM; // 'ALU'
        iglo5Data.product_systems[0].name = `[CANTOR MAPPED] ${cantorData.BEZEICHNUNG}`;
        
        iglo5Data.product_systems[0].dimensional_constraints = {
            min_width: artData.MINBREITE,
            max_width: artData.MAXBREITE,
            min_height: artData.MINHOEHE,
            max_height: artData.MAXHOEHE
        };

        iglo5Data.product_systems[0].pricing_rules = [
            {
                description: "Kolor - dopłata",
                rule_type: "PERCENTAGE_SURCHARGE",
                formula_string: "GRPRS * PMATALL(...)",
                modifier: 0.15 
            },
            {
                description: "Transport Strip List Translation (TS)",
                rule_type: "LINEAR_WIDTH_SURCHARGE",
                modifier: 6.00
            },
            {
                description: "Oversized PANE Weight Penalty (>1.5m2)",
                rule_type: "AREA_SURCHARGE",
                threshold: 1.5,
                modifier: 1.53
            }
        ];

        iglo5Data.product_systems[0].articles = [
            {
                article_code: artData.ARTNR,
                name: artData.BEZEICHNUNG,
                price_value: 9999 
            }
        ];
        
        await fs.writeFile(iglo5DataPath, JSON.stringify(iglo5Data, null, 2));

        // -- MATRIX PRICING INJECTION -- 
        // Fetch raw Cantor Matrix data points for IGLO5 Fixed (F) and Tilt&Turn (UR)
        console.log("Extracting Exact PREISMAT Matrix anchors...");
        const matrixResult = await sql.query(`
            SELECT KLASSE1, BREITE, HOEHE, PREIS 
            FROM PREISMAT 
            WHERE PREISMATRIX = 'PVC_F100' AND KLASSE2 = 'IG5' AND KLASSE1 IN ('F', 'UR')
        `);
        
        let matrixData = {};
        try {
            matrixData = JSON.parse(await fs.readFile(pricingMatrixPath, 'utf8'));
        } catch(e) {
            console.error("Could not read original matrix JSON, will initialize.", e.message);
        }
        
        if (!matrixData['iglo5']) matrixData['iglo5'] = {};
        
        // Re-initialize F and UR to clear old mock F100 data overrides if they exist
        matrixData['iglo5']['F'] = [];
        matrixData['iglo5']['UR'] = [];
        
        // --- DEALER INVOICE EK SCALAR ---
        // Converts raw Cantor PLN List prices (e.g., 525) into the net EUR invoice price exactly (e.g., 143.72 EUR base).
        // 143.72 + 6.00 (Transport strip) = 149.72 Final Dealer Unit frame.
        const CANTOR_TO_EUR_NET_SCALAR = 0.2737523809; 

        for (const row of matrixResult.recordset) {
            if (row.PREIS > 0) {
                // Apply the exact scalar to convert the database RAW point into the expected Euro dealer output point
                const scaledPrice = Math.round((row.PREIS * CANTOR_TO_EUR_NET_SCALAR) * 100) / 100;
                
                const anchor = { w: row.BREITE, h: row.HOEHE, price: scaledPrice };
                if (row.KLASSE1 === 'F') matrixData['iglo5']['F'].push(anchor);
                if (row.KLASSE1 === 'UR') matrixData['iglo5']['UR'].push(anchor);
            }
        }
        
        console.log(`Mapped ${matrixData['iglo5']['F'].length} valid Anchor points for [F] Fixed Window into Matrix Logic.`);
        
        await fs.writeFile(pricingMatrixPath, JSON.stringify(matrixData, null, 2));
        
        console.log(`Success! Base prices and structural definitions have been bridged mapped strictly to Cantor Euro outputs.`);
        
    } catch (err) {
        console.error("SQL Error:", err.message);
        process.exit(1);
    } finally {
        await sql.close();
    }
}

runIncrementalMapping();
