import sql from 'mssql/msnodesqlv8.js';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function inspectFunction() {
    try {
        await sql.connect(sqlConfig);
        
        // Find routines matching fn_SystemCeny or similar
        const query = `
            SELECT ROUTINE_NAME, ROUTINE_DEFINITION 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE='FUNCTION' AND ROUTINE_NAME LIKE '%fn_SystemCeny%'
        `;
        const result = await sql.query(query);
        
        if (result.recordset.length > 0) {
            console.log("Found function:", result.recordset[0].ROUTINE_NAME);
            console.log(result.recordset[0].ROUTINE_DEFINITION.substring(0, 1000));
        } else {
            console.log("Function fn_SystemCeny not found as SQL function. Might be a Cantor internal script function.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

inspectFunction();
