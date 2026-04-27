const https = require('https');

https.get('https://www.drutex.eu/static/layout2021/css/main.css', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Search for btn-profil and btn-window
    const regex = /\.btn-(profil|window)[^{]*\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      console.log('Found:', match[0]);
    }
  });
});
