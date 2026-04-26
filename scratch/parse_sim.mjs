import fs from 'fs';

const code = fs.readFileSync('scratch/sim_main.js', 'utf8');

// Look for image URLs
const imgRegex = /["']([^"']+\.(png|webp|jpg|jpeg))["']/g;
let match;
const images = new Set();
while ((match = imgRegex.exec(code)) !== null) {
    images.add(match[1]);
}

console.log(`Found ${images.size} unique image references.`);
// Print first 20 images
console.log(Array.from(images).slice(0, 20));

// Look for common configuration keys like "doors", "models", "colors"
const doorConfigs = code.match(/doors\s*:\s*\[[\s\S]{1,1000}\]/);
if (doorConfigs) {
    console.log("Found doors array!");
} else {
    console.log("No simple 'doors' array found.");
}

// Check for API endpoints
const apiRegex = /["'](https?:\/\/[^"']+)["']/g;
const apis = new Set();
while ((match = apiRegex.exec(code)) !== null) {
    if (!match[1].endsWith('.png') && !match[1].endsWith('.jpg') && !match[1].endsWith('.webp') && !match[1].endsWith('.svg')) {
        apis.add(match[1]);
    }
}
console.log(`Found ${apis.size} URLs that might be APIs.`);
console.log(Array.from(apis).slice(0, 10));

