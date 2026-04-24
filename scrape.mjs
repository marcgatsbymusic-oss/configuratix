import fs from 'fs';
import path from 'path';

const OUT_DIR = 'public/assets/handles';

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const r = await fetch('https://www.drutex.eu/en/products/addons/type/1/');
  const t = await r.text();
  const regex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/g;
  let match;
  let count = 0;
  
  while ((match = regex.exec(t)) !== null) {
    const url = match[1].startsWith('/') ? 'https://www.drutex.eu' + match[1] : match[1];
    const alt = match[2].trim();
    if (url.includes('swetrix') || !url.includes('/media/')) continue;
    
    // Map to our handle codes
    let code = 'unknown_' + count;
    let colorMatch = alt.match(/(white|brown|silver|olive|F1|F2|F4|F9|RAL\s*\d+|black)/i);
    let color = colorMatch ? colorMatch[1].replace(/\s+/g, '') : 'default';

    if (alt.includes('KWADRAT') && alt.includes('key')) code = 'KwadratK';
    else if (alt.includes('KWADRAT')) code = 'Kwadrat';
    else if (alt.includes('Secustic') && alt.includes('key')) code = 'AtlantaK'; // Assuming Hoppe Secustic with key is AtlantaK
    else if (alt.includes('Secustic')) code = 'Atlanta'; // Assuming Hoppe Secustic is Atlanta
    else if (alt.includes('DUBLIN') && alt.includes('key')) code = 'DublinK';
    else if (alt.includes('DUBLIN') && alt.includes('button')) code = 'DublinP';
    else if (alt.includes('DUBLIN')) code = 'Dublin';
    else if (alt.includes('MA 1010')) code = 'MA_1010';
    else if (alt.includes('button') && alt.includes('IE')) code = 'ALU_BP';
    else if (alt.includes('key') && alt.includes('IE')) code = 'ALU_BK';
    else if (alt.includes('IE')) code = 'ALU_B';
    else if (alt.includes('button')) code = 'ALU_AP'; // generic button -> ALU_AP
    else if (alt.includes('key')) code = 'ALU_AK'; // generic key -> ALU_AK
    else if (alt.includes('HS door')) code = 'HS_RAIL';
    else if (alt.includes('PSK')) code = 'PSK';
    else code = 'ALU_A'; // generic handle
    
    const filename = `${code}_${color.toLowerCase()}.webp`.replace(/[^a-zA-Z0-9_.]/g, '');
    const filepath = path.join(OUT_DIR, filename);
    
    console.log(`Downloading ${filename} ...`);
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
    } catch(e) {
      console.log('Error downloading', url);
    }
    count++;
  }
}
run();
