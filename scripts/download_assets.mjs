import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const downloads = [
  { url: 'https://www.drutex.eu/media/_upload/produkty/iglo-edge-slide/video/iglo_edge_slide_-_pr_l.png', dest: 'public/assets/iglo-edge-slide-profile.png' },
  { url: 'https://www.drutex.eu/media/_upload/produkty/iglo-edge-slide/video/iglo_edge_slide_-_c.png', dest: 'public/assets/iglo-edge-slide-cross-section.png' },
  { url: 'https://www.drutex.eu/media/_upload/produkty/iglo-edge-slide/video/iglo-edge-slide-video-mobile-cover.mp4', dest: 'public/assets/iglo-edge-slide-hero.mp4' },
  { url: 'https://www.drutex.eu/media/_upload/produkty/iglo-edge-slide/video/iglo-edge-slide-product.mp4', dest: 'public/assets/iglo-edge-slide-product.mp4' },
];

async function downloadFile(url, dest) {
  console.log(`Downloading ${url} to ${dest}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const fileStream = fs.createWriteStream(dest);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function run() {
  for (const item of downloads) {
    try {
      await downloadFile(item.url, item.dest);
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Done downloading assets.");
}

run();
