import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Script to verify and extract new single glazing types from the Cantor SQL Database.
 * This ensures that the web configurator stays in sync with any new glass panes added to the ERP.
 */

const QUERY = `
SELECT DISTINCT SZYBA FROM (
    SELECT SZYBA1 AS SZYBA FROM CUSTOM_SZYBY WHERE SZYBA1 != '-' AND SZYBA1 IS NOT NULL
    UNION
    SELECT SZYBA2 AS SZYBA FROM CUSTOM_SZYBY WHERE SZYBA2 != '-' AND SZYBA2 IS NOT NULL
    UNION
    SELECT SZYBA3 AS SZYBA FROM CUSTOM_SZYBY WHERE SZYBA3 != '-' AND SZYBA3 IS NOT NULL
    UNION
    SELECT SZYBA4 AS SZYBA FROM CUSTOM_SZYBY WHERE SZYBA4 != '-' AND SZYBA4 IS NOT NULL
) AS AllSzyby
ORDER BY SZYBA
`;

const SCRIPT_DIR = path.resolve('.agents/skills/cantor-access/scripts/queryCantor.mjs');
const OUTPUT_FILE = path.resolve('src/data/cantor_single_glazings.json');
const TEMP_SQL_FILE = path.resolve('scripts/temp_glazing_query.sql');

try {
  console.log('Querying Cantor Database for distinct single glazing panes...');
  
  // Save query to file for Windows shell compatibility
  fs.writeFileSync(TEMP_SQL_FILE, QUERY, 'utf8');
  
  // Run the cantor query skill script
  const stdout = execSync(`node "${SCRIPT_DIR}" "${TEMP_SQL_FILE}"`, { encoding: 'utf-8' });
  const data = JSON.parse(stdout);
  
  const panes = data.map(row => row.SZYBA);
  
  console.log(`Found ${panes.length} distinct single glazing panes.`);
  
  // Optionally compare with existing to find "new" ones
  let existingPanes = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existingPanes = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }
  
  const newPanes = panes.filter(p => !existingPanes.includes(p));
  if (newPanes.length > 0 && existingPanes.length > 0) {
    console.log(`\nNew panes detected in Cantor:`, newPanes);
  } else if (existingPanes.length === 0) {
    console.log(`\nInitial extraction of ${panes.length} panes.`);
  } else {
    console.log('\nNo new panes detected. Configurator is up to date.');
  }

  // Save the latest to a json file
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(panes, null, 2));
  console.log(`\nSaved updated glazing list to ${OUTPUT_FILE}`);

} catch (error) {
  console.error('Error querying Cantor DB:', error.message);
  if (error.stdout) console.log('STDOUT:', error.stdout);
} finally {
  if (fs.existsSync(TEMP_SQL_FILE)) {
    fs.unlinkSync(TEMP_SQL_FILE);
  }
}

