import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  const structures = await page.evaluate(() => {
    // Find the text "Door structures"
    const allHeaders = Array.from(document.querySelectorAll('h3, h2, h4, div'));
    const structureHeader = allHeaders.find(el => el.textContent.trim() === 'Door structures' || el.textContent.trim() === 'Konstrukcje drzwiowe');
    
    if (!structureHeader) return { error: "Header not found" };
    
    // Find the container for this section
    const parent = structureHeader.closest('section, .content, .container, .t-section');
    
    if (!parent) return { error: "Parent not found" };
    
    const images = Array.from(parent.querySelectorAll('img')).map(img => {
      return {
        src: img.src,
        alt: img.alt,
        className: img.className
      };
    });

    return { images };
  });
  
  console.log(JSON.stringify(structures, null, 2));
  await browser.close();
})();
