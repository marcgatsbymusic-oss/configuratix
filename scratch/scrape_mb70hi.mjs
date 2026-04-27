import fs from 'fs';

async function run() {
  const url = 'https://www.drutex.eu/en/products/mb-70hi-windows-alu.html';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  
  // Quick regex based extraction
  
  // 1. Hero Image / Video
  const videoMatch = html.match(/<video[^>]*src="([^"]+)"/);
  const heroImageMatch = html.match(/class="promo-hero"[^>]*style="background-image:\s*url\('([^']+)'\)/);
  
  // 2. Profile Image
  // Looks like <img src="..." alt="Profile MB-70HI" />
  // We'll just grab the first few images to guess
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/g)].map(m => ({src: m[1], alt: m[2]}));
  
  // 3. Technical parameters
  // Usually in <div class="simple-info-box"> or <div class="text">
  const paramBoxes = [...html.matchAll(/<div class="title">([^<]+)<\/div>\s*<div class="text">([^<]+)<\/div>/g)];
  
  // 4. Equipment
  // Usually in a list or <div class="text"> below "Standard equipment"
  const equipMatch = html.match(/Standard equipment[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  
  const result = {
    heroVideo: videoMatch ? videoMatch[1] : null,
    heroImage: heroImageMatch ? heroImageMatch[1] : null,
    images: images.filter(i => i.src.includes('webp') || i.src.includes('png')),
    params: paramBoxes.map(m => ({label: m[1].trim(), value: m[2].trim()})),
    equipmentHTML: equipMatch ? equipMatch[1] : null
  };
  
  fs.writeFileSync('scratch/mb70hi_data.json', JSON.stringify(result, null, 2));
  console.log('Saved to scratch/mb70hi_data.json');
}

run();
