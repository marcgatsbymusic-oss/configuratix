import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/softline.html', { waitUntil: 'networkidle2' });
  
  const colors = await page.evaluate(() => {
    // Drutex usually stores the color configs in a global variable or data attribute.
    // Let's grab all color swatch blocks
    const result = {
      pine: [],
      meranti: []
    };

    // The tabs might be buttons with text "Pine" or "Meranti"
    const blocks = document.querySelectorAll('.color-item, .color-swatch, .swatch');
    
    // Actually, Drutex color configurator creates an iframe or uses specific classes.
    // Let's just find the entire window object properties that sound like colors.
    
    // Let's look for background images
    const elementsWithBg = Array.from(document.querySelectorAll('*'))
      .map(el => window.getComputedStyle(el).backgroundImage)
      .filter(bg => bg && bg.includes('url') && (bg.includes('kolory') || bg.includes('softline') || bg.includes('drewno')));
      
    // Let's also look for any data attributes containing "kolory"
    const dataElements = Array.from(document.querySelectorAll('[data-colors], [data-config]'))
      .map(el => el.dataset);

    return {
      elementsWithBg: Array.from(new Set(elementsWithBg)),
      dataElements
    };
  });
  
  console.log(JSON.stringify(colors, null, 2));
  await browser.close();
})();
