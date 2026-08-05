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

async function startTrace() {
    try {
        if (!fs.existsSync('C:\\Temp')) fs.mkdirSync('C:\\Temp');
        
        await sql.connect(sqlConfig);
        
        try {
            await sql.query(`IF EXISTS (SELECT * FROM sys.server_event_sessions WHERE name = 'CantorTrace')
                             DROP EVENT SESSION [CantorTrace] ON SERVER`);
        } catch(e) {}

        console.log("Setting up Extended Events session...");
        
        const createSessionQuery = `
        CREATE EVENT SESSION [CantorTrace] ON SERVER 
        ADD EVENT sqlserver.sql_statement_completed(
            ACTION(sqlserver.sql_text, sqlserver.database_name)
            WHERE ([sqlserver].[database_name]=N'DRUTEX_DEALER')
        ),
        ADD EVENT sqlserver.rpc_completed(
            ACTION(sqlserver.sql_text, sqlserver.database_name)
            WHERE ([sqlserver].[database_name]=N'DRUTEX_DEALER')
        )
        ADD TARGET package0.event_file(SET filename=N'C:\\Temp\\CantorTrace', max_file_size=5)
        WITH (MAX_MEMORY=4096 KB, EVENT_RETENTION_MODE=ALLOW_SINGLE_EVENT_LOSS, MAX_DISPATCH_LATENCY=1 SECONDS)
        `;
        
        await sql.query(createSessionQuery);
        console.log("Starting session...");
        await sql.query(`ALTER EVENT SESSION [CantorTrace] ON SERVER STATE = START`);
        
        console.log("Trace started successfully and is logging to C:\\Temp\\CantorTrace*.xel");
        
    } catch (err) {
        console.error("Error setting up trace:", err);
    } finally {
        await sql.close();
    }
}
startTrace();
