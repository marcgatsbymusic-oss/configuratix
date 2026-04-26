const fs = require('fs');

function extractAddons(filename, typeId) {
    if (!fs.existsSync(filename)) {
        console.log(`File ${filename} not found`);
        return;
    }
    const html = fs.readFileSync(filename, 'utf8');
    const items = [];
    
    // Find all gallery items
    const galleryMatches = html.match(/<div[^>]*class="gallery-item"[^>]*>([\s\S]*?)<\/ul>/g) || [];
    
    galleryMatches.forEach(block => {
        const imgMatch = block.match(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/);
        const subtextMatches = block.match(/<span[^>]*class="subtext"[^>]*>([\s\S]*?)<\/span>/g) || [];
        const subtexts = subtextMatches.map(m => m.replace(/<[^>]*>/g, '').trim());
        
        const ulMatch = block.match(/<div[^>]*class="menu-title"[^>]*>([\s\S]*?)<\/div>\s*<ul>([\s\S]*?)<\/ul>/);
        const products = [];
        if (ulMatch) {
            const liMatches = ulMatch[2].match(/<a[^>]*>([\s\S]*?)<\/a>/g) || [];
            liMatches.forEach(li => {
                products.push(li.replace(/<[^>]*>/g, '').trim());
            });
        }
        
        if (imgMatch) {
            items.push({
                image: imgMatch[1],
                title: imgMatch[2].trim(),
                descriptions: subtexts,
                applicableProducts: products
            });
        }
    });

    console.log(`\n--- Type ${typeId} ---`);
    console.log('Items:', items.length);
    if (items.length > 0) {
        fs.writeFileSync(`addons_data_${typeId}.json`, JSON.stringify(items, null, 2));
    }
}

['5', '602'].forEach(id => extractAddons('addons_' + id + '.html', id));
