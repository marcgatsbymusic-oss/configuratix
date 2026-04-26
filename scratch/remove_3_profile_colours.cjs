const fs = require('fs');

// 1. productDetails.ts
let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');
pd = pd.replace("    '3 profile colours to choose from: white, brown or anthracite',\n", "");
pd = pd.replace("    '3 profile colours to choose from: white, brown or anthracite',\r\n", "");
fs.writeFileSync('src/data/productDetails.ts', pd);

// 2. en.json
const enPath = 'src/locales/en.json';
let enTxt = fs.readFileSync(enPath, 'utf8');
enTxt = enTxt.replace(/ *"3 profile colours to choose from: white, brown or anthracite",?\r?\n/g, "");
fs.writeFileSync(enPath, enTxt);

// 3. es.json
const esPath = 'src/locales/es.json';
let esTxt = fs.readFileSync(esPath, 'utf8');
esTxt = esTxt.replace(/ *"3 colores de perfil a elegir: blanco, marrón o antracita",?\r?\n/g, "");
fs.writeFileSync(esPath, esTxt);

console.log('Removed 3 profile colours from all files');
