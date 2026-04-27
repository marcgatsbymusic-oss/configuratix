import puppeteer from 'puppeteer';
import fs from 'fs';

async function extract() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const results = {};

  const extractCommon = async (url) => {
    await page.goto(url, { waitUntil: 'networkidle2' });
    return await page.evaluate(() => {
      const name = document.querySelector('h1')?.innerText?.trim();
      const tagline = document.querySelector('.product-header__subtitle, h2, .slogan')?.innerText?.trim();
      const description = document.querySelector('.product-desc, #description p')?.innerText?.trim();
      
      const specs = [];
      document.querySelectorAll('.specs-item, .tech-data li, .comparison-table tr').forEach(el => {
         specs.push(el.innerText.trim());
      });

      const equipment = [];
      document.querySelectorAll('#description ul li, .standard-equipment li').forEach(el => {
         equipment.push(el.innerText.trim());
      });

      const images = {
        hero: document.querySelector('.hero-image img, .product-slider img')?.src,
        profile: document.querySelector('.profile-image img, img[src*="profil"]')?.src,
        blueprint: document.querySelector('.blueprint img, img[src*="okno_c"], img[src*="section"]')?.src
      };

      const colors = [];
      document.querySelectorAll('.color-item, .swatch').forEach(el => {
         const name = el.innerText.trim() || el.getAttribute('title') || el.querySelector('img')?.alt;
         const swatch = el.querySelector('img')?.src;
         const large = el.getAttribute('data-image') || el.getAttribute('data-large');
         if (name && swatch) colors.push({ name, swatch, large });
      });

      return { name, tagline, description, specs, equipment, images, colors };
    });
  };

  results['mb-70'] = await extractCommon('https://www.drutex.eu/en/products/mb-70-windows-alu.html');
  results['mb-45'] = await extractCommon('https://www.drutex.eu/en/products/mb-45-windows-alu.html');
  results['softline'] = await extractCommon('https://www.drutex.eu/en/products/softline.html');
  results['duoline'] = await extractCommon('https://www.drutex.eu/en/products/duoline.html');
  results['iglo-energy-doors'] = await extractCommon('https://www.drutex.eu/en/products/iglo-energy-doors-pvc.html');
  results['iglo5-doors'] = await extractCommon('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');

  fs.writeFileSync('scratch/product_data.json', JSON.stringify(results, null, 2));
  await browser.close();
  console.log('Done extracting.');
}

extract().catch(console.error);
