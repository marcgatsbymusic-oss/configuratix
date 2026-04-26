import fs from 'fs';
import * as cheerio from 'cheerio';

async function fetchAssets() {
  const res = await fetch('https://www.drutex.eu/en/products/iglo-edge-slide.html');
  const html = await res.text();
  const $ = cheerio.load(html);

  const images = [];
  const videos = [];
  $('video source').each((i, el) => {
    videos.push($(el).attr('src'));
  });

  console.log('Images:', images.filter(img => img && img.includes('iglo-edge-slide')));
  console.log('Videos:', videos);
}

fetchAssets();
