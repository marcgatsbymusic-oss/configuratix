import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\Configurator images\\Materials\\ideal-neo-md.jpg";
const outputPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\Configurator images\\Materials\\ideal-neo-md.png";

async function removeBackground() {
  console.log(`Processing: ${inputPath}`);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  
  // Custom logic: remove pure or near-pure white pixels
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if pixel is white or very light gray
    if (r > 240 && g > 240 && b > 240) {
      if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
        // Simple threshold cutoff
        data[i + 3] = 0; // Pure white becomes fully transparent
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent image to: ${outputPath}`);
}

removeBackground().catch(console.error);
