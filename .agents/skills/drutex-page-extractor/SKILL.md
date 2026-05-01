---
name: drutex-page-extractor
description: Extracts complete product pages from drutex.eu — including hero videos, background media, product images, technical drawings, color swatches (with full RAL/hex mapping), infill panel designs, spec tables, and comparison data — then downloads all assets locally and generates a structured JSON payload ready for insertion into productDetails.ts.
---

# Drutex Product Page Extractor Skill

This is the **go-to skill** whenever the user says "copy the [product name] page from drutex.eu" or asks to replicate a Drutex product page onto the Mammut portal. It runs a browser-driven extraction (Puppeteer) to capture all JS-rendered content, downloads every binary asset, and produces a fully structured integration payload.

---

## When to Use This Skill

- User asks to copy or clone a product page from `drutex.eu/en/products/*.html`
- User wants to add a new product that doesn't yet exist in `productDetails.ts`
- You need to refresh/update an existing product's assets with the latest from the source site
- You need to extract color swatch data (RAL codes, hex values, image URLs) for a door or window product

---

## Extraction Targets (Every Page)

The following elements MUST be extracted on every run. Use the browser tool and the extraction script to capture them all:

| # | Element | Source Selector / API | Local Output |
|---|---------|----------------------|--------------|
| 1 | **Hero Video** | `video source[src*=".mp4"]` or `<source>` inside `.hero` / `#header` | `public/assets/products/{slug}/hero.mp4` |
| 2 | **Hero Poster / Background Image** | `video[poster]` or `div[style*="background-image"]` in hero | `public/assets/products/{slug}/hero-poster.jpg` |
| 3 | **Hero Section Text** | `h1`, `h2.tagline`, `.hero__title`, `.hero__subtitle` | → `en.json` translation keys |
| 4 | **Product "Feature" Images** | `.product-gallery img`, `.swiper-slide img`, `#description img` | `public/assets/products/{slug}/gallery-N.jpg` |
| 5 | **Profile / Technical Drawing** | `img[src*="rysunek"]`, `img[src*="profil"]`, `img[src*="drawing"]`, `img[src*="techniczny"]` | `public/assets/products/{slug}/profile-drawing.png` |
| 6 | **Color Swatches** | `#colors-section .color-item`, `[data-ral]`, `[data-color-hex]`, `.color-swatch` | → `colors[]` array in JSON payload |
| 7 | **Color Swatch Images** | `img` inside each `.color-item` (circular swatch thumbnails) | `public/assets/products/{slug}/colors/{slug}.jpg` |
| 8 | **Infill / Panel Designs** | `#fills .fill-item img`, `#infill img`, `.wypelnienie img` | `public/assets/products/{slug}/fills/fill-N.jpg` |
| 9 | **Standard Equipment List** | `ul` inside `#description`, `.standard-equipment li`, `.cechy li` | → `standardEquipment[]` in JSON & translation keys |
| 10 | **Technical Specifications** | `.specs-table td`, `#technical-data`, `dl.specs dt/dd` | → `technicalSpecs{}` object in JSON |
| 11 | **Brochure PDF** | `a[href*=".pdf"]`, `#files a` | `public/assets/products/{slug}/brochure.pdf` |
| 12 | **Construction Drawings** | `#constructions img`, `img[src*="konstrukcja"]` | `public/assets/products/{slug}/constructions/N.png` |
| 13 | **Glass Pane Options** | `#glasses .glass-item`, `.szyby .item` | → `glassOptions[]` in JSON |
| 14 | **Accessories Section** | `#addons .addon-card img`, `.akcesoria img` | → `accessories[]` in JSON |
| 15 | **Comparison Table Data** | `#comparison table`, `.porownanie td` | → `comparison{}` in JSON |

---

## Step-by-Step Extraction Workflow

### Phase 0: Prerequisites

Before running, check that Puppeteer is available:
```bash
node -e "require('puppeteer')" 2>/dev/null || npm install puppeteer --save-dev
```

### Phase 1: Run the Extraction Script

The extraction script handles DOM crawling, network interception, and asset downloading automatically.

```bash
node .agents/skills/drutex-page-extractor/scripts/extractProductPage.mjs \
  --url "https://www.drutex.eu/en/products/iglo-edge-doors-pvc.html" \
  --slug "iglo-edge-door" \
  --out "public/assets/products/iglo-edge-door"
```

**Arguments:**
- `--url` — The full Drutex EN product page URL
- `--slug` — A kebab-case identifier used for folder naming and `productDetails.ts` keys (e.g. `iglo-edge-door`, `iglo-5-door`, `mb-86n-si`)
- `--out` — Destination folder for downloaded assets (relative to project root)

**What the script outputs:**
1. All binary assets downloaded into `--out`
2. `{slug}-extracted.json` in the project root — the structured integration payload

### Phase 2: Review the Extracted JSON

Open `{slug}-extracted.json` and verify:
- [ ] `heroVideo` path is not null (some pages use iframe or CSS video — handle manually if needed)
- [ ] `colors` array has both `name`, `ralCode`, `hex`, and `swatchImage` for each entry
- [ ] `standardEquipment` list matches what is shown in the source page bullet list
- [ ] `technicalSpecs` numbers (Uf, Uw, Ug, Ud, Rw) look correct
- [ ] At least one `profileDrawing` image was found

### Phase 3: Integrate into productDetails.ts

Using the extracted JSON, add the product entry to `src/data/productDetails.ts`:

```typescript
"iglo-edge-door": {
  id: "iglo-edge-door",
  name: "IGLO EDGE",
  tagline: t("productData.igloEdgeDoor.tagline"),
  category: "door-pvc",
  heroVideo: "/assets/products/iglo-edge-door/hero.mp4",
  heroPoster: "/assets/products/iglo-edge-door/hero-poster.jpg",
  profileDrawing: "/assets/products/iglo-edge-door/profile-drawing.png",
  colors: extractedJson.colors,           // paste directly
  standardEquipment: extractedJson.standardEquipment.map(item => t(`productData.igloEdgeDoor.equipment.${item.key}`)),
  technicalSpecs: extractedJson.technicalSpecs,
  gallery: extractedJson.gallery,
  fills: extractedJson.fills,
  brochurePdf: "/assets/products/iglo-edge-door/brochure.pdf",
}
```

> **CRITICAL RULE:** Do NOT hardcode English text in `.ts` files. All `name`, `tagline`, `description`, and `equipment` strings MUST use `t()` and be backed by entries in `src/locales/en.json` AND `src/locales/es.json`.

### Phase 4: Add Translation Keys

Open `src/locales/en.json` and add the product block:

```json
"productData": {
  "igloEdgeDoor": {
    "tagline": "World-leading design and excellent parameters",
    "description": "The Iglo Edge entrance door is a proprietary design, innovative technology, modern design in line with current market trends.",
    "equipment": {
      "espagnolette": "3-point espagnolette",
      "hinges": "3 two-winged hinges",
      "glass": "Ug = 0.5 W/(m²K) glass",
      "threshold": "threshold with a thermal break",
      "handle": "aluminium handle",
      "insert": "mounting insert"
    }
  }
}
```

Then propagate to `src/locales/es.json` with Spanish translations.

### Phase 5: Wire up the Color Visualizer

If the product is a door, ensure the color visualizer uses the door mask:

```typescript
// In ProductDetailPage.tsx, check that the colorMask resolves to:
const colorMask = product.category === "door-pvc" 
  ? "/assets/products/door-mask.png"   // or product-specific mask
  : undefined;
```

### Phase 6: Verify in Browser

1. Start the dev server: `node .agents/skills/server-manager/scripts/manageServer.mjs start`
2. Navigate to the product page (e.g. `/products/iglo-edge-door`)
3. Verify:
   - [ ] Hero video autoplays (muted, loop)
   - [ ] Color swatches are clickable and change the door visualization
   - [ ] Profile drawing is visible in the specs section
   - [ ] All gallery images load without 404s
   - [ ] Brochure PDF link downloads correctly
   - [ ] Page title matches the product name

---

## Manual Fallback Steps (When Script Fails)

Some pages use heavy lazy-loading or CDN obfuscation. If the script can't find an asset:

### Hero Video (Manual)
1. Open DevTools → Network tab → filter by `mp4` or `video`
2. Hard-reload the page
3. Right-click the video request → Copy URL → download with `curl`

### Color Swatches (Manual)
1. Open DevTools → Network tab → filter `XHR` or `Fetch`
2. Look for requests to `/api/colors` or `/ajax/colors` or `kolory.json`
3. Alternatively, inspect `.color-item` elements and read `data-ral`, `data-hex`, or the `style` attribute background-color
4. Inspect the `<img src>` inside each swatch for the thumbnail URL

### Technical Drawing (Manual)
1. Search the DOM for `<img>` tags with `src` containing: `rysunek`, `drawing`, `profil`, `przekroj`, `cross-section`
2. Download the full-resolution version (check for `data-src` lazy-loaded attributes)

### Infill Designs (Manual)
1. Scroll to the `#fills` section
2. Click each infill panel — the URL may update or an `<img>` may change `src`
3. Extract via `document.querySelectorAll('#fills img').map(i => i.src)` in Console

---

## Output JSON Schema

The script outputs a `{slug}-extracted.json` file with this shape:

```json
{
  "slug": "iglo-edge-door",
  "sourceUrl": "https://www.drutex.eu/en/products/iglo-edge-doors-pvc.html",
  "extractedAt": "2026-04-29T09:00:00Z",
  "heroVideo": "/assets/products/iglo-edge-door/hero.mp4",
  "heroPoster": "/assets/products/iglo-edge-door/hero-poster.jpg",
  "heroTitle": "IGLO EDGE",
  "heroTagline": "World-leading design and excellent parameters",
  "gallery": [
    "/assets/products/iglo-edge-door/gallery-1.jpg",
    "/assets/products/iglo-edge-door/gallery-2.jpg"
  ],
  "profileDrawing": "/assets/products/iglo-edge-door/profile-drawing.png",
  "brochurePdf": "/assets/products/iglo-edge-door/brochure.pdf",
  "fills": [
    {
      "id": "fill-1",
      "name": "Panel 1",
      "image": "/assets/products/iglo-edge-door/fills/fill-1.jpg"
    }
  ],
  "colors": [
    {
      "id": "white",
      "name": "White",
      "ralCode": "RAL 9016",
      "hex": "#F1F0EA",
      "swatchImage": "/assets/products/iglo-edge-door/colors/white.jpg",
      "isStandard": true
    }
  ],
  "standardEquipment": [
    { "key": "espagnolette", "text": "3-point espagnolette" },
    { "key": "hinges",       "text": "3 two-winged hinges" }
  ],
  "technicalSpecs": {
    "profileDepth": "82 mm",
    "chambers": "7",
    "glazingThickness": "48-54 mm",
    "udValue": "0.81 W/(m²K)",
    "rwValue": null
  },
  "comparison": {
    "igloEdge":   { "chambers": 7, "depth": "82mm", "seals": 3, "ud": "0.81" },
    "iglo5":      { "chambers": 5, "depth": "70mm", "seals": 2, "ud": "1.0"  },
    "igloEnergy": { "chambers": 7, "depth": "82mm", "seals": 2, "ud": "0.8"  }
  },
  "glassOptions": [],
  "accessories": []
}
```

---

## Constraints and Rules

- **NEVER** use external CDN URLs in the final React code — always download and serve from `/public/assets/`
- **NEVER** hardcode English strings in `.tsx` or `.ts` files — use `t()` and `src/locales/*.json`
- **ALWAYS** read the live `productDetails.ts` file before editing it (per GEMINI.md rule)
- **ALWAYS** propagate new translation keys to BOTH `en.json` AND `es.json`
- **DO NOT** overwrite existing color/handle mappings in `productDetails.ts` unless explicitly asked — per the MANUAL CATALOG PROTECTION rule in GEMINI.md

---

## Reference: Common Asset URL Patterns on drutex.eu

These patterns help when manually constructing download URLs:

| Asset Type | URL Pattern Example |
|------------|---------------------|
| Hero video | `https://www.drutex.eu/media/_upload/video/{product}.mp4` |
| Product image | `https://www.drutex.eu/media/_upload/produkty/{slug}/{image}.jpg` |
| Profile drawing | `https://www.drutex.eu/media/_upload/produkty/{slug}/rysunek.png` |
| Color swatch | `https://www.drutex.eu/media/_upload/kolory/{ral}.jpg` |
| Brochure PDF | `https://www.drutex.eu/media/_upload/_promotion/ulotki/en/{slug}.pdf` |
| Infill panel | `https://www.drutex.eu/media/_upload/wypelnienia/{id}.jpg` |

---

## Known Quirks

1. **Color section is JS-rendered.** The `.color-item` elements are injected by `product.js` after page load. Puppeteer must wait for `#colors-section` to be visible before querying.
2. **Infill images use lazy loading.** Use `page.evaluate()` and `IntersectionObserver` workaround or scroll to trigger loading before capturing `src` attributes.
3. **Hero video on some pages is a Vimeo/YouTube embed.** Detect `<iframe src*="vimeo">` or `<iframe src*="youtube">` and capture the ID — then use `yt-dlp` if a direct MP4 is needed.
4. **RAL codes are sometimes in `data-filter` attributes** instead of `data-ral`. Always check both.
5. **Technical drawings for doors** may be under `#constructions` rather than `#description`. Check both sections.
