const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  en: {
    handles: {
      h1: { name: "Standard Handle", type: "Aluminum" },
      h2: { name: "Handle with Key", type: "Security" },
      h3: { name: "Secustik®", type: "Anti-burglary" }
    }
  },
  es: {
    handles: {
      h1: { name: "Manilla Estándar", type: "Aluminio" },
      h2: { name: "Manilla con Llave", type: "Seguridad" },
      h3: { name: "Secustik®", type: "Antirrobo" }
    }
  },
  de: {
    handles: {
      h1: { name: "Standardgriff", type: "Aluminium" },
      h2: { name: "Griff mit Schlüssel", type: "Sicherheit" },
      h3: { name: "Secustik®", type: "Einbruchschutz" }
    }
  },
  fr: {
    handles: {
      h1: { name: "Poignée Standard", type: "Aluminium" },
      h2: { name: "Poignée à Clé", type: "Sécurité" },
      h3: { name: "Secustik®", type: "Anti-effraction" }
    }
  },
  pt: {
    handles: {
      h1: { name: "Puxador Padrão", type: "Alumínio" },
      h2: { name: "Puxador com Chave", type: "Segurança" },
      h3: { name: "Secustik®", type: "Anti-roubo" }
    }
  },
  ca: {
    handles: {
      h1: { name: "Maneta Estàndard", type: "Alumini" },
      h2: { name: "Maneta amb Clau", type: "Seguretat" },
      h3: { name: "Secustik®", type: "Antirobatori" }
    }
  },
  eu: {
    handles: {
      h1: { name: "Helduleku Estandarra", type: "Aluminioa" },
      h2: { name: "Giltzadun Heldulekua", type: "Segurtasuna" },
      h3: { name: "Secustik®", type: "Lapurren Aurkakoa" }
    }
  }
};

files.forEach(file => {
  const lang = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (translations[lang]) {
      data.handles = translations[lang].handles;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated ${file}`);
    }
  } catch (e) {
    console.error(`Error with ${file}:`, e);
  }
});
