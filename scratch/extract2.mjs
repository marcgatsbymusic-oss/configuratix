import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const html = fs.readFileSync('scratch/iglo5doors.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

console.log("Videos:", Array.from(document.querySelectorAll('video source')).map(s => s.src));
console.log("Images:", Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s.includes('produkty')));
console.log("Titles:", Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()));
console.log("Lists:", Array.from(document.querySelectorAll('ul li')).map(l => l.textContent.trim()).filter(t => t.length > 5 && t.length < 100));
console.log("Paras:", Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim()).filter(t => t.length > 20));

// Also check background images
const bgElements = document.querySelectorAll('[style*="background-image"]');
console.log("Bg Images:", Array.from(bgElements).map(el => el.style.backgroundImage));

