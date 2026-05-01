import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

(async () => {
    const img = await loadImage('public/assets/iglo5-doors/colors/white-fx-door.webp');
    const width = img.width;
    const height = img.height;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // The door is roughly centered. Let's find its exact bounds by scanning alpha.
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const a = data[idx + 3];
            if (a > 10) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    console.log(`Image dimensions: ${width}x${height}`);
    console.log(`Door bounds: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);
    
    // Calculate relative percentages
    const doorW = maxX - minX;
    const doorH = maxY - minY;
    
    // From visual inspection of a typical door:
    // Glass is usually in the center.
    // Handle is usually on the left or right.
    
    // Let's create a perfect mask.
    // We want the mask to be black where we WANT the texture, and transparent where we DON'T.
    // Wait, if we just want a mask, CSS mask-image uses alpha channel.
    // Opaque = visible (textured). Transparent = hidden (not textured).
    
    const maskCanvas = createCanvas(width, height);
    const maskCtx = maskCanvas.getContext('2d');
    
    // Draw original door silhouette
    maskCtx.drawImage(img, 0, 0);
    
    // We will punch holes for the glass and handle using globalCompositeOperation
    maskCtx.globalCompositeOperation = 'destination-out';
    
    // In white-fx-door, the glass is vertical in the middle.
    // Let's guess the coordinates based on typical door proportions.
    // We can iterate by saving this mask and viewing it.
    
    // Handle (left side):
    const handleX = minX + doorW * 0.12;
    const handleY = minY + doorH * 0.4;
    const handleW = doorW * 0.08;
    const handleH = doorH * 0.35;
    maskCtx.fillRect(handleX, handleY, handleW, handleH);
    
    // Glass (center):
    const glassX = minX + doorW * 0.35;
    const glassY = minY + doorH * 0.15;
    const glassW = doorW * 0.3;
    const glassH = doorH * 0.7;
    maskCtx.fillRect(glassX, glassY, glassW, glassH);
    
    const out = fs.createWriteStream('public/assets/iglo5-doors/colors/door-mask-test.png');
    const stream = maskCanvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  console.log('The mask was created.'));
})();
