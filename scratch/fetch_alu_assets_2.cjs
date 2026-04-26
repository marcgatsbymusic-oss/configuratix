const https = require('https');

https.get('https://www.drutex.eu/en/products/iglo-energy-alu-cover.html', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const pngs = data.match(/\/[^\"]*alu[^\"]*\.png/gi) || [];
    const jpgs = data.match(/\/[^\"]*alu[^\"]*\.jpg/gi) || [];
    
    console.log('PNGs:', [...new Set(pngs)]);
    console.log('JPGs:', [...new Set(jpgs)]);
  });
}).on('error', (err) => console.log(err));
