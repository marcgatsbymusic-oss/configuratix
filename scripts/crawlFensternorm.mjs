import { chromium } from 'playwright';
import fs from 'fs';

let configDb = [];

async function scrapeWindowType(browser, wt) {
  const page = await browser.newPage();
  
  try {
    await page.goto('https://fensternorm.com/konfigurator/fenster/kunststoff/trocal-70-eco/c1', { waitUntil: 'load', timeout: 60000 });
    
    // Select Fenstertyp by directly clicking the underlying option
    await page.evaluate((id) => {
       const option = document.querySelector(`.fnItemOption[data-id="${id}"]`);
       if (option) option.click();
    }, wt.id);
    
    await page.waitForTimeout(3500); 
    wt.pos1Html = await page.evaluate(() => document.querySelector('.fnSchemeIframe')?.innerHTML || '');
    
    // We need to get the Opening Types. The easiest way is to click "Wechseln" to populate the modal, 
    // then extract them.
    const wechselnButtons = page.locator('text=Wechseln');
    if (await wechselnButtons.nth(2).isVisible().catch(()=>false)) {
       await wechselnButtons.nth(2).click({ force: true }).catch(()=>{});
    }
    await page.waitForTimeout(2000);
    
    const openingTypes = await page.evaluate(() => {
       const activeModal = Array.from(document.querySelectorAll('.modal')).find(m => m.offsetWidth > 0);
       if(!activeModal) return [];
       return Array.from(activeModal.querySelectorAll('.fnItemOption')).map(o => ({
          id: o.getAttribute('data-id'),
          name: o.getAttribute('data-name'),
          imgUrl: o.querySelector('img')?.src
       }));
    });
    
    wt.openings = [];
    for(let j = 0; j < Math.min(openingTypes.length, 3); j++) {
       const ot = openingTypes[j];
       
       await page.evaluate((id) => {
          const option = document.querySelector(`.fnItemOption[data-id="${id}"]`);
          if(option) option.click();
       }, ot.id);
       
       await page.waitForTimeout(3500);
       ot.pos1Html = await page.evaluate(() => document.querySelector('.fnSchemeIframe')?.innerHTML || '');
       wt.openings.push(ot);
    }
  } catch(e) {
    console.error(`Error processing ${wt.name}:`, e.message);
  } finally {
    await page.close();
  }
  
  return wt;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  let windowTypes = [
     {"id": "67", "name": "1 Flügel"},     // Found in my manual fensternorm_text log
     {"id": "69", "name": "2 Flügel"}      // I am just guessing IDs based on fensternorm_text or subagent
  ];
  
  // Wait, let's just extract the window types first to be 100% accurate
  const extractPage = await browser.newPage();
  await extractPage.goto('https://fensternorm.com/konfigurator/fenster/kunststoff/trocal-70-eco/c1', { waitUntil: 'load' });
  await extractPage.locator('text=Wechseln').nth(1).click({ force: true }).catch(()=>{});
  await extractPage.waitForTimeout(2000);
  windowTypes = await extractPage.evaluate(() => {
     const activeModal = Array.from(document.querySelectorAll('.modal')).find(m => m.offsetWidth > 0);
     if(!activeModal) return [];
     return Array.from(activeModal.querySelectorAll('.fnItemOption')).map(o => ({
       id: o.getAttribute('data-id'),
       name: o.getAttribute('data-name'),
       imgUrl: o.querySelector('img')?.src
     }));
  });
  await extractPage.close();
  
  console.log(`Found ${windowTypes.length} Window Types dynamically.`);
  windowTypes = windowTypes.slice(0, 3); // Testing cap
  
  for(let i = 0; i < windowTypes.length; i++) {
     console.log(`[${i+1}/${windowTypes.length}] Fenstertyp: ${windowTypes[i].name}`);
     const result = await scrapeWindowType(browser, windowTypes[i]);
     configDb.push(result);
  }
  
  fs.writeFileSync('fensternorm_db_test.json', JSON.stringify(configDb, null, 2));
  console.log("Saved robust extraction to fensternorm_db_test.json");
  await browser.close();
}

run().catch(console.error);
