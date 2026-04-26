const fs = require('fs');

try {
  const txt = fs.readFileSync('src/locales/es.json', 'utf8');
  console.log(txt.split('\n').slice(670, 690).join('\n'));
} catch (e) {
  console.error(e);
}
