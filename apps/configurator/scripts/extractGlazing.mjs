import fs from 'fs';
import path from 'path';

async function generateGlazing() {
    try {
        // Since Cantor constructs glass BOMs dynamically (via scripts and GLASS_BOM matrices), 
        // we export the standard configurations universally recognized for these systems.
        const mappedGlazing = [
            {
                id: "GL-4-16-4",
                name: "4/16/4 (Double Glazing)",
                panes: 2,
                thickness: 24,
                uValue: 1.1,
                weight: 20,
                compatibleSystems: ["I5", "IE", "IP"]
            },
            {
                id: "GL-4-18-4-18-4",
                name: "4/18/4/18/4 (Triple Glazing)",
                panes: 3,
                thickness: 48,
                uValue: 0.5,
                weight: 30,
                compatibleSystems: ["IE"] // Iglo Energy
            },
            {
                id: "GL-4-12-4-12-4",
                name: "4/12/4/12/4 (Triple Glazing)",
                panes: 3,
                thickness: 36,
                uValue: 0.7,
                weight: 30,
                compatibleSystems: ["I5", "IE", "IP"]
            }
        ];

        const outPath = path.resolve('./scripts/data');
        if(!fs.existsSync(outPath)) fs.mkdirSync(outPath);
        
        fs.writeFileSync(path.join(outPath, 'glazing.json'), JSON.stringify(mappedGlazing, null, 2), 'utf8');
        console.log(`Successfully mapped ${mappedGlazing.length} standard Glazing packages.`);

    } catch (err) {
        console.error("Error writing data:", err.message);
    }
}

generateGlazing();
