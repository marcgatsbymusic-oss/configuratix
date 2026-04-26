const https = require('https');

https.get('https://www.drutex.eu/en/products/iglo-energy-classic.html', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const mp4s = data.match(/https:\/\/[^\"]+\.mp4/g) || [];
    const pngs = data.match(/https:\/\/[^\"]+iglo_energy_classic[^\"]*\.png/g) || [];
    const partialMp4s = data.match(/\/[^\"]+\.mp4/g) || [];
    const partialPngs = data.match(/\/[^\"]+iglo_energy_classic[^\"]*\.png/g) || [];
    
    console.log('MP4s:', [...new Set([...mp4s, ...partialMp4s])]);
    console.log('PNGs:', [...new Set([...pngs, ...partialPngs])]);
  });
});
