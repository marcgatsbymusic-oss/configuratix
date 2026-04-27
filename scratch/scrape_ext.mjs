import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. English Scrape
  console.log("Navigating to IGLO EXT (English)...");
  await page.goto('https://www.drutex.eu/en/products/iglo-ext.html', { waitUntil: 'networkidle2' });

  const enData = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video source')).map(s => s.src);
    const images = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(src => src.includes('iglo'));
    
    // Attempt to extract standard equipment list
    const lists = Array.from(document.querySelectorAll('ul.list-checked li, .equipment-list li, .opis_txt ul li, ul li')).map(li => li.innerText.trim()).filter(text => text.length > 5 && !text.includes('Menu') && !text.includes('Contact'));
    
    // Description text
    const descText = Array.from(document.querySelectorAll('.opis_txt p, .description p, .product-description p')).map(p => p.innerText.trim()).filter(t => t.length > 10).join(' ');

    return { videos, images, lists, descText };
  });

  // 2. Spanish Scrape
  console.log("Navigating to IGLO EXT (Spanish)...");
  await page.goto('https://www.drutex.eu/es/productos/iglo-ext.html', { waitUntil: 'networkidle2' });

  const esData = await page.evaluate(() => {
    const lists = Array.from(document.querySelectorAll('ul.list-checked li, .equipment-list li, .opis_txt ul li, ul li')).map(li => li.innerText.trim()).filter(text => text.length > 5 && !text.includes('Menu') && !text.includes('Contacto'));
    const descText = Array.from(document.querySelectorAll('.opis_txt p, .description p, .product-description p')).map(p => p.innerText.trim()).filter(t => t.length > 10).join(' ');
    return { lists, descText };
  });

  console.log("Extracted Media & Content:");
  console.log(JSON.stringify({ en: enData, es: esData }, null, 2));

  await browser.close();
})();
