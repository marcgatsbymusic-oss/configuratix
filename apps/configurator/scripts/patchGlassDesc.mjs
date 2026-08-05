import fs from 'fs';

const translations = {
  "en": {
    "productDetail": {
      "glassDesc": "DRUTEX, with over 30 years of experience in the production of composite glass, offers a very wide range of glass with which you can fit your windows and doors. They meet strict requirements for energy efficiency and sound insulation. The offer also includes laminated glass (safe and burglar-proof), sun protected glass, glass with enhanced sound insulation, tempered, ornamental and sandblasted glass."
    }
  },
  "es": {
    "productDetail": {
      "glassDesc": "DRUTEX, con más de 30 años de experiencia en la producción de vidrio compuesto, ofrece una amplísima gama de acristalamientos con los que puede equipar sus puertas y ventanas. Éstos cumplen los requisitos más estrictos en materia de eficiencia energética y aislamiento acústico. La oferta también incluye vidrios laminados (seguros y antirrobo), vidrios con protección solar, vidrios con aislamiento acústico mejorado, vidrios templados, ornamentales y arenados."
    }
  },
  "de": {
    "productDetail": {
      "glassDesc": "DRUTEX, mit über 30 Jahren Erfahrung in der Herstellung von Verbundglas, bietet eine sehr breite Palette an Gläsern, mit denen Sie Ihre Fenster und Türen ausstatten können. Sie erfüllen strenge Anforderungen an Energieeffizienz und Schalldämmung. Das Angebot umfasst auch Verbundsicherheitsglas (sicher und einbruchhemmend), Sonnenschutzglas, Glas mit verbessertem Schallschutz, Einscheibensicherheitsglas, Ornament- und sandgestrahltes Glas."
    }
  },
  "fr": {
    "productDetail": {
      "glassDesc": "DRUTEX, fort de plus de 30 ans d'expérience dans la production de verre composite, propose une très large gamme de vitrages pour équiper vos fenêtres et vos portes. Ils répondent à des exigences strictes en matière d'efficacité énergétique et d'isolation acoustique. L'offre comprend également du verre feuilleté (sécurisé et anti-effraction), du verre à protection solaire, du verre à isolation phonique renforcée, du verre trempé, ornemental et sablé."
    }
  },
  "ca": {
    "productDetail": {
      "glassDesc": "DRUTEX, amb més de 30 anys d'experiència en la producció de vidre compost, ofereix una amplíssima gamma de vidres amb els quals pot equipar les seves finestres i portes. Aquests compleixen els requisits més estrictes en matèria d'eficiència energètica i aïllament acústic. L'oferta també inclou vidre laminat (segur i antirobatori), vidre amb protecció solar, vidre amb aïllament acústic millorat, vidre temperat, ornamental i sorrejat."
    }
  },
  "pt": {
    "productDetail": {
      "glassDesc": "A DRUTEX, com mais de 30 anos de experiência na produção de vidro composto, oferece uma gama muito vasta de vidros com os quais pode equipar as suas janelas e portas. Cumprem requisitos rigorosos de eficiência energética e isolamento acústico. A oferta inclui também vidro laminado (seguro e anti-roubo), vidro com proteção solar, vidro com isolamento acústico reforçado, vidro temperado, ornamental e jateado."
    }
  },
  "eu": {
    "productDetail": {
      "glassDesc": "DRUTEXek, beira konposatuaren ekoizpenean 30 urte baino gehiagoko esperientziarekin, zure leiho eta ateak hornitzeko beira sorta oso zabala eskaintzen du. Eraginkortasun energetikoaren eta soinu-isolamenduaren eskakizun zorrotzak betetzen dituzte. Eskaintzak beira laminatua (segurua eta lapurreten aurkakoa), eguzki-babeseko beira, soinu-isolamendu hobetua duen beira, beira tenplatua, apaingarria eta hareatua ere barne hartzen ditu."
    }
  }
};

const base = 'C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle';
const locales = Object.keys(translations);

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

for (const lang of locales) {
  const filePath = base + '/src/locales/' + lang + '.json';
  let currentData = {};
  if (fs.existsSync(filePath)) {
    currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  if (translations[lang]) {
    currentData = deepMerge(currentData, translations[lang]);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log(`Updated ${lang}.json`);
  }
}
