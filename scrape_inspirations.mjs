const https = require('https');
const fs = require('fs');

https.get('https://www.drutex.eu/en/inspiration/other/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('inspirations_raw.html', data);
    console.log('Saved to inspirations_raw.html');
  });
});
