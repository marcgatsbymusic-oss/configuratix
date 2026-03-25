import fs from 'fs';
import path from 'path';

const inputData = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const locales = Object.keys(inputData);

// Helper for deep merging objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

for (const lang of locales) {
  const filePath = path.join(process.cwd(), 'src/locales', `${lang}.json`);
  let currentData = {};
  if (fs.existsSync(filePath)) {
    currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  if (inputData[lang]) {
    currentData = deepMerge(currentData, inputData[lang]);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log(`Updated ${lang}.json`);
  }
}
