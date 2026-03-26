import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const mapping = {
  en: { material: "Material", profile: "Profile" },
  es: { material: "Material", profile: "Perfil" },
  de: { material: "Material", profile: "Profil" },
  fr: { material: "Matériau", profile: "Profil" },
  pt: { material: "Material", profile: "Perfil" },
  nl: { material: "Materiaal", profile: "Profiel" },
  it: { material: "Materiale", profile: "Profilo" },
  pl: { material: "Materiał", profile: "Profil" },
  ca: { material: "Material", profile: "Perfil" }
};

files.forEach(f => {
  const lang = f.split('.')[0];
  if (mapping[lang]) {
    const p = path.join(localesDir, f);
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (data.configurator && data.configurator.steps) {
        data.configurator.steps.material = mapping[lang].material;
        data.configurator.steps.profile = mapping[lang].profile;
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
      }
    } catch(e) {}
  }
});
console.log('Step labels patched successfully.');
