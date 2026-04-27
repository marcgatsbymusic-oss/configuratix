const https = require('https');

https.get('https://www.drutex.eu/en/products/softline.html', res => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    // find all links with .css
    const cssLinks = Array.from(html.matchAll(/href="([^"]+\.css[^"]*)"/g)).map(m => m[1]);
    
    cssLinks.forEach(link => {
      let url = link.startsWith('http') ? link : 'https://www.drutex.eu' + link;
      https.get(url, r => {
        let css = '';
        r.on('data', d => css += d);
        r.on('end', () => {
          const match = css.match(/\.btn-(?:profil|window)[^{]*\{([^}]+)\}/g);
          if (match) {
            console.log('Found in', url, match);
          } else {
             const m2 = css.match(/btn-profil|btn-window/g);
             if (m2) {
               console.log('Found class name in', url);
               const idx = css.indexOf(m2[0]);
               console.log(css.substring(Math.max(0, idx - 50), idx + 200));
             }
          }
        });
      }).on('error', () => {});
    });
  });
});
