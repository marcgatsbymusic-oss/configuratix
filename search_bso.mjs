import sql from 'mssql/msnodesqlv8.js';

async function search() {
  await sql.connect({
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver: 'msnodesqlv8'
  });
  
  const colsRes = await sql.query(`SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE DATA_TYPE IN ('varchar', 'nvarchar', 'char', 'nchar')`);
  const cols = colsRes.recordset;
  
  for (let c of cols) {
    if (c.TABLE_NAME === 'PROFILING') continue;
    try {
      const q = `SELECT TOP 1 1 FROM [${c.TABLE_NAME}] WHERE [${c.COLUMN_NAME}] = '50001'`;
      const res = await sql.query(q);
      if (res.recordset.length > 0) {
        console.log('FOUND IN:', c.TABLE_NAME, c.COLUMN_NAME);
      }
    } catch(e) {}
  }
  process.exit(0);
}
search();
