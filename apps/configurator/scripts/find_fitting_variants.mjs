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
        console.log("Connected. Searching all text columns for 'FIX-S'...");

        // Find all varchar/nvarchar columns
        const cols = await sql.query(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE DATA_TYPE IN ('varchar', 'nvarchar', 'char', 'nchar')
        `);

        // Group by table
        const tableMap = {};
        for(const row of cols.recordset) {
            if(!tableMap[row.TABLE_NAME]) tableMap[row.TABLE_NAME] = [];
            tableMap[row.TABLE_NAME].push(row.COLUMN_NAME);
        }

        let foundTables = [];
        for(const [table, columns] of Object.entries(tableMap)) {
            if(table.startsWith('sys') || table.includes('LOG')) continue;
            
            const whereClause = columns.map(c => `[${c}] LIKE '%FIX-S%'`).join(' OR ');
            try {
                const query = `SELECT TOP 5 * FROM [${table}] WHERE ${whereClause}`;
                const result = await sql.query(query);
                if(result.recordset.length > 0) {
                    console.log(`Found in table ${table}:`);
                    console.log(result.recordset);
                    foundTables.push(table);
                }
            } catch(e) { }
        }
        
        console.log("Found in tables:", foundTables);

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
run();
