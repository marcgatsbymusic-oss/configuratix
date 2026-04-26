
const fs = require('fs');
const html = fs.readFileSync('drutex_addons.html', 'utf8');

const appIdx = html.indexOf('APPLICATION POSSIBILITIES IN:');
if (appIdx > -1) {
    const context = html.substring(appIdx, appIdx + 2000);
    // remove tags to see text
    const plainText = context.replace(/<[^>]*>/g, '\n');
    const lines = plainText.split('\n').map(l => l.trim()).filter(l => l);
    console.log(lines.slice(0, 35));
} else {
    console.log('Not found');
}

