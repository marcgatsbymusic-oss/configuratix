const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  
  console.log("Waiting 3 seconds for 3D components to render...");
  await new Promise(r => setTimeout(r, 3000));

  console.log("Evaluating DOM for blind controls...");
  const domInfo = await page.evaluate(() => {
    // Let's find all div elements and filter them
    const allDivs = Array.from(document.querySelectorAll('div'));
    const matchingDivs = allDivs.filter(div => {
      const text = div.textContent ? div.textContent.trim() : '';
      return text === '▲' || text === 'NET' || div.title && (div.title.toLowerCase().includes('blind') || div.title.toLowerCase().includes('mosquito'));
    });

    return matchingDivs.map(div => {
      const rect = div.getBoundingClientRect();
      const style = window.getComputedStyle(div);
      
      // Traverse parent elements to see if any parent is hiding it
      const parentChain = [];
      let parent = div.parentElement;
      while (parent) {
        const pStyle = window.getComputedStyle(parent);
        parentChain.push({
          tagName: parent.tagName,
          className: parent.className,
          display: pStyle.display,
          visibility: pStyle.visibility,
          opacity: pStyle.opacity,
          transform: pStyle.transform,
          overflow: pStyle.overflow
        });
        parent = parent.parentElement;
      }

      return {
        text: div.textContent.trim(),
        title: div.title,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        style: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: style.position,
          zIndex: style.zIndex,
          transform: style.transform
        },
        parentChain: parentChain.slice(0, 5) // check first 5 parents
      };
    });
  });

  console.log("Found matches in DOM:", JSON.stringify(domInfo, null, 2));

  const screenshotPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\955cdaf9-8d0b-4bc2-b448-c22658430c6b\\igls_hotspots.png';
  console.log(`Taking screenshot and saving to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath });
  console.log("Screenshot saved!");

  await browser.close();
})();
