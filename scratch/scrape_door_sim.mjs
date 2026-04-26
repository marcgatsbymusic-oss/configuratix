import fs from 'fs';

async function run() {
    const res = await fetch('https://wizualizator.drutex.pl/');
    const html = await res.text();
    
    // Look for scripts
    const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
    }
    
    console.log("Found scripts:", scripts);
    
    // We can also download the main JS file to look for configuration JSONs
    if (scripts.length > 0) {
        for (const scriptUrl of scripts) {
            if (scriptUrl.includes('main') || scriptUrl.includes('app') || scriptUrl.includes('index')) {
                const fullUrl = scriptUrl.startsWith('http') ? scriptUrl : 'https://wizualizator.drutex.pl' + (scriptUrl.startsWith('/') ? '' : '/') + scriptUrl;
                console.log(`Fetching JS: ${fullUrl}`);
                const jsRes = await fetch(fullUrl);
                const jsCode = await jsRes.text();
                fs.writeFileSync('scratch/sim_main.js', jsCode);
                console.log(`Saved sim_main.js (${jsCode.length} bytes)`);
            }
        }
    }
}

run().catch(console.error);
