/**
 * Drutex Product Page Extractor
 * ==============================
 * Usage:
 *   node .agents/skills/drutex-page-extractor/scripts/extractProductPage.mjs \
 *     --url "https://www.drutex.eu/en/products/iglo-edge-doors-pvc.html" \
 *     --slug "iglo-edge-door" \
 *     --out "public/assets/products/iglo-edge-door"
 *
 * Outputs:
 *   - All discovered assets downloaded to --out directory
 *   - {slug}-extracted.json in the project root (CWD)
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

// ──────────────────────────────────────────────
// Argument Parsing
// ──────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const SOURCE_URL = getArg('url');
const SLUG       = getArg('slug');
const OUT_DIR    = getArg('out') || `public/assets/products/${SLUG}`;

if (!SOURCE_URL || !SLUG) {
  console.error('ERROR: --url and --slug are required arguments.');
  console.error('Example: node extractProductPage.mjs --url "https://www.drutex.eu/en/products/iglo-edge-doors-pvc.html" --slug "iglo-edge-door"');
  process.exit(1);
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Ensure a directory exists */
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Resolve a potentially relative URL against the base */
function resolveUrl(href, base) {
  if (!href) return null;
  try { return new URL(href, base).href; } catch { return null; }
}

/** Download a file from a URL to a local path. Returns the local path or null on failure. */
async function downloadFile(url, destPath) {
  if (!url) return null;
  mkdirp(path.dirname(destPath));
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DrutexExtractor/1.0)' }
    });
    if (!res.ok) {
      console.warn(`  [WARN] HTTP ${res.status} for ${url}`);
      return null;
    }
    const fileStream = createWriteStream(destPath);
    await pipeline(Readable.fromWeb(res.body), fileStream);
    console.log(`  [DL]  ${path.basename(destPath)} ← ${url}`);
    return destPath;
  } catch (err) {
    console.warn(`  [WARN] Failed to download ${url}: ${err.message}`);
    return null;
  }
}

/** Convert a URL basename into a safe filename */
function safeFilename(url, fallback) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    return base || fallback;
  } catch {
    return fallback;
  }
}

/** Convert an arbitrary string to a safe CSS/JSON key (kebab-case) */
function toKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Sleep helper — replacement for removed page.waitForTimeout */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ──────────────────────────────────────────────
// Main Extraction Logic
// ──────────────────────────────────────────────

async function extract() {
  console.log(`\n🔍 Drutex Page Extractor`);
  console.log(`   URL  : ${SOURCE_URL}`);
  console.log(`   Slug : ${SLUG}`);
  console.log(`   Out  : ${OUT_DIR}\n`);

  mkdirp(OUT_DIR);
  mkdirp(`${OUT_DIR}/colors`);
  mkdirp(`${OUT_DIR}/fills`);
  mkdirp(`${OUT_DIR}/constructions`);
  mkdirp(`${OUT_DIR}/gallery`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US,en'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  // Intercept and log all video/mp4 requests
  const interceptedVideos = [];
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('.mp4') || url.includes('video')) {
      interceptedVideos.push(url);
    }
    req.continue();
  });

  console.log('⏳ Loading page (this may take ~15s)...');
  await page.goto(SOURCE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Accept cookies if present
  try {
    await page.click('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', { timeout: 3000 });
    await sleep(1000);
  } catch { /* no cookie banner */ }

  // Scroll to trigger lazy-loading
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = () => {
        window.scrollBy(0, 400);
        total += 400;
        if (total < document.body.scrollHeight) setTimeout(step, 60);
        else { window.scrollTo(0, 0); resolve(); }
      };
      step();
    });
  });
  await sleep(2000);

  // ── 1. Hero Video ──────────────────────────────
  console.log('\n[1/15] Extracting hero video...');
  const heroVideoUrl = await page.evaluate(() => {
    // Try <video> source
    const vid = document.querySelector('video source[src*=".mp4"], video[src*=".mp4"]');
    if (vid) return vid.src || vid.getAttribute('src');
    // Try background-video pattern
    const bgVid = document.querySelector('[data-bg-video], [data-video-src]');
    if (bgVid) return bgVid.dataset.bgVideo || bgVid.dataset.videoSrc;
    return null;
  });

  const allVideoSrcs = [...interceptedVideos, heroVideoUrl].filter(Boolean);
  let heroVideoLocal = null;
  const mp4Url = allVideoSrcs.find(u => u.includes('.mp4'));
  if (mp4Url) {
    heroVideoLocal = await downloadFile(mp4Url, `${OUT_DIR}/hero.mp4`);
  }

  // ── 2. Hero Poster / Background Image ─────────
  console.log('[2/15] Extracting hero poster...');
  const heroPosterUrl = await page.evaluate(() => {
    const vid = document.querySelector('video[poster]');
    if (vid?.poster) return vid.poster;
    // CSS background-image in hero
    const hero = document.querySelector('.hero, #header, .product-header, .banner');
    if (hero) {
      const style = window.getComputedStyle(hero);
      const bg = style.backgroundImage;
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) return match[1];
    }
    return null;
  });
  const heroPosterLocal = await downloadFile(
    resolveUrl(heroPosterUrl, SOURCE_URL),
    `${OUT_DIR}/hero-poster.jpg`
  );

  // ── 3. Hero Text ───────────────────────────────
  console.log('[3/15] Extracting hero text...');
  const heroText = await page.evaluate(() => {
    const h1 = document.querySelector('h1, .hero h2, .product-name, .banner__title');
    const tagline = document.querySelector('.hero__subtitle, .banner__subtitle, .product-tagline, h6');
    const desc = document.querySelector('#description p, .product-description p');
    return {
      title:   h1?.innerText?.trim() || null,
      tagline: tagline?.innerText?.trim() || null,
      description: desc?.innerText?.trim() || null,
    };
  });
  console.log(`   Title: "${heroText.title}"`);

  // ── 4. Gallery Images ──────────────────────────
  console.log('[4/15] Extracting gallery images...');
  const galleryUrls = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll(
      '.product-gallery img, .swiper-slide img, #description img, .gallery img, .produkty-galeria img'
    )];
    return imgs
      .map(i => i.src || i.dataset.src || i.dataset.lazySrc)
      .filter(Boolean)
      .filter(u => !u.includes('logo') && !u.includes('icon'));
  });

  const gallery = [];
  for (let i = 0; i < galleryUrls.length; i++) {
    const url = resolveUrl(galleryUrls[i], SOURCE_URL);
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const local = await downloadFile(url, `${OUT_DIR}/gallery/gallery-${i + 1}${ext}`);
    if (local) gallery.push(`/assets/products/${SLUG}/gallery/gallery-${i + 1}${ext}`);
  }

  // ── 5. Profile / Technical Drawing ────────────
  console.log('[5/15] Extracting profile/technical drawing...');
  const drawingUrl = await page.evaluate(() => {
    const selectors = [
      'img[src*="rysunek"]', 'img[src*="drawing"]', 'img[src*="profil"]',
      'img[src*="przekroj"]', 'img[src*="cross-section"]', 'img[src*="techniczny"]',
      '#technical img', '.profile-drawing img', '.technical-drawing img'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el.src || el.dataset.src;
    }
    return null;
  });
  const drawingLocal = await downloadFile(
    resolveUrl(drawingUrl, SOURCE_URL),
    `${OUT_DIR}/profile-drawing.png`
  );

  // ── 6 & 7. Color Swatches ─────────────────────
  console.log('[6/15] Extracting color swatches...');

  // Wait for color section to render
  try { await page.waitForSelector('#colors-section, .colors-section, .kolory, #colors', { timeout: 8000 }); }
  catch { console.warn('   [WARN] Color section not found within timeout'); }

  const rawColors = await page.evaluate(() => {
    const items = [
      ...document.querySelectorAll(
        '#colors-section .color-item, .colors-section .item, .kolory .kolor, [data-ral], .color-swatch, .color-rec'
      )
    ];
    return items.map((el) => {
      const img    = el.querySelector('img');
      const nameEl = el.querySelector('.name, .color-name, span, p');
      // RAL code: try data attrs, then text pattern
      let ral = el.dataset.ral || el.dataset.colorRal || el.dataset.filter || el.dataset.colorCode || '';
      if (!ral && nameEl) {
        const match = nameEl.innerText.match(/RAL\s*(\d{4})/i);
        if (match) ral = `RAL ${match[1]}`;
      }
      // Hex: try data attrs, then computed bg color
      let hex = el.dataset.hex || el.dataset.colorHex || '';
      if (!hex) {
        const style = window.getComputedStyle(el);
        hex = style.backgroundColor || '';
      }
      
      let swatchSrc = el.dataset.colorImg || el.dataset.colorBg || img?.src || img?.dataset?.src || '';
      if (!swatchSrc) {
        const style = window.getComputedStyle(el);
        const match = (style.backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
        if (match) swatchSrc = match[1];
      }

      return {
        name:        (nameEl?.innerText || el.title || el.dataset.name || el.dataset.colorName || '').trim(),
        ralCode:     ral.trim(),
        hex:         hex.trim(),
        swatchSrc:   swatchSrc,
        isStandard:  el.classList.contains('standard') || el.dataset.standard === 'true',
      };
    });
  });

  const colors = [];
  for (const c of rawColors) {
    const id       = toKey(c.name || c.ralCode) || `color-${colors.length + 1}`;
    const filename = `${id}.jpg`;
    const local    = await downloadFile(
      resolveUrl(c.swatchSrc, SOURCE_URL),
      `${OUT_DIR}/colors/${filename}`
    );
    colors.push({
      id,
      name:        c.name,
      ralCode:     c.ralCode,
      hex:         c.hex,
      swatchImage: local ? `/assets/products/${SLUG}/colors/${filename}` : null,
      isStandard:  c.isStandard,
    });
  }
  console.log(`   Found ${colors.length} colors`);

  // ── 8. Infill / Panel Designs ─────────────────
  console.log('[8/15] Extracting infill/panel designs...');

  try { await page.waitForSelector('#fills, .fills-section, .wypelnienia, #infill', { timeout: 5000 }); }
  catch { /* section not present on all pages */ }

  const rawFills = await page.evaluate(() => {
    const items = [...document.querySelectorAll(
      '#fills .fill-item, #fills img, .wypelnienia img, .infill-item, .fills-section img'
    )];
    return items.map((el) => {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      const nameEl = el.querySelector('.name, span, p');
      return {
        name:   (nameEl?.innerText || img?.alt || '').trim(),
        src:    img?.src || img?.dataset?.src || el?.src || '',
      };
    });
  });

  const fills = [];
  for (let i = 0; i < rawFills.length; i++) {
    const f = rawFills[i];
    const ext = path.extname(new URL(resolveUrl(f.src, SOURCE_URL) || 'x.jpg').pathname) || '.jpg';
    const filename = `fill-${i + 1}${ext}`;
    const local = await downloadFile(
      resolveUrl(f.src, SOURCE_URL),
      `${OUT_DIR}/fills/${filename}`
    );
    fills.push({
      id:    `fill-${i + 1}`,
      name:  f.name || `Panel ${i + 1}`,
      image: local ? `/assets/products/${SLUG}/fills/${filename}` : null,
    });
  }
  console.log(`   Found ${fills.length} infill designs`);

  // ── 9. Standard Equipment ─────────────────────
  console.log('[9/15] Extracting standard equipment list...');
  const standardEquipment = await page.evaluate(() => {
    const lists = [
      ...document.querySelectorAll('#description ul li, .standard-equipment li, .cechy li, .features li')
    ];
    return lists
      .map(li => li.innerText.trim())
      .filter(t => t.length > 2);
  });
  const equipmentForJson = standardEquipment.map(text => ({
    key: text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').substring(0, 40),
    text,
  }));

  // ── 10. Technical Specifications ──────────────
  console.log('[10/15] Extracting technical specs...');
  const technicalSpecs = await page.evaluate(() => {
    const specs = {};
    // Try table rows
    document.querySelectorAll('.specs-table tr, #technical-data tr, .parameters tr').forEach(row => {
      const cells = [...row.querySelectorAll('td, th')];
      if (cells.length >= 2) {
        const key = cells[0].innerText.trim();
        const val = cells[1].innerText.trim();
        if (key && val) specs[key] = val;
      }
    });
    // Try dl/dt/dd
    document.querySelectorAll('dl.specs').forEach(dl => {
      const dts = [...dl.querySelectorAll('dt')];
      const dds = [...dl.querySelectorAll('dd')];
      dts.forEach((dt, i) => { if (dds[i]) specs[dt.innerText.trim()] = dds[i].innerText.trim(); });
    });
    // Try comparison table for core specs
    const rows = [...document.querySelectorAll('#comparison tr, .comparison-table tr')];
    rows.forEach(row => {
      const cells = [...row.querySelectorAll('td, th')];
      if (cells.length > 0) {
        const label = cells[0]?.innerText?.trim();
        const val   = cells[1]?.innerText?.trim();
        if (label && val) specs[label] = val;
      }
    });
    return specs;
  });

  // ── 11. Brochure PDF ──────────────────────────
  console.log('[11/15] Extracting brochure PDF...');
  const pdfUrl = await page.evaluate(() => {
    const a = document.querySelector('a[href*=".pdf"], #files a, .downloads a');
    return a?.href || null;
  });
  const brochureLocal = await downloadFile(
    resolveUrl(pdfUrl, SOURCE_URL),
    `${OUT_DIR}/brochure.pdf`
  );

  // ── 12. Construction Drawings ─────────────────
  console.log('[12/15] Extracting construction drawings...');
  const constructionUrls = await page.evaluate(() => {
    return [...document.querySelectorAll('#constructions img, .constructions img, img[src*="konstrukcja"]')]
      .map(img => img.src || img.dataset.src)
      .filter(Boolean);
  });
  const constructions = [];
  for (let i = 0; i < constructionUrls.length; i++) {
    const url = resolveUrl(constructionUrls[i], SOURCE_URL);
    const ext = path.extname(new URL(url).pathname) || '.png';
    const local = await downloadFile(url, `${OUT_DIR}/constructions/construction-${i + 1}${ext}`);
    if (local) constructions.push(`/assets/products/${SLUG}/constructions/construction-${i + 1}${ext}`);
  }

  // ── 13. Glass Options ─────────────────────────
  console.log('[13/15] Extracting glass options...');
  const glassOptions = await page.evaluate(() => {
    return [...document.querySelectorAll('#glasses .glass-item, .szyby .item, .glass-option')]
      .map(el => ({
        name:  el.querySelector('.name, span, p')?.innerText?.trim() || el.innerText?.trim(),
        value: el.dataset.ug || el.dataset.value || '',
      }));
  });

  // ── 14. Accessories ───────────────────────────
  console.log('[14/15] Extracting accessories...');
  const accessories = await page.evaluate(() => {
    return [...document.querySelectorAll('#addons .addon-card, .akcesoria .item, .accessories .item')]
      .map(el => ({
        name:  el.querySelector('.name, h3, h4, p')?.innerText?.trim() || '',
        image: el.querySelector('img')?.src || '',
      }));
  });

  // ── 15. Comparison Table ──────────────────────
  console.log('[15/15] Extracting comparison data...');
  const comparison = await page.evaluate(() => {
    const result = {};
    const table = document.querySelector('#comparison table, .porownanie table, .comparison-table');
    if (!table) return result;
    const headers = [...table.querySelectorAll('th')].map(th => th.innerText.trim());
    const rows    = [...table.querySelectorAll('tr')].slice(1);
    rows.forEach(row => {
      const cells = [...row.querySelectorAll('td')];
      const label = cells[0]?.innerText?.trim();
      if (!label) return;
      cells.slice(1).forEach((cell, i) => {
        const productKey = headers[i + 1] || `product${i + 1}`;
        if (!result[productKey]) result[productKey] = {};
        result[productKey][label] = cell.innerText.trim();
      });
    });
    return result;
  });

  await browser.close();

  // ──────────────────────────────────────────────
  // Assemble and Write Output JSON
  // ──────────────────────────────────────────────
  const payload = {
    slug:          SLUG,
    sourceUrl:     SOURCE_URL,
    extractedAt:   new Date().toISOString(),
    heroVideo:     heroVideoLocal ? `/assets/products/${SLUG}/hero.mp4` : null,
    heroPoster:    heroPosterLocal ? `/assets/products/${SLUG}/hero-poster.jpg` : null,
    heroTitle:     heroText.title,
    heroTagline:   heroText.tagline,
    description:   heroText.description,
    gallery,
    profileDrawing: drawingLocal ? `/assets/products/${SLUG}/profile-drawing.png` : null,
    brochurePdf:   brochureLocal ? `/assets/products/${SLUG}/brochure.pdf` : null,
    fills,
    colors,
    standardEquipment: equipmentForJson,
    technicalSpecs,
    constructions,
    glassOptions,
    accessories,
    comparison,
  };

  const outFile = `${SLUG}-extracted.json`;
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\n════════════════════════════════════');
  console.log('✅ Extraction Complete!');
  console.log('════════════════════════════════════');
  console.log(`   Hero video    : ${payload.heroVideo     || '❌ not found'}`);
  console.log(`   Hero poster   : ${payload.heroPoster    || '❌ not found'}`);
  console.log(`   Profile draw  : ${payload.profileDrawing || '❌ not found'}`);
  console.log(`   Gallery imgs  : ${gallery.length}`);
  console.log(`   Colors        : ${colors.length}`);
  console.log(`   Fills         : ${fills.length}`);
  console.log(`   Constructions : ${constructions.length}`);
  console.log(`   Brochure PDF  : ${payload.brochurePdf  || '❌ not found'}`);
  console.log(`   Output JSON   : ./${outFile}`);
  console.log('\n📋 Next Steps:');
  console.log('   1. Review ./' + outFile);
  console.log('   2. Run: node .agents/skills/drutex-page-extractor/scripts/integrateProduct.mjs --slug ' + SLUG);
  console.log('   3. Or manually merge into src/data/productDetails.ts\n');
}

extract().catch((err) => {
  console.error('\n❌ Extraction failed:', err.message);
  process.exit(1);
});
