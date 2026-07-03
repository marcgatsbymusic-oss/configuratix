import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';
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
        console.log("Connected to Cantor database.");

        const query = `
            SELECT 
                a.ARTNR, 
                a.BEZEICHNUNG, 
                a.BEZEICHNUNG2, 
                a.BEZEICHNUNG3,
                a.FELDANZAHL, 
                a.TUER, 
                a.STULP,
                b.FENSTNR, 
                b.BESCHLAG, 
                b.LFDNR, 
                b.VATER, 
                b.KIND, 
                b.KINDART, 
                b.EKZ
            FROM ARTIKEL a
            LEFT JOIN ARTBAUM b ON a.ARTNR = b.ARTNR
            WHERE a.PRODUKTTYP = 90
            ORDER BY a.ARTNR, b.LFDNR
        `;

        const result = await sql.query(query);
        const rows = result.recordset;
        console.log(`Retrieved ${rows.length} raw rows.`);

        // Group rows by ARTNR
        const articles = {};
        for (const row of rows) {
            if (!articles[row.ARTNR]) {
                articles[row.ARTNR] = {
                    code: row.ARTNR,
                    name: row.BEZEICHNUNG,
                    name2: row.BEZEICHNUNG2,
                    name3: row.BEZEICHNUNG3,
                    fieldCount: row.FELDANZAHL,
                    isDoor: row.TUER,
                    isStulp: row.STULP,
                    nodes: []
                };
            }
            if (row.LFDNR !== null) {
                articles[row.ARTNR].nodes.push({
                    lfdnr: row.LFDNR,
                    vater: row.VATER,
                    kind: row.KIND,
                    kindart: row.KINDART,
                    ekz: row.EKZ,
                    fenstnr: row.FENSTNR,
                    beschlag: row.BESCHLAG
                });
            }
        }

        // Format and generate CSV / text
        let csvLines = [
            "Code,Name,Name2,FieldCount,IsDoor,IsStulp,PostType,OpeningPerField"
        ];

        let txtLines = [];

        for (const artnr of Object.keys(articles).sort()) {
            const art = articles[artnr];
            
            // Determine post type and opening per field
            // Post type: if there are nodes with vertical/horizontal splits or stulp
            let postTypes = [];
            const splits = art.nodes.filter(n => n.kindart === 'V' || n.kindart === 'H');
            for (const split of splits) {
                if (split.kindart === 'V') postTypes.push("Vertical Mullion");
                if (split.kindart === 'H') postTypes.push("Transom");
            }
            if (art.isStulp === 'J' || art.isStulp === 'Y') {
                postTypes.push("Movable Post (Stulp)");
            }
            const postTypeStr = postTypes.length > 0 ? postTypes.join(" + ") : "None (Single Field)";

            // Opening per field: find leaf nodes with FENSTNR > 0 and BESCHLAG
            const sashes = art.nodes
                .filter(n => n.fenstnr > 0 && n.beschlag)
                .sort((a, b) => a.fenstnr - b.fenstnr);
            
            const openings = sashes.map(s => `F${s.fenstnr}: ${s.beschlag}`).join(" | ");

            const csvRow = [
                art.code,
                `"${(art.name || '').replace(/"/g, '""')}"`,
                `"${(art.name2 || '').replace(/"/g, '""')}"`,
                art.fieldCount,
                art.isDoor === 'J' || art.isDoor === 'Y' ? "Yes" : "No",
                art.isStulp === 'J' || art.isStulp === 'Y' ? "Yes" : "No",
                postTypeStr,
                openings || "None"
            ].join(",");

            csvLines.push(csvRow);

            txtLines.push(`Code: ${art.code}`);
            txtLines.push(`Name: ${art.name}`);
            if (art.name2) txtLines.push(`Name2: ${art.name2}`);
            txtLines.push(`Fields: ${art.fieldCount} | IsDoor: ${art.isDoor} | IsStulp: ${art.isStulp}`);
            txtLines.push(`Post Type: ${postTypeStr}`);
            txtLines.push(`Openings: ${openings || "None"}`);
            txtLines.push("-".repeat(40));
        }

        const csvContent = csvLines.join("\n");
        const txtContent = txtLines.join("\n");

        await fs.writeFile("scratch/window_types_catalog.csv", csvContent, "utf-8");
        await fs.writeFile("scratch/window_types_catalog.txt", txtContent, "utf-8");
        console.log("Exported scratch/window_types_catalog.csv and scratch/window_types_catalog.txt successfully.");

        // Output some sample rows to console
        console.log("\nSample CSV Output (first 15 rows):\n");
        console.log(csvLines.slice(0, 15).join("\n"));

    } catch (err) {
        console.error("Error during extraction:", err);
    } finally {
        await sql.close();
    }
}

run();
