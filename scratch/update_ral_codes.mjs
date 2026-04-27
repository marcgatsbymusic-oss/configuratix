import fs from 'fs';
import path from 'path';

const doorsLocalesPath = path.resolve('scratch/doors_locales.json');
const enLocalesPath = path.resolve('src/locales/en.json');
const esLocalesPath = path.resolve('src/locales/es.json');

const doorsLocalesStr = fs.readFileSync(doorsLocalesPath, 'utf8');

// Find all matches of "RAL-XXXX Name" or "RAL XXXX Name"
const ralRegex = /RAL[- ]?(\d{4})\s+(.+)/ig;
const ralMap = new Map();

let match;
while ((match = ralRegex.exec(doorsLocalesStr)) !== null) {
  const code = match[1];
  const name = match[2].trim().toLowerCase();
  ralMap.set(name, `RAL ${code} ${match[2].trim()}`);
}

function updateLocales(filepath) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let updatedCount = 0;

  if (data.colors) {
    for (const [key, value] of Object.entries(data.colors)) {
      if (key.startsWith('ral-')) {
        const lowerValue = value.toLowerCase().replace(/^ral[- ]?\d{4}\s+/i, '').replace(/ \(ral \d{4}\)$/i, '').trim();
        if (updatedCount < 2) console.log(`Checking: '${lowerValue}' against ralMap. Has? ${ralMap.has(lowerValue)}`);
        
        // Let's also check if there are exact matches ignoring quotes
        let foundKey = lowerValue;
        if (!ralMap.has(lowerValue)) {
           // Try to find it by fuzzy matching
           for (const mapKey of ralMap.keys()) {
              if (mapKey.includes(lowerValue) || lowerValue.includes(mapKey)) {
                 foundKey = mapKey;
                 break;
              }
           }
        }
        
        if (ralMap.has(foundKey)) {
          const newVal = ralMap.get(foundKey);
          if (data.colors[key] !== newVal) {
             data.colors[key] = newVal;
             updatedCount++;
          }
        }
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${updatedCount} colors in ${path.basename(filepath)}`);
  } else {
    console.log(`No colors updated in ${path.basename(filepath)}`);
  }
}

updateLocales(enLocalesPath);
updateLocales(esLocalesPath);
