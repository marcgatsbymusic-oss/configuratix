const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../tests/pricing/goldens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (data.input && data.input.glazing && !data.input.infills) {
    data.input.infills = [data.input.glazing];
    delete data.input.glazing;
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Migrated ${file}`);
  }
}
