const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.drutex.eu/en/products/iglo-energy-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  const data = await page.evaluate(() => {
    // 1. Hero
    const heroBg = document.querySelector('.hero-bg')?.style.backgroundImage;
    const heroVideo = document.querySelector('video source')?.src;
    const tagline = document.querySelector('.product-tagline, .module-header-subtitle')?.innerText;
    
    // 2. Blueprint & Profile Image
    const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
    const blueprints = images.filter(src => src.includes('przekroj') || src.includes('blueprint') || src.includes('technical'));
    const profile = images.filter(src => src.includes('profil') || src.includes('drzwi_') || src.includes('okno_'));
    
    // 3. Colors
    const colorSwatches = Array.from(document.querySelectorAll('.color-swatch, .color-item')).map(el => {
      const name = el.getAttribute('data-name') || el.innerText.trim();
      const img = el.querySelector('img')?.src;
      return { name, img };
    });

    // 4. Equipment
    const equipment = Array.from(document.querySelectorAll('.equipment-list li, .standard-equipment li')).map(el => el.innerText.trim());
    
    // 5. Specs
    const specs = Array.from(document.querySelectorAll('.spec-item, .tech-param')).map(el => {
      return {
        label: el.querySelector('.label')?.innerText.trim(),
        value: el.querySelector('.value')?.innerText.trim()
      };
    });

    return { heroBg, heroVideo, tagline, blueprints, profile, colorSwatches, equipment, specs, allImages: images };
  });

  fs.writeFileSync('iglo_energy_doors_data.json', JSON.stringify(data, null, 2));
  console.log('Scraped data saved to iglo_energy_doors_data.json');
  
  await browser.close();
})();
