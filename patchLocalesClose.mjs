import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const locales = ['en', 'de', 'fr', 'pt', 'es', 'nl', 'it', 'pl'];

const newKeys = {
  en: { close: "Close" },
  es: { close: "Cerrar" },
  de: { close: "Schließen" },
  fr: { close: "Fermer" },
  pt: { close: "Fechar" },
  nl: { close: "Sluiten" },
  it: { close: "Chiudi" },
  pl: { close: "Zamknij" }
};

locales.forEach(lang => {
  const translations = newKeys[lang] || newKeys['en'];
  const filepath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (data.help) {
      data.help.close = translations.close;
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    }
  }
});
console.log('Close translations patched!');
