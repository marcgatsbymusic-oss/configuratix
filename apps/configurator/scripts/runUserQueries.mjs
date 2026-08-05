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

async function runQueries() {
    console.log('Connecting to database...');
    let pool;
    try {
        pool = await sql.connect(sqlConfig);
    } catch (e) {
        console.error('Connection failed', e);
        return;
    }

    try {
        // Query 1: Tables
        console.log('Running Query 1: Tables...');
        const q1 = `
            SELECT 
                t.TABLE_NAME,
                p.rows AS [RowCount]
            FROM INFORMATION_SCHEMA.TABLES t
            JOIN sys.partitions p ON p.object_id = OBJECT_ID(t.TABLE_NAME)
            WHERE t.TABLE_TYPE = 'BASE TABLE' AND p.index_id IN (0,1)
            ORDER BY p.rows DESC;
        `;
        const res1 = await pool.query(q1);
        await fs.writeFile('query1_tables.json', JSON.stringify(res1.recordset, null, 2));

        // Query 2: Columns
        console.log('Running Query 2: Columns...');
        const q2 = `
            SELECT 
                TABLE_NAME, COLUMN_NAME, DATA_TYPE, 
                CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_NAME, ORDINAL_POSITION;
        `;
        const res2 = await pool.query(q2);
        await fs.writeFile('query2_columns.json', JSON.stringify(res2.recordset, null, 2));

        // Query 3: Foreign Keys
        console.log('Running Query 3: Foreign Keys...');
        const q3 = `
            SELECT 
                fk.name AS FK_Name,
                tp.name AS ParentTable,
                cp.name AS ParentColumn,
                tr.name AS ReferencedTable,
                cr.name AS ReferencedColumn
            FROM sys.foreign_keys fk
            JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
            JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
            JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
            JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
            JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id;
        `;
        const res3 = await pool.query(q3);
        await fs.writeFile('query3_fks.json', JSON.stringify(res3.recordset, null, 2));

        console.log('Queries complete. Results saved to query1_tables.json, query2_columns.json, and query3_fks.json');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.close();
    }
}

runQueries();
