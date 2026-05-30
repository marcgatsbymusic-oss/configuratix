const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');

const translations = {
  'en.json': 'Test Wood',
  'es.json': 'Madera de prueba',
  'pl.json': 'Drewno testowe',
  'de.json': 'Test Holz',
  'fr.json': 'Bois d\'essai',
  'it.json': 'Legno di prova',
  'pt.json': 'Madeira de teste',
  'ca.json': 'Fusta de prova',
  'nl.json': 'Test hout',
  'no.json': 'Test tre',
  'sv.json': 'Test trä',
  'fi.json': 'Testipuu',
  'ru.json': 'Тестовое дерево',
  'uk.json': 'Тестове дерево',
  'ar.json': 'خشب تجريبي',
  'eu.json': 'Proba-egurra',
  'ro.json': 'Lemn de test'
};

const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (!file.endsWith('.json')) return;

  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.colors) {
      data.colors = {};
    }
    
    const translatedName = translations[file] || 'Test Wood';
    data.colors['c999'] = translatedName;

    // Save with pretty printing
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file} with c999: "${translatedName}"`);
  } catch (err) {
    console.error(`Error updating ${file}:`, err);
  }
});

console.log('All translations successfully updated.');
