const https = require('https');
const fs = require('fs');
['4', '6', '272', ''].forEach(id => {
  const url = `https://www.drutex.eu/en/products/addons${id ? '/type/'+id+'/' : '/'}`;
  https.get(url, res => {
    let d = '';
    res.on('data', c => d+=c);
    res.on('end', () => fs.writeFileSync('addons_' + (id||'main') + '.html', d));
  });
});
