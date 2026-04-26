const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extractData(html, typeId) {
    const data = { id: typeId, heroImage: null, products: [] };
    
    const heroRegex = /background(?:-image)?\s*:\s*url\((['"]?)(.*?)(['"]?)\)/;
    const heroMatch = html.match(heroRegex);
    if (heroMatch) {
        data.heroImage = heroMatch[2].startsWith('http') ? heroMatch[2] : 'https://www.drutex.eu' + heroMatch[2];
    }

    const productRegex = /<div class="gallery-item"[^>]*>[\s\S]*?<img src="([^"]+)" alt="([^"]*)"[\s\S]*?<div class="text">([^<]+)/gi;
    let match;
    while ((match = productRegex.exec(html)) !== null) {
        let imgUrl = match[1].startsWith('http') ? match[1] : 'https://www.drutex.eu' + match[1];
        let name = match[3].trim() || match[2].trim();
        
        const localContext = html.substring(match.index, match.index + 5000);
        const ulMatch = localContext.match(/Application possibilities in:<\/div>\s*<ul>([\s\S]*?)<\/ul>/i);
        let applications = [];
        if (ulMatch) {
            const liRegex = /<a[^>]*>\s*(.*?)\s*<\/a>/gi;
            let liMatch;
            while ((liMatch = liRegex.exec(ulMatch[1])) !== null) {
                applications.push(liMatch[1].replace(/<[^>]*>?/gm, '').trim().replace(/\s+/g, ' '));
            }
        }

        data.products.push({
            name,
            image: imgUrl,
            applications
        });
    }

    return data;
}

async function run() {
    const types = [4, 5, 6, 272, 602];
    const results = {};
    for (let t of types) {
        console.log('Fetching type', t);
        const html = await fetchUrl('https://www.drutex.eu/en/products/addons/type/' + t + '/');
        results[t] = extractData(html, t);
    }
    fs.writeFileSync('src/data/addonsData.json', JSON.stringify(results, null, 2));
    console.log('Done. Wrote src/data/addonsData.json');
}

run();
