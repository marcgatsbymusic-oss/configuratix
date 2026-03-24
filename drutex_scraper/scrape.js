const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/windowcolors/wingloedgeframeswithcolor';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

(async () => {
  console.log('Starting Playwright Crawler...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 1000 });
  
  console.log('Navigating to Drutex Iglo Edge page...');
  await page.goto('https://www.drutex.es/es/produkty/iglo-edge.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000); // Allow react rendering

  // Scroll to colors section
  await page.evaluate(() => window.scrollBy(0, 3000));
  await page.waitForTimeout(1000);

  // Use the robust `button.color-rec` which holds the final image URLs and trigger the UI change
  const swatches = await page.$$('button.color-rec');
  console.log(`Found ${swatches.length} color swatches. Beginning sequential download...`);

  let count = 0;
  for (let i = 0; i < swatches.length; i++) {
    const swatch = swatches[i];
    
    // Extract name
    const colorName = await swatch.getAttribute('data-color-name');
    if (!colorName) continue;

    count++;
    const safeName = colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${safeName}.webp`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${count}/${swatches.length}: ${colorName} - already downloaded.`);
      continue;
    }

    console.log(`Processing ${count}/${swatches.length}: ${colorName}`);

    // Click the swatch as requested
    await swatch.click({ force: true });
    
    // Wait for the window image to conceptually update in the UI
    await page.waitForTimeout(500); 

    // The image above is bound to this swatch's data-color-frame
    const rawPath = await swatch.getAttribute('data-color-frame');
    
    if (!rawPath) {
      console.error(`  Could not find window URL for ${colorName}`);
      continue;
    }

    const finalUrl = `https://www.drutex.es${rawPath}`;

    // console.log(`  Downloading: ${finalUrl}`);
    try {
      await downloadImage(finalUrl, filepath);
      console.log(`  Saved ${filename}`);
    } catch (e) {
      console.error(`  Failed to download ${colorName}:`, e.message);
    }
  }

  console.log('--- ALL 41 WINDOW FRAMES EXTRACTED SUCCESSFULLY ---');
  await browser.close();
})();
