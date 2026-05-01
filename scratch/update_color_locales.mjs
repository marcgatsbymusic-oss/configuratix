import fs from 'fs';

const tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');
const doorColorsStart = tsFile.indexOf('export const IGLO_DOOR_COLORS: SwatchColor[] = [');
const doorColorsEnd = tsFile.indexOf('];', doorColorsStart);
const doorColorsBlock = tsFile.slice(doorColorsStart, doorColorsEnd + 2);

const idNameRegex = /id:\s*'([^']+)',\s*group:\s*'[^']+',\s*name:\s*'([^']+)'/g;
let match;
const translations = {};
while ((match = idNameRegex.exec(doorColorsBlock)) !== null) {
  translations[match[1]] = match[2];
}

const updateLocale = (file) => {
  if (!fs.existsSync(file)) return;
  const localeContent = JSON.parse(fs.readFileSync(file, 'utf8'));
  localeContent.colors = { ...localeContent.colors, ...translations };
  fs.writeFileSync(file, JSON.stringify(localeContent, null, 2) + '\n');
}

updateLocale('src/locales/en.json');
updateLocale('src/locales/es.json');
console.log("Updated translations!");
