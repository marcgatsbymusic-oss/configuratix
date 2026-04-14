import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pvcUrls = [
  'https://www.drutex.eu/en/products/iglo-edge.html',
  'https://www.drutex.eu/en/products/iglo-energy.html',
  'https://www.drutex.eu/en/products/iglo-energy-classic.html',
  'https://www.drutex.eu/en/products/iglo-energy-alu-cover.html',
  'https://www.drutex.eu/en/products/iglo5.html',
  'https://www.drutex.eu/en/products/iglo5-classic.html',
  'https://www.drutex.eu/en/products/iglo-light.html',
  'https://www.drutex.eu/en/products/iglo-ext.html',
  'https://www.drutex.eu/en/products/iglo-premier.html',
  'https://www.drutex.eu/en/products/ideal-neo-ad.html',
  'https://www.drutex.eu/en/products/ideal-neo-md.html',
  'https://www.drutex.eu/en/products/ideal-neo-md-fs.html',
  'https://www.drutex.eu/en/products/ideal-neo-md-monoblock.html',
  'https://www.drutex.eu/en/products/ideal-neo-md-renovation.html',
  'https://www.drutex.eu/en/products/ideal-7000-nl.html'
];

async function run() {
  const specs = {};

  for (const url of pvcUrls) {
    try {
      console.log(`Fetching ${url}...`);
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      const id = url.split('/').pop().replace('.html', '').replace(/-/g, '');

      // Get short description
      const descText = $('.product__content, #description').text();
      const matchDesc = descText.split('Standard equipment')[0];
      const description = matchDesc ? matchDesc.trim().replace(/\s+/g, ' ') : '';
      
      const fullText = $('body').text().replace(/\s+/g, ' ');

      // Regex matching
      const soundMatch = fullText.match(/(\d{2}-\d{2}\s*dB|\d{2}\s*dB|dB\s*=\s*\d{2}-\d{2}|dB\s*=\s*\d{2})/i);
      const gasketsMatch = fullText.match(/(\d+)\s*(EPDM)?\s*gasket/i);
      const uwMatch = fullText.match(/Uw\s*=\s*[0-9,.]+\s*W\/\(m2K\)/i);
      const chambersMatch = fullText.match(/(\d+|\d+\/\d+)\s*(-chamber| chamber)/i);
      const classMatch = fullText.match(/\b([AB])[- ]class\b/i) || fullText.match(/class\s*([AB])/i);
      const depthMatch = fullText.match(/(\d{2,3})\s*mm\s*installation depth/i) || fullText.match(/INSTALLATION DEPTH\s*(\d{2,3})\s*mm/i);

      specs[id] = {
        name: url.split('/').pop().replace('.html', '').toUpperCase().replace(/-/g, ' '),
        description,
        technical: {
          soundInsulation: soundMatch ? soundMatch[1] : 'N/A',
          gaskets: gasketsMatch ? gasketsMatch[1] : 'N/A',
          thermalTransmittance: uwMatch ? uwMatch[0] : 'N/A',
          chambers: chambersMatch ? chambersMatch[1] : 'N/A',
          installationDepth: depthMatch ? depthMatch[1] + ' mm' : 'N/A',
          profileClass: classMatch ? classMatch[1] + ' class' : 'N/A'
        }
      };
      
      console.log(`  -> ${id} Uw: ${specs[id].technical.thermalTransmittance}`);

    } catch (e) {
      console.error(`Error with ${url}: ${e.message}`);
    }
  }

  // Save to file
  const outputPath = path.join(__dirname, 'src', 'data', 'technical_specs.json');
  fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
  console.log(`Saved output to ${outputPath}`);
}

run();
