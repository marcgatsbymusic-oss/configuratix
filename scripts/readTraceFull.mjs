import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'master',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
};

async function readTraceFull() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`SELECT CAST(event_data AS XML) AS event_data FROM sys.fn_xe_file_target_read_file('C:\\Temp\\CantorTrace*.xel', NULL, NULL, NULL)`);
        
        let allOutput = "";
        for (const row of result.recordset) {
            allOutput += row.event_data + "\n\n";
        }
        
        fs.writeFileSync('C:\\Temp\\AllTrace.txt', allOutput);
        console.log(`Wrote ${result.recordset.length} events to C:\\Temp\\AllTrace.txt`);
    } catch(e) { console.error(e) } finally { await sql.close(); }
}
readTraceFull();
