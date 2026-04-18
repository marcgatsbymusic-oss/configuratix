const fs = require('fs');
const path = require('path');
const sourceDir = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\Screenshots\\Window & Balcony Types\\Windows';
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpg')).sort();
let html = '<html><body><h1>Window Types</h1><div style="display:flex; flex-wrap:wrap;">';
files.forEach(f => {
  html += '<div style="margin:10px; width:200px;"><p>' + f + '</p><img src="' + path.join(sourceDir, f).replace(/\\/g, '/') + '" style="width:100%"/></div>';
});
html += '</div></body></html>';
fs.writeFileSync('public/gallery.html', html);
