const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Log browser console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  
  console.log("Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));

  // Inspect the R3F materials first
  console.log("Inspecting R3F materials...");
  await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) {
      console.log("R3F window.assemblyGroup not found!");
      return;
    }
    group.traverse(child => {
      if (child.isMesh && child.name.includes('frmExt')) {
        console.log(`R3F Mesh: ${child.name}, Color: #${child.material.color.getHexString()}`);
      }
    });
  });

  // Switch to Needle Engine Mode
  console.log("Switching to Needle Engine Mode...");
  await page.evaluate(() => {
    // Click on the Needle Engine button
    const buttons = Array.from(document.querySelectorAll('button'));
    const needleBtn = buttons.find(b => b.textContent.includes('Needle Engine'));
    if (needleBtn) {
      needleBtn.click();
    } else {
      console.log("Needle Engine button not found!");
    }
  });

  console.log("Waiting 5 seconds for Needle Engine to load...");
  await new Promise(r => setTimeout(r, 5000));

  // Inspect Needle Engine materials
  console.log("Inspecting Needle Engine materials...");
  await page.evaluate(async () => {
    const engineNode = document.querySelector('needle-engine');
    if (!engineNode) {
      console.log("needle-engine element not found!");
      return;
    }
    const ctx = engineNode.context;
    if (!ctx) {
      console.log("Needle context not found!");
      return;
    }
    console.log("Needle Context exists!");
    const scene = ctx.scene;
    if (!scene) {
      console.log("Needle scene not found!");
      return;
    }
    scene.traverse(child => {
      if (child.isMesh) {
        console.log(`Needle Mesh: ${child.name}, Material Type: ${child.material.type}, Color: #${child.material.color ? child.material.color.getHexString() : 'N/A'}`);
      }
    });
  });

  // Now change color preset and check if it updates in Needle
  console.log("Clicking 'Golden Oak' color preset...");
  await page.evaluate(() => {
    // Open configure sidebar if not open
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
      console.log("Clicked Golden Oak!");
    } else {
      console.log("Golden Oak button not found!");
    }
  });

  console.log("Waiting 5 seconds for export and reload...");
  await new Promise(r => setTimeout(r, 5000));

  // Inspect the R3F materials after color change
  console.log("Inspecting R3F materials after color change...");
  await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) {
      console.log("R3F window.assemblyGroup not found!");
      return;
    }
    group.traverse(child => {
      if (child.isMesh && child.name.includes('frmExt')) {
        console.log(`R3F Mesh: ${child.name}, Color: #${child.material.color.getHexString()}`);
      }
    });
  });

  console.log("Inspecting Needle Engine materials after color change...");
  await page.evaluate(async () => {
    const engineNode = document.querySelector('needle-engine');
    if (!engineNode) {
      console.log("needle-engine element not found!");
      return;
    }
    const ctx = engineNode.context;
    if (!ctx) {
      console.log("Needle context not found!");
      return;
    }
    const scene = ctx.scene;
    if (!scene) {
      console.log("Needle scene not found!");
      return;
    }
    scene.traverse(child => {
      if (child.isMesh && child.name.includes('frmExt')) {
        console.log(`Needle Mesh: ${child.name}, Color: #${child.material.color.getHexString()}`);
      }
    });
  });

  await browser.close();
})();
