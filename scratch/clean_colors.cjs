const fs = require('fs');
const path = require('path');

const cleanFile = (filePath) => {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  if (content.colors) {
    for (const [key, value] of Object.entries(content.colors)) {
      if (typeof value === 'string' && value.endsWith('",')) {
        content.colors[key] = value.slice(0, -2);
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Cleaned up trailing characters in ${filePath}`);
  }
};

cleanFile(path.resolve(__dirname, '../src/locales/en.json'));
cleanFile(path.resolve(__dirname, '../src/locales/es.json'));
