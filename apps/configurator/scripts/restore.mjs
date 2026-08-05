import fs from 'fs';
import path from 'path';

(async () => {
    try {
        const rawJsonDir = path.join(process.cwd(), 'outlet_data.json');
        if (!fs.existsSync(rawJsonDir)) {
            console.log("CRITICAL: Original outlet_data.json backup missing.");
            return;
        }

        const rawData = JSON.parse(fs.readFileSync(rawJsonDir, 'utf8'));
        const products = Array.isArray(rawData) ? rawData : rawData.products;

        const mappedProducts = products.map(p => {
             // Basic structure mapped
             return {
                 id: p.name.length + p.width + p.height + (Math.random()*100),
                 name: p.name,
                 type: p.type === 'Okno' ? 'Window' : (p.type === 'Balkon' ? 'Balcony' : (p.type === 'Drzwi' ? 'Door' : p.type)),
                 height: parseInt(p.height, 10),
                 width: parseInt(p.width, 10),
                 material: p.material === 'PCV' || p.material === 'PVC' ? 'PVC' : (p.material === 'Drewno' ? 'Wood' : (p.material === 'Aluminium' ? 'Aluminum' : p.material)),
                 openability: p.openability === 'Do wewnątrz' ? 'Inward' : (p.openability === 'Na zewnątrz' ? 'Outward' : p.openability),
                 innerColor: p.innerColor,
                 outerColor: p.outerColor,
                 price: p.netPrice,
                 currency: 'EUR',
                 imageHashes: p.images || [],
                 localImages: (p.images || []).map(hash => `/outlet/${hash}.jpg`)
             };
        });

        // Write directly to src/data
        const outPath = path.join(process.cwd(), 'src/data/outlet_products.json');
        fs.writeFileSync(outPath, JSON.stringify(mappedProducts, null, 2));
        console.log(`Successfully restored ${mappedProducts.length} items from offline cache.`);

        // Fix the PVC spelling explicitly
        let changed = 0;
        mappedProducts.forEach(p => {
            if (p.material === 'PCV') {
                p.material = 'PVC';
                changed++;
            }
        });
        fs.writeFileSync(outPath, JSON.stringify(mappedProducts, null, 2));

    } catch(e) { console.error(e) }
})();
