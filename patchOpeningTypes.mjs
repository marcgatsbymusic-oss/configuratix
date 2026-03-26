import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const trans = {
  F: { en: "Fixed", de: "Festverglasung", es: "Fijo", fr: "Fixe", it: "Fisso", nl: "Vast", pt: "Fixo", pl: "Fix", ca: "Fix" },
  DKL: { en: "Turn-Tilt (Left)", de: "Dreh-Kipp (links)", es: "Oscilobatiente (Izq)", fr: "Oscillo-Battant (Gau)", it: "Anta Ribalta (Sin)", nl: "Draai-Kiep (Links)", pt: "Oscilobatente (Esq)", pl: "Rozwierano-Uchylne (Lewe)", ca: "Oscil·lobatent (Esq)" },
  DKR: { en: "Turn-Tilt (Right)", de: "Dreh-Kipp (rechts)", es: "Oscilobatiente (Der)", fr: "Oscillo-Battant (Dro)", it: "Anta Ribalta (Des)", nl: "Draai-Kiep (Rechts)", pt: "Oscilobatente (Dir)", pl: "Rozwierano-Uchylne (Prawe)", ca: "Oscil·lobatent (Dre)" },
  DL: { en: "Turn (Left)", de: "Dreh (links)", es: "Practicable (Izq)", fr: "Ouvrant (Gau)", it: "A Battente (Sin)", nl: "Draai (Links)", pt: "De Abrir (Esq)", pl: "Rozwierane (Lewe)", ca: "Practicable (Esq)" },
  DR: { en: "Turn (Right)", de: "Dreh (rechts)", es: "Practicable (Der)", fr: "Ouvrant (Dro)", it: "A Battente (Des)", nl: "Draai (Rechts)", pt: "De Abrir (Dir)", pl: "Rozwierane (Prawe)", ca: "Practicable (Dre)" },
  K: { en: "Tilt", de: "Kipp", es: "Abatible", fr: "Soufflet", it: "A Vasistas", nl: "Valraam", pt: "Basculante", pl: "Uchylne", ca: "Abatible" }
};

files.forEach(f => {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (data.configurator) {
      data.configurator.openingTypes = {};
      Object.keys(trans).forEach(k => {
        data.configurator.openingTypes[k] = trans[k][lang] || trans[k].en;
      });
      fs.writeFileSync(p, JSON.stringify(data, null, 2));
    }
  } catch(e) { console.error(e); }
});
console.log('Opening Types translated!');
