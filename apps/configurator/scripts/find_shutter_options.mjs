import { execSync } from 'child_process';

async function queryCantor(query) {
  const q = query.replace(/"/g, '\\"');
  try {
    const output = execSync(`node .agents/skills/cantor-access/scripts/queryCantor.mjs "${q}"`, { encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (e) {
    throw e;
  }
}

async function searchTable(tableName, columnName, searchTerm) {
  try {
    const q = `SELECT TOP 5 * FROM ${tableName} WHERE ${columnName} LIKE '%${searchTerm}%'`;
    const res = await queryCantor(q);
    if (res.length > 0) {
      console.log(`\nFound '${searchTerm}' in ${tableName}.${columnName}:`);
      console.log(res);
    }
  } catch (e) {
    // Ignore errors for invalid columns/tables
  }
}

async function run() {
  console.log("Searching for ALU37, RNV, Type 01...");
  
  const tables = ['ARTIKEL', 'TEXTE', 'PMATZEILEN', 'PMATSPALTEN', 'VARFLDZUORD', 'ENTRYVARIANT', 'PREISMAT', 'WERTELISTEN_EINTRAG'];
  const columns = ['ARTNR', 'BEZEICHNUNG', 'TEXT', 'POSITIONSTEXT', 'WERT', 'NAME', 'VARNAME', 'KLASSE1', 'KLASSE2'];
  const terms = ['ALU37', 'ALU 37', 'RNV', 'Type 01', 'Type: 01'];

  for (const table of tables) {
    for (const column of columns) {
      for (const term of terms) {
        await searchTable(table, column, term);
      }
    }
  }
  
  console.log("Done.");
}

run();
