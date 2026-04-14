import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'master',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function stopTrace() {
    try {
        await sql.connect(sqlConfig);
        
        console.log("Stopping trace session...");
        try {
            await sql.query(`ALTER EVENT SESSION [CantorTrace] ON SERVER STATE = STOP`);
        } catch(e) { console.log("Trace might already be stopped."); }

        console.log("Reading trace file...");
        const readQuery = `
        SELECT 
            CAST(event_data AS XML) AS event_data
        FROM sys.fn_xe_file_target_read_file('C:\\Temp\\CantorTrace*.xel', NULL, NULL, NULL)
        `;
        const result = await sql.query(readQuery);
        
        const statements = [];
        for (const row of result.recordset) {
            const xml = row.event_data && row.event_data.toString();
            if (!xml) continue;
            
            const match = xml.match(/<action name="sql_text" package="sqlserver">\s*<value><!\[CDATA\[([\s\S]*?)\]\]><\/value>/);
            const match2 = xml.match(/<data name="statement">\s*<value><!\[CDATA\[([\s\S]*?)\]\]><\/value>/);
            
            let stmt = match ? match[1] : (match2 ? match2[1] : null);
            if (stmt && (stmt.toUpperCase().includes('INSERT ') || stmt.toUpperCase().includes('UPDATE '))) {
                statements.push(stmt.trim());
            }
        }
        
        console.log(`Found ${statements.length} relevant modifying statements.`);
        
        fs.writeFileSync('C:\\Temp\\CantorTraceResults.txt', statements.join('\n\n====================\n\n'));
        console.log("Results saved to C:\\Temp\\CantorTraceResults.txt");
        
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}
stopTrace();
