import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/', { waitUntil: 'networkidle2' });

  const menuItems = await page.evaluate(() => {
    const items = [];
    // Looking at common structures for menus, usually inside a nav or header
    // Let's find all links or list items that might be the main menu
    // And extract their text and SVG
    const links = document.querySelectorAll('a, button, li');
    for (const el of links) {
      const text = el.textContent.trim().toUpperCase();
      const svg = el.querySelector('svg');
      if (svg && ['WINDOWS', 'DOORS', 'TERRACE SYSTEMS', 'SHUTTERS', 'EXTERIOR VENETIAN BLINDS', 'INSECT SCREENS', 'GARAGE DOORS', 'FACADES / WINTER GARDENS', 'PERGOLA', 'SMART HOME'].includes(text)) {
        if (!items.find(i => i.name === text)) {
          items.push({ name: text, svg: svg.outerHTML });
        }
      }
    }
    return items;
  });

  fs.writeFileSync('drutex_icons.json', JSON.stringify(menuItems, null, 2));
  console.log(`Found ${menuItems.length} icons.`);
  await browser.close();
})();
