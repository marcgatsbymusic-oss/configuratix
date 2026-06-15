import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function run() {
  const svgPath = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/public/IGE_F104_profile.svg";
  
  const outputs = [
    "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/public/IGE_F104_profile.png",
    "C:/Users/Shadow/Downloads/IGE_F104_profile.png",
    "C:/Users/Shadow/.gemini/antigravity/brain/a5e41a8c-73d7-4f0e-b46c-82bd5a548e85/IGE_F104_profile.png"
  ];
  
  console.log('Rendering SVG to PNG...');
  
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Render using sharp
  const pngBuffer = await sharp(svgBuffer)
    .png()
    .toBuffer();
    
  for (const out of outputs) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, pngBuffer);
    console.log(`Saved to ${out}`);
  }
  
  console.log('Done!');
}

run().catch(console.error);
