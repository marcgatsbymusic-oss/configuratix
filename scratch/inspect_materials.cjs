const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  
  console.log("Waiting 4 seconds for page to render and group to register...");
  await new Promise(r => setTimeout(r, 4000));

  console.log("Inspecting materials in Three.js scene graph...");
  const result = await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) return { error: 'window.assemblyGroup is not defined!' };

    const meshes = [];
    group.traverse((child) => {
      if (child.isMesh && child.material) {
        // Get parent hierarchy names
        const names = [];
        let p = child;
        while (p && p !== group) {
          names.unshift(`${p.type}(${p.name || ''})`);
          p = p.parent;
        }

        let materialInfo = {};
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        materialInfo = mats.map(m => ({
          type: m.type,
          name: m.name,
          color: m.color ? m.color.getHexString() : null,
          visible: m.visible,
          opacity: m.opacity,
          transparent: m.transparent
        }));
        
        meshes.push({
          hierarchy: names.join(' -> '),
          materials: materialInfo
        });
      }
    });

    return { meshes };
  });

  if (result.error) {
    console.error("Error:", result.error);
  } else {
    console.log(`\nFound ${result.meshes.length} meshes in scene:`);
    for (const m of result.meshes) {
      console.log(`Mesh: ${m.hierarchy}`);
      for (const mat of m.materials) {
        console.log(`  Material: type=${mat.type} color=#${mat.color} opacity=${mat.opacity}`);
      }
    }
  }

  await browser.close();
})();
