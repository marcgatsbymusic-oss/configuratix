import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const tr = {
  "1-flugel": {
    en: "1 Leaf", es: "1 Hoja", de: "1 Flügel", fr: "1 Vantail", pt: "1 Folha", nl: "1 Vleugel", it: "1 Anta", pl: "1 Skrzydło", ca: "1 Fulla"
  },
  "1-flugel-oberlicht": {
    en: "1 Leaf \nwith Toplight", es: "1 Hoja \ncon Montante", de: "1 Flügel \nmit Oberlicht", fr: "1 Vantail \navec Imposte", pt: "1 Folha \ncom Bandeira", nl: "1 Vleugel \nmet Bovenlicht", it: "1 Anta \ncon Sopraluce", pl: "1 Skrzydło \nz Naświetlem", ca: "1 Fulla \namb Muntant"
  },
  "1-flugel-unterlicht": {
    en: "1 Leaf \nwith Bottomlight", es: "1 Hoja \ncon Fijo Inf.", de: "1 Flügel \nmit Unterlicht", fr: "1 Vantail \navec Allège", pt: "1 Folha \ncom Peitoril", nl: "1 Vleugel \nmet Onderlicht", it: "1 Anta \ncon Sottoluce", pl: "1 Skrzydło \nz Podświetlem", ca: "1 Fulla \namb Fix Inf."
  },
  "2-flugel": {
    en: "2 Leaves", es: "2 Hojas", de: "2 Flügel", fr: "2 Vantaux", pt: "2 Folhas", nl: "2 Vleugels", it: "2 Ante", pl: "2 Skrzydła", ca: "2 Fulles"
  },
  "2-flugel-oberlicht": {
    en: "2 Leaves \nwith Toplight", es: "2 Hojas \ncon Montante", de: "2 Flügel \nmit Oberlicht", fr: "2 Vantaux \navec Imposte", pt: "2 Folhas \ncom Bandeira", nl: "2 Vleugels \nmet Bovenlicht", it: "2 Ante \ncon Sopraluce", pl: "2 Skrzydła \nz Naświetlem", ca: "2 Fulles \namb Muntant"
  },
  "2-flugel-oberlicht-asym": {
    en: "2 Leaves asym. \nwith Toplight", es: "2 Hojas asim. \ncon Montante", de: "2 Flügel asym. \nmit Oberlicht", fr: "2 Vantaux asym. \navec Imposte", pt: "2 Folhas assim. \ncom Bandeira", nl: "2 Vleugels asym. \nmet Bovenlicht", it: "2 Ante asim. \ncon Sopraluce", pl: "2 Skrzydła asym. \nz Naświetlem", ca: "2 Fulles asim. \namb Muntant"
  },
  "2-flugel-unterlicht": {
    en: "2 Leaves \nwith Bottomlight", es: "2 Hojas \ncon Fijo Inf.", de: "2 Flügel \nmit Unterlicht", fr: "2 Vantaux \navec Allège", pt: "2 Folhas \ncom Peitoril", nl: "2 Vleugels \nmet Onderlicht", it: "2 Ante \ncon Sottoluce", pl: "2 Skrzydła \nz Podświetlem", ca: "2 Fulles \namb Fix Inf."
  },
  "2-flugel-unterlicht-asym": {
    en: "2 Leaves asym. \nwith Bottomlight", es: "2 Hojas asim. \ncon Fijo Inf.", de: "2 Flügel asym. \nmit Unterlicht", fr: "2 Vantaux asym. \navec Allège", pt: "2 Folhas assim. \ncom Peitoril", nl: "2 Vleugels asym. \nmet Onderlicht", it: "2 Ante asim. \ncon Sottoluce", pl: "2 Skrzydła asym. \nz Podświetlem", ca: "2 Fulles asim. \namb Fix Inf."
  },
  "3-flugel": {
    en: "3 Leaves", es: "3 Hojas", de: "3 Flügel", fr: "3 Vantaux", pt: "3 Folhas", nl: "3 Vleugels", it: "3 Ante", pl: "3 Skrzydła", ca: "3 Fulles"
  },
  "3-flugel-oberlicht": {
    en: "3 Leaves \nwith Toplight", es: "3 Hojas \ncon Montante", de: "3 Flügel \nmit Oberlicht", fr: "3 Vantaux \navec Imposte", pt: "3 Folhas \ncom Bandeira", nl: "3 Vleugels \nmet Bovenlicht", it: "3 Ante \ncon Sopraluce", pl: "3 Skrzydła \nz Naświetlem", ca: "3 Fulles \namb Muntant"
  },
  "3-flugel-oberlicht-asym": {
    en: "3 Leaves asym. \nwith Toplight", es: "3 Hojas asim. \ncon Montante", de: "3 Flügel asym. \nmit Oberlicht", fr: "3 Vantaux asym. \navec Imposte", pt: "3 Folhas assim. \ncom Bandeira", nl: "3 Vleugels asym. \nmet Bovenlicht", it: "3 Ante asim. \ncon Sopraluce", pl: "3 Skrzydła asym. \nz Naświetlem", ca: "3 Fulles asim. \namb Muntant"
  },
  "3-flugel-unterlicht": {
    en: "3 Leaves \nwith Bottomlight", es: "3 Hojas \ncon Fijo Inf.", de: "3 Flügel \nmit Unterlicht", fr: "3 Vantaux \navec Allège", pt: "3 Folhas \ncom Peitoril", nl: "3 Vleugels \nmet Onderlicht", it: "3 Ante \ncon Sottoluce", pl: "3 Skrzydła \nz Podświetlem", ca: "3 Fulles \namb Fix Inf."
  },
  "3-flugel-unterlicht-asym": {
    en: "3 Leaves asym. \nwith Bottomlight", es: "3 Hojas asim. \ncon Fijo Inf.", de: "3 Flügel asym. \nmit Unterlicht", fr: "3 Vantaux asym. \navec Allège", pt: "3 Folhas assim. \ncom Peitoril", nl: "3 Vleugels asym. \nmet Onderlicht", it: "3 Ante asim. \ncon Sottoluce", pl: "3 Skrzydła asym. \nz Podświetlem", ca: "3 Fulles asim. \namb Fix Inf."
  },
  "4-flugel": {
    en: "4 Leaves", es: "4 Hojas", de: "4 Flügel", fr: "4 Vantaux", pt: "4 Folhas", nl: "4 Vleugels", it: "4 Ante", pl: "4 Skrzydła", ca: "4 Fulles"
  }
};

files.forEach(f => {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (data.configurator) {
      data.configurator.windowTypes = {};
      Object.keys(tr).forEach(key => {
        data.configurator.windowTypes[key] = tr[key][lang] || tr[key]['en'];
      });
      fs.writeFileSync(p, JSON.stringify(data, null, 2));
    }
  } catch(e) { console.error(e); }
});
console.log('Window Types localized correctly!');
