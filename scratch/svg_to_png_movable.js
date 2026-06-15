import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convert(svgPath, pngPath) {
  try {
    if (!fs.existsSync(svgPath)) {
      console.warn(`File not found: ${svgPath}`);
      return;
    }
    console.log(`Converting ${path.basename(svgPath)} -> ${path.basename(pngPath)}...`);
    const svgBuffer = fs.readFileSync(svgPath);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();
    fs.mkdirSync(path.dirname(pngPath), { recursive: true });
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`Successfully saved to: ${pngPath}`);
  } catch (err) {
    console.error(`Error converting ${svgPath}:`, err);
  }
}

async function run() {
  const workspaceRoot = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle";
  const brainDir = "C:/Users/Shadow/.gemini/antigravity/brain/a5e41a8c-73d7-4f0e-b46c-82bd5a548e85";
  const downloadsDir = "C:/Users/Shadow/Downloads";

  // We have multiple SVGs for the movable post left opening, let's render them all so the user has the best visual reference
  const tasks = [
    {
      src: `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING.svg`,
      dsts: [
        `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING.png`,
        `${downloadsDir}/IGE_MOVABLE_POST_LEFT_OPENING.png`,
        `${brainDir}/IGE_MOVABLE_POST_LEFT_OPENING.png`
      ]
    },
    {
      src: `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING_FULL.svg`,
      dsts: [
        `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING_FULL.png`,
        `${downloadsDir}/IGE_MOVABLE_POST_LEFT_OPENING_FULL.png`,
        `${brainDir}/IGE_MOVABLE_POST_LEFT_OPENING_FULL.png`
      ]
    },
    {
      src: `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.svg`,
      dsts: [
        `${workspaceRoot}/public/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.png`,
        `${downloadsDir}/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.png`,
        `${brainDir}/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.png`
      ]
    }
  ];

  for (const task of tasks) {
    for (const dst of task.dsts) {
      await convert(task.src, dst);
    }
  }
  console.log('All conversions complete!');
}

run();
