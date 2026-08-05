import * as cheerio from 'cheerio';
import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return; // Skip if already downloaded
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const fileStream = fs.createWriteStream(dest);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function run() {
  const html = fs.readFileSync('temp_slide.html', 'utf8');
  const $ = cheerio.load(html);

  const colors = [];
  
  $('[data-color-frame]').each((i, el) => {
    let frameUrl = $(el).attr('data-color-frame');
    let colorId = $(el).attr('data-color-id') || $(el).attr('data-id') || $(el).text().trim() || `color_${i}`;
    let colorName = $(el).find('.title').text().trim() || $(el).attr('title') || colorId;
    let thumbUrl = $(el).attr('data-color-img') || $(el).find('img').attr('src') || $(el).css('background-image');

    if (frameUrl && frameUrl.includes('.webp')) {
       // Decode the base64 URL inside the webp path
       // e.g. /media/webp/80/L21l...==.webp
       const match = frameUrl.match(/\/media\/webp\/\d+\/(.*?)\.webp/);
       if (match && match[1]) {
           try {
               const decoded = Buffer.from(match[1], 'base64').toString('utf8');
               frameUrl = 'https://www.drutex.eu' + decoded;
           } catch (e) {
               frameUrl = 'https://www.drutex.eu' + frameUrl;
           }
       } else {
           frameUrl = 'https://www.drutex.eu' + frameUrl;
       }
    } else if (frameUrl) {
       frameUrl = 'https://www.drutex.eu' + frameUrl;
    }

    colors.push({
      id: colorId,
      name: colorName,
      frameUrl,
      thumbUrl
    });
  });

  console.log(`Found ${colors.length} color frames.`);
  
  // Now write to JSON so I can inspect it
  fs.writeFileSync('scripts/slide_colors.json', JSON.stringify(colors, null, 2));
}

run();
