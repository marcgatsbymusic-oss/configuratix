import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/external-venetian-blinds.html');
  await page.waitForTimeout(2000);
  
  const pdfs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href.includes('.pdf'));
  });

  const downloadLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.textContent.includes('Download') || a.textContent.includes('Pobierz'))
      .map(a => a.href);
  });

  console.log('PDFs:', pdfs);
  console.log('Download links:', downloadLinks);
  
  // also find "Downloads" section text
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text.includes('Downloads'), text.includes('ROLLER SHUTTERS'));

  await browser.close();
})();
