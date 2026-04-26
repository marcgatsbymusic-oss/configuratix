const fs = require('fs');

try {
  const txt = fs.readFileSync('src/locales/es.json', 'utf8');
  JSON.parse(txt);
} catch (e) {
  console.log(e.message);
  // Get the context around the error
  const match = e.message.match(/at position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const txt = fs.readFileSync('src/locales/es.json', 'utf8');
    const start = Math.max(0, pos - 100);
    const end = Math.min(txt.length, pos + 100);
    console.log(txt.substring(start, end));
  }
}
