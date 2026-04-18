import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function generateDBMap() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected. Fetching tables...");
        
        const tablesQuery = `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `;
        const tablesResult = await sql.query(tablesQuery);
        const tables = tablesResult.recordset.map(r => r.TABLE_NAME);
        
        console.log(`Found ${tables.length} tables. Fetching columns...`);
        const columnsQuery = `
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `;
        const columnsResult = await sql.query(columnsQuery);
        
        const schema = {};
        for (const row of columnsResult.recordset) {
            if (!schema[row.TABLE_NAME]) {
                schema[row.TABLE_NAME] = [];
            }
            let typeStr = row.DATA_TYPE;
            if (row.CHARACTER_MAXIMUM_LENGTH) {
                if (row.CHARACTER_MAXIMUM_LENGTH === -1) {
                    typeStr += '(MAX)';
                } else {
                    typeStr += `(${row.CHARACTER_MAXIMUM_LENGTH})`;
                }
            }
            schema[row.TABLE_NAME].push({
                name: row.COLUMN_NAME,
                type: typeStr
            });
        }
        
        let md = '# Cantor Database Schema Map\\n\\n';
        md += 'This document maps the A+W Cantor SQL Database (`DRUTEX_DEALER`) schema for future reference.\\n\\n';
        
        const keywords = ['SYSTEM', 'ARTIKEL', 'PREIS', 'PREISE', 'PREISGRUPPE', 'FORMEL', 'RESTRIKTION', 'BEZEICHNUNG'];
        
        const prioritizedTables = [];
        const otherTables = [];
        
        for (const t of tables) {
            if (keywords.some(k => t.toUpperCase().includes(k))) {
                prioritizedTables.push(t);
            } else {
                otherTables.push(t);
            }
        }
        
        md += '## Core Configurator Tables\\n\\n';
        md += 'Tabeles matching critical keywords (SYSTEM, ARTIKEL, PREIS, FORMEL, RESTRIKTION).\\n\\n';
        
        for (const t of prioritizedTables) {
            md += `### ${t}\\n`;
            md += '| Column | Type |\\n';
            md += '| ------ | ---- |\\n';
            for (const c of (schema[t] || [])) {
                md += `| \`${c.name}\` | ${c.type} |\\n`;
            }
            md += '\\n';
        }
        
        md += '## Other Tables\\n\\n';
        md += '<details><summary>Click to expand all other tables</summary>\\n\\n';
        for (const t of otherTables) {
            md += `### ${t}\\n`;
            md += '| Column | Type |\\n';
            md += '| ------ | ---- |\\n';
            for (const c of (schema[t] || [])) {
                md += `| \`${c.name}\` | ${c.type} |\\n`;
            }
            md += '\\n';
        }
        md += '</details>\\n';
        
        const outputPath = '.agents/skills/cantor-access/resources/cantor_db_map.md';
        await fs.writeFile(outputPath, md);
        console.log(`Markdown map successfully written to ${outputPath}`);
    } catch (err) {
        console.error("SQL Error:", err.message || err);
    } finally {
        await sql.close();
    }
}

generateDBMap();
