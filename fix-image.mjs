import sharp from 'sharp';

async function processImage(filename) {
  const inputFile = `public/assets/windowcolors/wingloedgeframeswithcolor/${filename}.webp`;
  const outputFile = `public/assets/windowcolors/wingloedgeframeswithcolor/${filename}-fixed.webp`;
  
  const { data, info } = await sharp(inputFile)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
  .webp()
  .toFile(outputFile);
  
  console.log(`Fixed ${filename} successfully!`);
}

async function run() {
  await processImage('grafito-arena');
  await processImage('azul-acero');
}

run().catch(console.error);
