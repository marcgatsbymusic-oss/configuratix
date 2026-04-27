import fs from 'fs';
import path from 'path';

const colorsFile = path.resolve('mb86n_colors.json');
const productDetailsFile = path.resolve('src/data/productDetails.ts');
const enLocaleFile = path.resolve('src/locales/en.json');
const esLocaleFile = path.resolve('src/locales/es.json');

const rawColors = JSON.parse(fs.readFileSync(colorsFile, 'utf8'));

// Filter out duplicates based on name
const uniqueColorsMap = new Map();
for (const color of rawColors) {
    if (!uniqueColorsMap.has(color.name)) {
        uniqueColorsMap.set(color.name, color);
    }
}
const colors = Array.from(uniqueColorsMap.values());

const tsArray = [];
const colorTranslations = {};

for (const color of colors) {
    const id = `ral-${color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    
    // Create TS object string
    const tsObj = `{ id: '${id}', name: '${color.name.replace(/'/g, "\\'")}', hex: '${color.hex}', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' }`;
    tsArray.push(tsObj);
    
    // Add to translations map
    colorTranslations[id] = color.name;
}

const tsArrayString = `export const FULL_RAL_COLORS: SwatchColor[] = [\n  ${tsArray.join(',\n  ')}\n];\n`;

// 1. Update productDetails.ts
let pdContent = fs.readFileSync(productDetailsFile, 'utf8');

// Insert FULL_RAL_COLORS before MB_86N_SI_DETAIL if not already there
if (!pdContent.includes('export const FULL_RAL_COLORS')) {
    pdContent = pdContent.replace('export const MB_86N_SI_DETAIL', `${tsArrayString}\nexport const MB_86N_SI_DETAIL`);
} else {
    // Replace existing FULL_RAL_COLORS
    pdContent = pdContent.replace(/export const FULL_RAL_COLORS: SwatchColor\[\] = \[[\s\S]*?\];\n/, tsArrayString);
}

// Update MB_86N_SI_DETAIL to use FULL_RAL_COLORS
pdContent = pdContent.replace(/colors: RAL_COLORS(,?)/g, 'colors: FULL_RAL_COLORS$1');

fs.writeFileSync(productDetailsFile, pdContent);
console.log('Updated productDetails.ts');

// 2. Update locales
function updateLocale(file) {
    const localeContent = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!localeContent.colors) localeContent.colors = {};
    
    for (const [key, value] of Object.entries(colorTranslations)) {
        if (!localeContent.colors[key]) {
            localeContent.colors[key] = value;
        }
    }
    
    fs.writeFileSync(file, JSON.stringify(localeContent, null, 2));
    console.log(`Updated ${path.basename(file)}`);
}

updateLocale(enLocaleFile);
updateLocale(esLocaleFile);

console.log(`Successfully imported ${colors.length} RAL colors.`);
