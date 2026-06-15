const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 4000));

  console.log("=== BEFORE COLOR CHANGE ===");
  await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) {
      console.log("Group not found!");
      return;
    }
    console.log(`Group has ${group.children.length} direct children.`);
    group.traverse(child => {
      if (child.isMesh) {
        console.log(`Mesh: name="${child.name}", color=#${child.material.color ? child.material.color.getHexString() : 'N/A'}`);
      }
    });
  });

  console.log("Clicking Golden Oak...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const configBtn = buttons.find(b => b.textContent.includes('Configure'));
    if (configBtn) configBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const goldenOakBtn = buttons.find(b => b.textContent.includes('Golden Oak'));
    if (goldenOakBtn) {
      goldenOakBtn.click();
    } else {
      console.log("Golden Oak button not found!");
    }
  });

  console.log("Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));

  console.log("=== AFTER COLOR CHANGE ===");
  await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) {
      console.log("Group not found!");
      return;
    }
    console.log(`Group has ${group.children.length} direct children.`);
    group.traverse(child => {
      if (child.isMesh) {
        console.log(`Mesh: name="${child.name}", color=#${child.material.color ? child.material.color.getHexString() : 'N/A'}`);
      }
    });
  });

  await browser.close();
})();
