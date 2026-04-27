import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport to desktop to ensure all elements load
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log("Navigating to Drutex MB-86N SI page...");
  await page.goto('https://www.drutex.eu/en/products/mb-86si-windows-alu.html', { waitUntil: 'networkidle2' });

  console.log("Extracting colors...");
  const colorData = await page.evaluate(() => {
    const colors = [];
    // The color swatches are usually list items or divs in a specific container.
    // Let's find elements that look like color swatches.
    const swatchElements = document.querySelectorAll('.color-item, .ral-color, .color, [data-color]'); // Fallbacks
    
    // We can also try to find the container
    const container = document.querySelector('#colors, .colors-section, .product-colors');
    
    if (container) {
       const buttons = container.querySelectorAll('button, a, .swatch');
       buttons.forEach(btn => {
           let name = btn.getAttribute('title') || btn.innerText;
           let hex = btn.style.backgroundColor;
           let image = btn.style.backgroundImage;
           let dataImage = btn.getAttribute('data-image') || btn.getAttribute('data-src');
           if (name && (hex || image || dataImage)) {
               colors.push({ name: name.trim(), hex, image, windowImage: dataImage });
           }
       });
    } else {
       // Just grab all elements with a title that has "RAL"
       const ralEls = document.querySelectorAll('[title*="RAL"]');
       ralEls.forEach(el => {
           colors.push({
               name: el.getAttribute('title'),
               hex: el.style.backgroundColor,
               windowImage: el.getAttribute('data-image') || el.getAttribute('data-window-img')
           });
       });
    }
    return colors;
  });

  console.log(`Found ${colorData.length} colors.`);
  fs.writeFileSync('mb86n_colors.json', JSON.stringify(colorData, null, 2));

  // Extract Hero Image/Video
  const heroData = await page.evaluate(() => {
      const heroVideo = document.querySelector('.hero video, .header video, video[autoplay]');
      const heroBg = document.querySelector('.hero, .header, #header');
      return {
          videoSrc: heroVideo ? heroVideo.src || heroVideo.querySelector('source')?.src : null,
          bgImage: heroBg ? window.getComputedStyle(heroBg).backgroundImage : null
      };
  });
  console.log("Hero Data:", heroData);

  await browser.close();
})();
