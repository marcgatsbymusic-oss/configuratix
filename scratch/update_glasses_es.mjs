import fs from 'fs';

const esPath = 'src/locales/es.json';
const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

esData.glass = {
  g1: '33,1 segura',
  g2: '33,2 segura film mate',
  g3: '44,4 antirrobo',
  g4: 'Antisol Dark Blue 6',
  g5: 'Antisol gris 6',
  g6: 'Antisol marrón 4',
  g7: 'Antisol marrón 6',
  g8: 'Antisol verde 4',
  g9: 'Antisol verde 6',
  g10: 'Chinchilla blanco 4',
  g11: 'Float 4',
  g12: 'Float 6',
  g13: 'Mirastar',
  g14: 'Ornamento Cathedral',
  g15: 'Ornamento Delta 4',
  g16: 'Ornamento Master Carré',
  g17: 'Ornamento Silvit 4',
  g18: 'Stopsol azul 6',
  g19: 'Stopsol marrón 6',
  g20: 'Waterfall 105'
};

fs.writeFileSync(esPath, JSON.stringify(esData, null, 2));

console.log('Added glass names to es.json');
