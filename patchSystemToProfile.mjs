import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const profiles = {
  en: "Profile",
  es: "Perfil",
  de: "Profil",
  fr: "Profilé",
  pt: "Perfil",
  nl: "Profiel",
  it: "Profilo",
  pl: "Profil",
  ca: "Perfil"
};

files.forEach(f => {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (data.configurator && data.configurator.steps) {
      const translation = profiles[lang] || "Profile";
      data.configurator.steps.system = translation;
      if (data.configurator.summary) {
        data.configurator.summary.system = translation;
      }
      fs.writeFileSync(p, JSON.stringify(data, null, 2));
    }
  } catch(e) { console.error(e); }
});
console.log('Profile term localized successfully!');
