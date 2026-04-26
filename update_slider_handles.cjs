const fs = require('fs');
const path = require('path');

const original = [
  { name: 'nevada-ral7016',    label: 'NEVADA con llave (RAL7016)' },
  { name: 'nevada-ral9001',    label: 'NEVADA con llave (RAL9001)' },
  { name: 'nevada-ral9005',    label: 'NEVADA con llave (RAL9005)' },
  { name: 'nevada-ral9016',    label: 'NEVADA con llave (RAL9016)' },
  { name: 'nevada-f9',         label: 'NEVADA con llave (tytan F9)' },
  { name: 'mistral-ral7016',   label: 'MISTRAL con llave (RAL7016)' },
  { name: 'mistral-ral9001',   label: 'MISTRAL con llave (RAL9001)' },
  { name: 'mistral-ral9005',   label: 'MISTRAL con llave (RAL9005)' },
  { name: 'mistral-f9-key',    label: 'MISTRAL con llave (tytan F9)' },
  { name: 'mistral-f9',        label: 'MISTRAL F9' },
  { name: 'dublin-ral9016',    label: 'DUBLIN (blanco RAL9016)' },
  { name: 'dublin-ral8019',    label: 'DUBLIN (marrón RAL8019)' },
  { name: 'dublin-ral7016',    label: 'DUBLIN (RAL7016)' },
  { name: 'dublin-ral9005',    label: 'DUBLIN (RAL9005)' },
  { name: 'dublin-silver',     label: 'DUBLIN (plateada)' },
  { name: 'dublin-key-ral7016', label: 'DUBLIN con llave (RAL7016)' },
  { name: 'dublin-key-ral9005', label: 'DUBLIN con llave (RAL9005)' },
  { name: 'dublin-key-ral9016', label: 'DUBLIN con llave (blanco RAL9016)' },
  { name: 'dublin-key-ral8019', label: 'DUBLIN con llave (marrón RAL8019)' },
  { name: 'dublin-key-silver',  label: 'DUBLIN con llave (plateada)' },
  { name: 'kwadrat-ral7016',   label: 'KWADRAT RAL 7016' },
  { name: 'kwadrat-ral8019',   label: 'KWADRAT RAL 8019' },
  { name: 'kwadrat-ral9016',   label: 'KWADRAT RAL 9016' },
  { name: 'kwadrat-ral9001',   label: 'KWADRAT RAL 9001' },
  { name: 'kwadrat-f9',        label: 'KWADRAT tytan F9' },
  { name: 'kwadrat-key-f1',    label: 'KWADRAT con llave F1' },
  { name: 'kwadrat-key-f4',    label: 'KWADRAT con llave F4' },
  { name: 'kwadrat-key-f9',    label: 'KWADRAT con llave F9' },
  { name: 'kwadrat-key-ral7016', label: 'KWADRAT con llave (RAL7016)' },
  { name: 'kwadrat-key-ral8019', label: 'KWADRAT con llave (RAL8019)' },
  { name: 'kwadrat-key-ral9001', label: 'KWADRAT con llave (RAL9001)' },
  { name: 'kwadrat-key-ral9005', label: 'KWADRAT con llave (RAL9005)' },
  { name: 'kwadrat-key-ral9016', label: 'KWADRAT con llave (RAL9016)' }
];

const dict = {
  en: { "con llave": "with key", "blanco": "white", "marrón": "brown", "plateada": "silver", "tytan": "titanium" },
  es: { "con llave": "con llave", "blanco": "blanco", "marrón": "marrón", "plateada": "plateada", "tytan": "tytan" },
  de: { "con llave": "mit Schlüssel", "blanco": "weiß", "marrón": "braun", "plateada": "silber", "tytan": "Titan" },
  fr: { "con llave": "avec clé", "blanco": "blanc", "marrón": "marron", "plateada": "argent", "tytan": "titane" },
  pt: { "con llave": "com chave", "blanco": "branco", "marrón": "marrom", "plateada": "prateado", "tytan": "titânio" },
  ca: { "con llave": "amb clau", "blanco": "blanc", "marrón": "marró", "plateada": "platejat", "tytan": "titani" },
  eu: { "con llave": "giltzarekin", "blanco": "zuria", "marrón": "marroia", "plateada": "zilarrezkoa", "tytan": "titanioa" }
};

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const lang = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.sliderHandles = {};
    const rules = dict[lang] || dict['en'];
    
    original.forEach(h => {
      let tr = h.label;
      for (const [esWord, langWord] of Object.entries(rules)) {
        // case insensitive replace
        const regex = new RegExp(esWord, 'gi');
        tr = tr.replace(regex, langWord);
      }
      data.sliderHandles[h.name] = tr;
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  } catch (e) {
    console.error(`Error with ${file}:`, e);
  }
});
