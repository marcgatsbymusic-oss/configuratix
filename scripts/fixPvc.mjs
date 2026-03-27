import fs from 'fs';
import path from 'path';

try {
    const file = path.join(process.cwd(), 'src/data/outlet_products.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    let changed = 0;
    data.forEach(p => {
        if (p.material === 'PCV') {
            p.material = 'PVC';
            changed++;
        }
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Successfully migrated ${changed} products from PCV to PVC.`);
} catch (e) {
    console.error("Failed to map JSON:", e);
}
