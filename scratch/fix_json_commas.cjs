const fs = require('fs');

function fixJsonFile(filePath) {
  let txt = fs.readFileSync(filePath, 'utf8');
  // Remove trailing commas before closing brackets and braces
  txt = txt.replace(/,\s*\]/g, '\n    ]');
  txt = txt.replace(/,\s*\}/g, '\n  }');
  
  try {
    JSON.parse(txt); // Verify it parses
    fs.writeFileSync(filePath, txt);
    console.log('Fixed JSON in', filePath);
  } catch (e) {
    console.error('Still broken:', filePath, e.message);
  }
}

fixJsonFile('src/locales/en.json');
fixJsonFile('src/locales/es.json');
