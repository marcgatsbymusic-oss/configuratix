import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

async function run() {
  console.log("Fetching HTML...");
  const response = await fetch('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');
  const html = await response.text();
  
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  const assetsDir = path.resolve('public/assets/iglo5-doors/infills');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const items = doc.querySelectorAll('.t-item');
  const infills = [];
  
  for (const item of items) {
    const titleEl = item.querySelector('.t-title');
    if (!titleEl) continue;
    const title = titleEl.textContent.trim();
    
    // Check if it is an infill or example
    if (title.toUpperCase().includes('DECORATIVE OVERLAY') || title.toUpperCase().includes('DX') || title.includes('FLORIDA') || title.includes('MONTANA') || title.includes('OHIO') || title.includes('COLORADO') || title.includes('ALASKA') || title.includes('ARIZONA') || title.includes('NEBRASKA') || title.includes('TEXAS') || title.includes('CALIFORNIA') || title.includes('PENNSYLVANIA') || title.includes('HAWAII') || title.includes('Example')) {
        
        const imgEl = item.querySelector('img');
        if (!imgEl) continue;
        let imgSrc = imgEl.src;
        if (imgSrc.startsWith('/')) {
            imgSrc = 'https://www.drutex.eu' + imgSrc;
        }
        
        const filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.webp';
        const filepath = path.join(assetsDir, filename);
        
        console.log(`Downloading ${title} from ${imgSrc}`);
        try {
           const imgRes = await fetch(imgSrc);
           const buffer = await imgRes.arrayBuffer();
           fs.writeFileSync(filepath, Buffer.from(buffer));
        } catch(e) {
           console.log("Failed to download", imgSrc);
        }
        
        infills.push({
            name: title,
            image: `/assets/iglo5-doors/infills/${filename}`,
            largeImage: `/assets/iglo5-doors/infills/${filename}`
        });
    }
  }
  
  console.log("\n\nINFILLS JSON:\n");
  console.log(JSON.stringify(infills, null, 2));
}

run();
