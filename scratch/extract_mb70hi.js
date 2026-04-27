const fs = require('fs');
const html = fs.readFileSync('scratch/mb70hi_raw.html', 'utf8');

const heroMatch = html.match(/class="promo-hero"[^>]*style="background-image:\s*url\('([^']+)'\)/);
if (heroMatch) console.log('HERO: ' + heroMatch[1]);

const technicalMatch = html.match(/<div class="simple-info-box">[\s\S]*?<\/div>\s*<\/div>/g);
if (technicalMatch) {
    technicalMatch.forEach(m => {
        let title = m.match(/<div class="title">([^<]+)<\/div>/);
        let text = m.match(/<div class="text">([^<]+)<\/div>/);
        if (title && text) {
            console.log(title[1].trim() + ' : ' + text[1].trim());
        }
    });
}
