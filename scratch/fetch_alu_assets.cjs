const https = require('https');

https.get('https://www.drutex.eu/en/products/iglo-energy-alu-cover.html', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const mp4s = data.match(/https:\/\/[^\"]+\.mp4/g) || [];
    const pngs = data.match(/https:\/\/[^\"]+iglo_energy_alu_cover[^\"]*\.png/g) || [];
    const jpgs = data.match(/https:\/\/[^\"]+iglo_energy_alu_cover[^\"]*\.jpg/g) || [];
    
    const partialMp4s = data.match(/\/[^\"]+\.mp4/g) || [];
    const partialPngs = data.match(/\/[^\"]+iglo_energy_alu_cover[^\"]*\.png/g) || [];
    const partialJpgs = data.match(/\/[^\"]+iglo_energy_alu_cover[^\"]*\.jpg/g) || [];
    
    console.log('MP4s:', [...new Set([...mp4s, ...partialMp4s])]);
    console.log('PNGs:', [...new Set([...pngs, ...partialPngs])]);
    console.log('JPGs:', [...new Set([...jpgs, ...partialJpgs])]);
    
    // Also look for color range sections
    if (data.includes('PVC-aluminium colour range')) {
      console.log('Found PVC-aluminium colour range section in HTML');
    }
  });
}).on('error', (err) => console.log(err));
