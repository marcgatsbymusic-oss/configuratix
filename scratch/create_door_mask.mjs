import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
    // Read the webp as base64
    const imgPath = path.resolve('public/assets/iglo5-doors/colors/white-fx-door.webp');
    const b64 = fs.readFileSync(imgPath, 'base64');
    const dataUrl = `data:image/webp;base64,${b64}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Evaluate inside browser context
    const maskDataUrl = await page.evaluate(async (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const width = img.width;
                const height = img.height;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Draw base door
                ctx.drawImage(img, 0, 0);
                
                // Find bounding box
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data;
                let minX = width, minY = height, maxX = 0, maxY = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const a = data[(y * width + x) * 4 + 3];
                        if (a > 10) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                
                const doorW = maxX - minX;
                const doorH = maxY - minY;
                
                // Make a mask image
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = width;
                maskCanvas.height = height;
                const maskCtx = maskCanvas.getContext('2d');
                
                // Fill the shape of the door with white (opaque for mask)
                maskCtx.drawImage(img, 0, 0);
                // To turn the door solid white (so texture is 100% visible):
                maskCtx.globalCompositeOperation = 'source-in';
                maskCtx.fillStyle = 'white';
                maskCtx.fillRect(0, 0, width, height);
                
                // Punch holes for the glass and handle
                maskCtx.globalCompositeOperation = 'destination-out';
                
                // Handle (left side):
                // Handle is a long bar that spans roughly the same height as the glass
                const handleX = minX + doorW * 0.12;
                const handleY = minY + doorH * 0.05;
                const handleW = doorW * 0.04;
                const handleH = doorH * 0.85;
                maskCtx.fillRect(handleX, handleY, handleW, handleH);
                
                // Glass (center):
                // Look at white-fx-door.webp visually: glass is a vertical strip.
                const glassX = minX + doorW * 0.35;
                const glassY = minY + doorH * 0.17;
                const glassW = doorW * 0.3;
                const glassH = doorH * 0.68;
                maskCtx.fillRect(glassX, glassY, glassW, glassH);
                
                resolve(maskCanvas.toDataURL('image/png'));
            };
            img.src = src;
        });
    }, dataUrl);

    // Save it
    const base64Data = maskDataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync('public/assets/iglo5-doors/door-mask.png', base64Data, 'base64');
    console.log("Mask generated and saved to public/assets/iglo5-doors/door-mask.png");
    
    await browser.close();
})();
