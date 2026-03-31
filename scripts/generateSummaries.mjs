import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, '../src/data/outlet_products.json');

const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function generateSummaries() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 });

    for (const p of products) {
        // Build an elegant HTML structure
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body {
                    margin: 0;
                    padding: 80px;
                    background: #f8f9fa;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    box-sizing: border-box;
                }
                .card {
                    background: white;
                    padding: 60px;
                    border-radius: 30px;
                    width: 100%;
                    height: 100%;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #eee;
                }
                .header {
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 30px;
                    margin-bottom: 40px;
                }
                .title {
                    font-size: 42px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #111;
                    letter-spacing: -1px;
                    margin: 0 0 10px 0;
                }
                .subtitle {
                    font-size: 16px;
                    font-weight: 800;
                    color: #eab676;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    flex: 1;
                }
                .spec {
                    background: #fafafa;
                    padding: 25px;
                    border-radius: 15px;
                    border: 1px solid #f0f0f0;
                }
                .spec-label {
                    font-size: 12px;
                    font-weight: 800;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }
                .spec-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #222;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 14px;
                    font-weight: 600;
                    color: #aaa;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <div class="subtitle">Technical Summary</div>
                    <h1 class="title">${p.name}</h1>
                </div>
                <div class="grid">
                    <div class="spec">
                        <div class="spec-label">Dimensions</div>
                        <div class="spec-value">${p.width} x ${p.height} mm</div>
                    </div>
                    <div class="spec">
                        <div class="spec-label">Type / Material</div>
                        <div class="spec-value">${p.type} — ${p.material}</div>
                    </div>
                    <div class="spec">
                        <div class="spec-label">Internal Finish</div>
                        <div class="spec-value">${p.innerColor || 'Standard'}</div>
                    </div>
                    <div class="spec">
                        <div class="spec-label">External Frame Color</div>
                        <div class="spec-value">${p.outerColor || 'Standard'}</div>
                    </div>
                    <div class="spec" style="grid-column: span 2;">
                        <div class="spec-label">Glazing System</div>
                        <div class="spec-value">Premium Insulated Package (4/16/4 Standard)</div>
                    </div>
                </div>
                <div class="footer">Mammut Premium Windows • Drutex Direct</div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(html, { waitUntil: 'load' });
        const filePath = path.resolve(__dirname, `../public/outlet/summary_${p.id}.png`);
        await page.screenshot({ path: filePath });
        console.log(`Generated ${filePath}`);

        // Update JSON logic
        // Remove old ugly polish specs if they exist (based on size heuristic)
        let sizes = p.localImages.map(img => {
            try {
                const stat = fs.statSync(path.join(__dirname, '../public', img));
                return { path: img, size: stat.size };
            } catch (e) { return { path: img, size: Infinity }; }
        });
        
        sizes.sort((a,b) => a.size - b.size);
        const smallest = sizes[0].path;

        // Clean out smallest (old spec) AND any past summaries
        let newImages = p.localImages.filter(img => img !== smallest && !img.includes('summary_'));
        
        // Add our gorgeous new generated summary at the END
        newImages.push(`/outlet/summary_${p.id}.png`);
        
        p.localImages = newImages;
    }
    
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
    await browser.close();
    console.log("All summaries generated and JSON updated successfully.");
}

generateSummaries().catch(console.error);
