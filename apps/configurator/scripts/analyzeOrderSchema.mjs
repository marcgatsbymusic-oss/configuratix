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

async function checkOrders() {
    try {
        console.log("Connecting to A+W Cantor SQL Database...");
        await sql.connect(sqlConfig);
        
        console.log("Fetching the layout of the last generated Order...");
        
        // Fetch the most recent Order Header
        const headerResult = await sql.query(`SELECT TOP 1 * FROM AUFKOPF ORDER BY AUFNR DESC`);
        if(headerResult.recordset.length === 0) {
            console.log("No orders found.");
            return;
        }
        const orderId = headerResult.recordset[0].AUFNR;
        
        // Fetch specific positions for this order
        const posResult = await sql.query(`SELECT * FROM AUFPOS WHERE AUFNR = '${orderId}'`);
        
        // Fetch article details for this order
        const artResult = await sql.query(`SELECT * FROM AUFARTIK WHERE AUFNR = '${orderId}'`);
        
        const payload = {
            OrderHeader: headerResult.recordset[0],
            OrderPositions: posResult.recordset,
            OrderArticles: artResult.recordset
        };
        
        console.log(`\n=== SUCCESS: EXTRACTED MASTER SCHEMA FOR LAST ORDER ===`);
        console.log(`Order ID: ${orderId}`);
        console.log(`Positions Count: ${payload.OrderPositions.length}`);
        console.log(`Article Details Count: ${payload.OrderArticles.length}`);
        
        await fs.writeFile('C:\\Users\\Shadow\\AppData\\Local\\Temp\\LastOrderStructure.json', JSON.stringify(payload, null, 2));
        console.log(`\nFull JSON Schema of the Order has been saved to: C:\\Users\\Shadow\\AppData\\Local\\Temp\\LastOrderStructure.json`);
        
    } catch (err) {
        console.error("Error analyzing orders:", err);
    } finally {
        await sql.close();
    }
}

checkOrders();
