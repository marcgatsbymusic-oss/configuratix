import fs from 'fs';

const langs = ['en', 'es', 'de', 'fr', 'ca', 'pt', 'eu'];

const glassDict = {
  'g1': { en: '33.1 Safe', es: '33,1 segura', de: '33.1 sicher', fr: '33,1 sécurisé', ca: '33,1 segura', pt: '33,1 segura', eu: '33,1 segurua' },
  'g2': { en: '33.2 Safe Matte Film', es: '33,2 segura film mate', de: '33.2 sicher Mattfolie', fr: '33,2 sécurisé film mat', ca: '33,2 segura film mat', pt: '33,2 segura filme mate', eu: '33,2 segurua film matea' },
  'g3': { en: '44.4 Anti-burglary', es: '44,4 antirrobo', de: '44.4 einbruchhemmend', fr: '44,4 anti-effraction', ca: '44,4 antirobatori', pt: '44,4 anti-roubo', eu: '44,4 lapurreten aurkakoa' },
  'g4': { en: 'Antisol Dark Blue 6', es: 'Antisol azul oscuro 6', de: 'Antisol Dunkelblau 6', fr: 'Antisol Bleu Foncé 6', ca: 'Antisol blau fosc 6', pt: 'Antisol Azul Escuro 6', eu: 'Antisol urdin iluna 6' },
  'g5': { en: 'Antisol Grey 6', es: 'Antisol gris 6', de: 'Antisol Grau 6', fr: 'Antisol Gris 6', ca: 'Antisol gris 6', pt: 'Antisol Cinza 6', eu: 'Antisol grisa 6' },
  'g6': { en: 'Antisol Brown 4', es: 'Antisol marrón 4', de: 'Antisol Braun 4', fr: 'Antisol Brun 4', ca: 'Antisol marró 4', pt: 'Antisol Marrom 4', eu: 'Antisol marroia 4' },
  'g7': { en: 'Antisol Brown 6', es: 'Antisol marrón 6', de: 'Antisol Braun 6', fr: 'Antisol Brun 6', ca: 'Antisol marró 6', pt: 'Antisol Marrom 6', eu: 'Antisol marroia 6' },
  'g8': { en: 'Antisol Green 4', es: 'Antisol verde 4', de: 'Antisol Grün 4', fr: 'Antisol Vert 4', ca: 'Antisol verd 4', pt: 'Antisol Verde 4', eu: 'Antisol berdea 4' },
  'g9': { en: 'Antisol Green 6', es: 'Antisol verde 6', de: 'Antisol Grün 6', fr: 'Antisol Vert 6', ca: 'Antisol verd 6', pt: 'Antisol Verde 6', eu: 'Antisol berdea 6' },
  'g10': { en: 'Chinchilla', es: 'Chinchilla', de: 'Chinchilla', fr: 'Chinchilla', ca: 'Chinchilla', pt: 'Chinchilla', eu: 'Chinchilla' },
  'g11': { en: 'Float 4', es: 'Float 4', de: 'Float 4', fr: 'Float 4', ca: 'Float 4', pt: 'Float 4', eu: 'Float 4' },
  'g12': { en: 'Float 6', es: 'Float 6', de: 'Float 6', fr: 'Float 6', ca: 'Float 6', pt: 'Float 6', eu: 'Float 6' },
  'g13': { en: 'Krizet', es: 'Krizet', de: 'Krizet', fr: 'Krizet', ca: 'Krizet', pt: 'Krizet', eu: 'Krizet' },
  'g14': { en: 'Master-Carre', es: 'Master-Carre', de: 'Master-Carre', fr: 'Master-Carre', ca: 'Master-Carre', pt: 'Master-Carre', eu: 'Master-Carre' },
  'g15': { en: 'Master-Ligne', es: 'Master-Ligne', de: 'Master-Ligne', fr: 'Master-Ligne', ca: 'Master-Ligne', pt: 'Master-Ligne', eu: 'Master-Ligne' },
  'g16': { en: 'Master-Point', es: 'Master-Point', de: 'Master-Point', fr: 'Master-Point', ca: 'Master-Point', pt: 'Master-Point', eu: 'Master-Point' },
  'g17': { en: 'Silvit Clear', es: 'Silvit incoloro', de: 'Silvit Klar', fr: 'Silvit Clair', ca: 'Silvit incolor', pt: 'Silvit Claro', eu: 'Silvit argia' },
  'g18': { en: 'Silvit Bronze', es: 'Silvit bronce', de: 'Silvit Bronze', fr: 'Silvit Bronze', ca: 'Silvit bronze', pt: 'Silvit Bronze', eu: 'Silvit brontzea' },
  'g19': { en: 'Soundproof 36dB', es: 'Insonorizado 36dB', de: 'Schallschutz 36dB', fr: 'Insonorisé 36dB', ca: 'Insonoritzat 36dB', pt: 'Insonorização 36dB', eu: 'Soinu-isolamendua 36dB' },
  'g20': { en: 'Soundproof 40dB', es: 'Insonorizado 40dB', de: 'Schallschutz 40dB', fr: 'Insonorisé 40dB', ca: 'Insonoritzat 40dB', pt: 'Insonorização 40dB', eu: 'Soinu-isolamendua 40dB' }
};

const finalData = {};
langs.forEach(lang => {
  finalData[lang] = { glass: {} };
  for (const [key, val] of Object.entries(glassDict)) {
    finalData[lang].glass[key] = val[lang];
  }
});

const base = 'C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle';
fs.writeFileSync(base + '/scripts/glassLocales.json', JSON.stringify(finalData, null, 2));
console.log('Generated scripts/glassLocales.json');
