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

async function exportMatrixTables() {
    console.log('Connecting to DB...');
    try {
        await sql.connect(sqlConfig);
        console.log('Connected to DB');

        const request = new sql.Request();
        
        console.log('Finding matching tables...');
        const broadTablesQuery = `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
              AND (
                  TABLE_NAME LIKE '%PANEL%' OR 
                  TABLE_NAME LIKE '%ROL%' OR 
                  TABLE_NAME LIKE '%ALL_DOD%' OR
                  TABLE_NAME LIKE '%DOD%' 
              )
        `;

        const tablesResult = await request.query(broadTablesQuery);
        const tableNames = tablesResult.recordset.map(r => r.TABLE_NAME);
        
        console.log(`Found ${tableNames.length} matching tables:`, tableNames);

        const payload = {
            metadata: {
                extracted_at: new Date().toISOString(),
                tables_included: tableNames
            },
            data: {}
        };

        for (const tableName of tableNames) {
            try {
                console.log(`Extracting data from ${tableName}...`);
                const tableRes = await request.query(`SELECT * FROM ${tableName}`);
                payload.data[tableName] = tableRes.recordset;
            } catch (e) {
                console.error(`Failed to fetch ${tableName}:`, e.message);
                payload.data[tableName] = { error: e.message };
            }
        }
        
        await fs.writeFile('matrix_tables_dump.json', JSON.stringify(payload, null, 2));
        console.log('Successfully saved matrix_tables_dump.json');
        
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await sql.close();
        console.log('Finished export!');
    }
}

exportMatrixTables();
