const fs = require('fs');
const path = require('path');

const dirPath = 'src/data/profiles/IGLO5';
const files = fs.readdirSync(dirPath);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const keys = Object.keys(data.profiles || data.layers || {});
    const gskKeys = keys.filter(k => k.includes('GSK_SSH'));
    if (gskKeys.length > 0) {
      console.log(`${file}:`, gskKeys);
    }
  }
});
