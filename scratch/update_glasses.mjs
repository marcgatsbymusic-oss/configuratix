import fs from 'fs';

const enPath = 'src/locales/en.json';
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

enData.glass = {
  g1: '33.1 safety',
  g2: '33.2 ("safety") matt film',
  g3: '44.4 anti-burglary',
  g4: 'Antisol Dark Blue 6',
  g5: 'Antisol grey 6',
  g6: 'Antisol brown 4',
  g7: 'Antisol brown 6',
  g8: 'Antisol green 4',
  g9: 'Antisol green 6',
  g10: 'Chinchilla white 4',
  g11: 'Float 4',
  g12: 'Float 6',
  g13: 'Mirastar',
  g14: 'Ornament Cathedral',
  g15: 'Ornament Delta 4',
  g16: 'Ornament Master Carre',
  g17: 'Ornament Silvit 4',
  g18: 'Stopsol blue 6',
  g19: 'Stopsol brown 6',
  g20: 'Waterfall 105'
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

const tsPath = 'src/data/productDetails.ts';
let tsData = fs.readFileSync(tsPath, 'utf8');

tsData = tsData.replace(/'33,1 segura'/g, "'33.1 safety'");
tsData = tsData.replace(/'33,2 segura film mate'/g, "'33.2 (\"safety\") matt film'");
tsData = tsData.replace(/'44,4 antirrobo'/g, "'44.4 anti-burglary'");
// Antisol Dark Blue 6 is already English
tsData = tsData.replace(/'Antisol gris 6'/g, "'Antisol grey 6'");
tsData = tsData.replace(/'Antisol marrón 4'/g, "'Antisol brown 4'");
tsData = tsData.replace(/'Antisol marrón 6'/g, "'Antisol brown 6'");
tsData = tsData.replace(/'Antisol verde 4'/g, "'Antisol green 4'");
tsData = tsData.replace(/'Antisol verde 6'/g, "'Antisol green 6'");
tsData = tsData.replace(/'Chinchilla blanco 4'/g, "'Chinchilla white 4'");
// Float 4, Float 6, Mirastar are identical
tsData = tsData.replace(/'Ornamento Cathedral'/g, "'Ornament Cathedral'");
tsData = tsData.replace(/'Ornamento Delta 4'/g, "'Ornament Delta 4'");
tsData = tsData.replace(/'Ornamento Master Carré'/g, "'Ornament Master Carre'");
tsData = tsData.replace(/'Ornamento Silvit 4'/g, "'Ornament Silvit 4'");
tsData = tsData.replace(/'Stopsol azul 6'/g, "'Stopsol blue 6'");
tsData = tsData.replace(/'Stopsol marrón 6'/g, "'Stopsol brown 6'");

fs.writeFileSync(tsPath, tsData);
console.log('Added glass names to en.json and productDetails.ts');
