const https = require('https');

https.get('https://www.drutex.eu/en/products/iglo-energy.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Look for image sources
    const urls = [...data.matchAll(/<img[^>]+src=\"([^\"]+)\"/g)].map(m => m[1]);
    const filtered = urls.filter(u => u.includes('energy') || u.includes('profile') || u.includes('tech') || u.includes('przekroj') || u.includes('rys'));
    console.log(filtered);
  });
}).on('error', console.error);
