const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enFilePath = path.join(localesDir, 'en.json');
const esFilePath = path.join(localesDir, 'es.json');

// Read English and Spanish files as sources
const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
const esData = JSON.parse(fs.readFileSync(esFilePath, 'utf8'));

const enBlueprint = enData.configurator.blueprint;
const esBlueprint = esData.configurator.blueprint;

// Get all files in locales
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file === 'en.json' || file === 'es.json') return;
  if (!file.endsWith('.json')) return;

  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.configurator) {
      data.configurator = {};
    }
    if (!data.configurator.blueprint) {
      data.configurator.blueprint = {};
    }

    // List of keys to copy
    const keysToCopy = [
      'exteriorView',
      'uploadPhoto',
      'removePhoto',
      'positionOptions',
      'resetWindowFit',
      'scale',
      'horizontal',
      'vertical'
    ];

    // Decide whether to use Spanish or English for romance/other languages if we want,
    // otherwise fallback to English. We'll fallback to English for a clean implementation.
    keysToCopy.forEach(key => {
      if (!data.configurator.blueprint[key]) {
        data.configurator.blueprint[key] = enBlueprint[key];
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Successfully synchronized ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});
console.log('Translation sync complete.');
