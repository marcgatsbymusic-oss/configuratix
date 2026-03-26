import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const locales = ['en', 'de', 'fr', 'pt', 'es', 'nl', 'it', 'pl'];

const newKeys = {
  en: "Drag to rotate freely in 3D",
  es: "Arrastra para rotar libremente en 3D",
  de: "Ziehen Sie, um sich frei in 3D zu drehen",
  fr: "Faites glisser pour tourner librement en 3D",
  pt: "Arraste para girar livremente em 3D",
  nl: "Sleep om vrij in 3D te draaien",
  it: "Trascina per ruotare liberamente in 3D",
  pl: "Przeciągnij, aby swobodnie obracać w 3D"
};

locales.forEach(lang => {
  const filepath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!data.configurator) data.configurator = {};
    if (!data.configurator.blueprint) data.configurator.blueprint = {};
    
    data.configurator.blueprint.dragToRotate = newKeys[lang] || newKeys['en'];
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
});

console.log('Blueprint locales patched!');
