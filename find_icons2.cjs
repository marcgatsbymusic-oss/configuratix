const https = require('https');

https.get('https://www.drutex.eu/static/layout2021/css/main.css', r => {
  let css = '';
  r.on('data', d => css += d);
  r.on('end', () => {
    const idx = css.indexOf('.btn-window');
    console.log('.btn-window index:', idx);
    if (idx !== -1) {
      console.log(css.substring(idx, idx + 200));
    }
    
    const idx2 = css.indexOf('.btn-profil');
    console.log('.btn-profil index:', idx2);
    if (idx2 !== -1) {
      console.log(css.substring(idx2, idx2 + 200));
    }
  });
}).on('error', console.error);
