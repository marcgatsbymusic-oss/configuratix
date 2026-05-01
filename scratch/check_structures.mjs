import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  const structures = await page.evaluate(() => {
    // Find the text "Door structures" and grab the images below it
    const allHeaders = Array.from(document.querySelectorAll('h3, h2, h4, div'));
    const structureHeader = allHeaders.find(el => el.textContent.trim() === 'Door structures');
    
    if (!structureHeader) return { error: "Header not found" };
    
    // Find images near it, probably in a slider or grid
    // We can just grab all images inside the parent container
    const parent = structureHeader.closest('section, .content, .container') || document.body;
    const images = Array.from(parent.querySelectorAll('img')).map(img => img.src);
    
    // Specifically looking for images that match "schema", "drzwi", "przyklad", "example"
    const relevantImages = Array.from(document.querySelectorAll('img')).map(img => {
      return {
        src: img.src,
        alt: img.alt,
        className: img.className
      };
    }).filter(img => img.src.includes('przyklad') || img.src.includes('schemat') || img.src.includes('structure') || img.alt.includes('Example'));

    return { relevantImages };
  });
  
  console.log(JSON.stringify(structures, null, 2));
  await browser.close();
})();
