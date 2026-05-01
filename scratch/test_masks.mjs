import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
    const imgPath = path.resolve('public/assets/iglo5-doors/colors/white-fx-door.webp');
    const b64 = fs.readFileSync(imgPath, 'base64');
    const dataUrl = `data:image/webp;base64,${b64}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // We will generate multiple masks and display them
    const html = `
    <html>
    <body style="background: #333; display: flex; flex-wrap: wrap;">
    <script>
        const imgSrc = "${dataUrl}";
        const img = new Image();
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            
            // Find bounds
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width; tempCanvas.height = height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0,0,width,height).data;
            let minX=width, minY=height, maxX=0, maxY=0;
            for(let y=0;y<height;y++){
                for(let x=0;x<width;x++){
                    if(data[(y*width+x)*4+3]>10){
                        if(x<minX) minX=x; if(x>maxX) maxX=x;
                        if(y<minY) minY=y; if(y>maxY) maxY=y;
                    }
                }
            }
            const doorW = maxX-minX; const doorH = maxY-minY;

            // Generate variations
            for(let i=0; i<5; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                canvas.style.width = '200px';
                canvas.style.border = '1px solid red';
                const mctx = canvas.getContext('2d');
                
                mctx.drawImage(img, 0, 0);
                
                // Color the frame red so we see the mask
                mctx.globalCompositeOperation = 'source-in';
                mctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                mctx.fillRect(0,0,width,height);
                
                mctx.globalCompositeOperation = 'destination-out';
                
                // Varied handle Y and H
                const handleYOffsets = [0.10, 0.12, 0.14, 0.16, 0.18];
                const handleHs = [0.80, 0.76, 0.72, 0.68, 0.64];
                
                const hY = minY + doorH * handleYOffsets[i];
                const hH = doorH * handleHs[i];
                const hX = minX + doorW * 0.11;
                const hW = doorW * 0.05;
                
                mctx.fillRect(hX, hY, hW, hH);
                
                document.body.appendChild(canvas);
            }
        };
        img.src = imgSrc;
    </script>
    </body>
    </html>
    `;
    
    await page.setContent(html);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scratch/mask_variations.png' });
    await browser.close();
})();
