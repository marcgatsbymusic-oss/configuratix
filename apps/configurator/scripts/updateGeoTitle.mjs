import fs from 'fs';
import path from 'path';

const translations = {
  en: "Local Climate Match",
  es: "Coincidencia de Clima Local",
  ca: "Coincidència de Clima Local",
  eu: "Tokiko Klimaren Bat-etortzea",
  de: "Lokale Klimaübereinstimmung",
  fr: "Correspondance Climatique Locale",
  pt: "Correspondência Climática Local"
};

const localesDir = path.join(process.cwd(), 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = path.basename(file, '.json');
  if (translations[lang]) {
    const filePath = path.join(localesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (content.assistant) {
      content.assistant.geoTitle = translations[lang];
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Updated geoTitle in ${lang}.json`);
    } else {
      console.log(`No 'assistant' object found in ${lang}.json`);
    }
  }
}
