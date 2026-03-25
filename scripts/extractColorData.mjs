import { chromium } from 'playwright';
import fs from 'fs';

async function extractColors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://fensternorm.com/konfigurator/fenster/kunststoff/trocal-70-eco/c1', { waitUntil: 'load', timeout: 60000 });
  
  // Wait for the document to be fully active
  await page.waitForTimeout(3000);
  
  const colorData = await page.evaluate(() => {
    const results = {
      groups: [],
      colors: {}
    };

    // Find the colors section
    // Fensternorm typically has a step for "Dekore & Farben". 
    // We can look for elements with class 'fnItemOption' that have a 'data-id' starting with 'c' (for color) and are inside the color step.
    // However, it's safer to find the actual category tabs.
    const groupTabs = document.querySelectorAll('.fnColorCategories .fnCategoryTab, .fnCategories .fnCategory');
    if (groupTabs.length > 0) {
      // Loop groups
      for (const tab of groupTabs) {
        const groupName = tab.innerText.trim();
        results.groups.push(groupName);
      }
    }
    
    // Attempt universal extraction of all colors
    // We look for color buttons. They often have an image (.fnColorImg) or a background style
    const colorOptions = document.querySelectorAll('.fnItemOption[data-id^="c"]');
    for (const opt of colorOptions) {
      const id = opt.getAttribute('data-id');
      const name = opt.getAttribute('data-name') || opt.innerText.trim() || id;
      
      let bgStyle = '';
      const imgEl = opt.querySelector('img');
      const divWithBg = opt.querySelector('.bg-image, .color-swatch, .fnColorImg, div[style*="background"]');
      
      if (imgEl && imgEl.src) {
        bgStyle = `url(${imgEl.src})`;
      } else if (divWithBg && divWithBg.style.backgroundImage) {
        bgStyle = divWithBg.style.backgroundImage;
      } else if (divWithBg && divWithBg.style.backgroundColor) {
        bgStyle = divWithBg.style.backgroundColor;
      } else if (opt.style.backgroundImage) {
        bgStyle = opt.style.backgroundImage;
      }

      // Try to determine group based on active tab or structure
      // Easiest is to simulate clicking each group tab to see which colors are visible, 
      // but evaluating visibility is complex in a single pass. 
      // We will grab the swatches first!
      if (id && id.startsWith('c') && id.match(/^c\d+$/)) {
        results.colors[id] = {
           name,
           bgStyle
        };
      }
    }
    
    return results;
  });

  console.log("Raw Extracted Data:", JSON.stringify(colorData, null, 2));

  fs.writeFileSync('C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/scripts/colorSwatches.json', JSON.stringify(colorData, null, 2));
  console.log("Saved color swatches to colorSwatches.json");

  await browser.close();
}

extractColors().catch(console.error);
