import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const mapping = {
  en: { material: "Material", system: "System" },
  es: { material: "Material", system: "Sistema" },
  de: { material: "Material", system: "System" },
  fr: { material: "Matériau", system: "Système" },
  pt: { material: "Material", system: "Sistema" },
  nl: { material: "Materiaal", system: "Systeem" },
  it: { material: "Materiale", system: "Sistema" },
  pl: { material: "Materiał", system: "System" },
  ca: { material: "Material", system: "Sistema" }
};

files.forEach(f => {
  const lang = f.split('.')[0];
  if (mapping[lang]) {
    const p = path.join(localesDir, f);
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      
      if (data.configurator) {
        // Patch accordion steps
        if (data.configurator.steps) {
          data.configurator.steps.material = mapping[lang].material;
          data.configurator.steps.system = mapping[lang].system;
        }
        // Patch right-hand summary sidebar
        if (data.configurator.summary) {
          data.configurator.summary.material = mapping[lang].material;
          data.configurator.summary.system = mapping[lang].system;
        }
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
      }
    } catch(e) {}
  }
});
console.log('Summary and Steps labels successfully patched across languages!');
