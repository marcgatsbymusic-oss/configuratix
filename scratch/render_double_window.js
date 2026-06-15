import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const workspaceRoot = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle';
const brainDir = 'C:/Users/Shadow/.gemini/antigravity/brain/a5e41a8c-73d7-4f0e-b46c-82bd5a548e85';
const downloadsDir = 'C:/Users/Shadow/Downloads';

// Load profiles
const f104 = JSON.parse(fs.readFileSync(`${workspaceRoot}/src/data/profiles/IgloEdge/IGE_F104.json`, 'utf8'));
const post = JSON.parse(fs.readFileSync(`${workspaceRoot}/src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json`, 'utf8'));

// Parameters for rendering
const W = 600; // total window width in mm
const splitX = 300; // centered split (equal sashes)
const scale = 3.0;
const PAD_X = 50;
const svgW = W * scale + PAD_X * 2;
const svgH = 500;

function tx(x) {
  return x * scale + PAD_X;
}

function ty(y) {
  // y=0 (interior) -> bottom of profile rendering (e.g. 380px)
  // y=103 (exterior) -> top of profile rendering (e.g. 71px)
  return 380 - (y * scale);
}

// Convert points to SVG path string
function toPath(pts) {
  if (!pts || pts.length === 0) return '';
  return 'M ' + pts.map(p => `${tx(p.x).toFixed(2)},${ty(p.y).toFixed(2)}`).join(' L ') + ' Z';
}

// Coordinate mappings for assembly
const components = [];

// Helper to push contours with styling
function addContourGroup(groupName, contours, transformFn, color, opacity, strokeColor, strokeWidth = 1) {
  contours.forEach(c => {
    const transformedPts = c.points.map(transformFn);
    components.push({
      groupName,
      path: toPath(transformedPts),
      color,
      opacity,
      strokeColor,
      strokeWidth
    });
  });
}

// Color and styling constants
const colors = {
  frame: '#d4af37', // Gold / Bronze for Frame
  sash: '#3b82f6',  // Blue for Sash
  post: '#10b981',  // Emerald Green for Movable Post
  bead: '#f59e0b',  // Amber/orange for Glazing Bead
  spacer: '#6b7280',// Gray for Spacer
  glass: '#06b6d4', // Cyan for Glass
  gasket: '#ec4899' // Pink/magenta for Gaskets
};

// 1. LEFT FRAME (placed at X=0, rebate facing right, Ext = high Y, Int = low Y)
// f104: X is depth (0=Ext, 82=Int), Y is height (0=frame bottom, 73=frame top/rebate)
const leftFrameTransform = (p) => ({
  x: p.y,
  y: 103 - p.x
});

addContourGroup('FRM_L', f104.layers.FRM_EXT.contours, leftFrameTransform, colors.frame, 0.15, colors.frame, 1.5);
addContourGroup('FRM_L', f104.layers.FRM_INT.contours, leftFrameTransform, colors.frame, 0.15, colors.frame, 1.5);
addContourGroup('FRM_L', f104.layers.GSK_FRM_EXT.contours, leftFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);

// 2. LEFT SASH LEFT STILE (placed nested in left frame)
addContourGroup('SSH_L_L', f104.layers.SSH_EXT.contours, leftFrameTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_L_L', f104.layers.SSH_INT.contours, leftFrameTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_L_L', f104.layers.GSK_SSH_EXT.contours, leftFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_L', f104.layers.GSK_SSH_INT.contours, leftFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_L', f104.layers.BZD.contours, leftFrameTransform, colors.bead, 0.2, colors.bead, 1.2);
if (f104.layers.GSK_BZD) addContourGroup('SSH_L_L', f104.layers.GSK_BZD.contours, leftFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_L', f104.layers.SPACER.contours, leftFrameTransform, colors.spacer, 0.6, colors.spacer, 1.0);

// 3. RIGHT FRAME (placed at X=W, rebate facing left, Ext = high Y, Int = low Y)
const rightFrameTransform = (p) => ({
  x: W - p.y,
  y: 103 - p.x
});

addContourGroup('FRM_R', f104.layers.FRM_EXT.contours, rightFrameTransform, colors.frame, 0.15, colors.frame, 1.5);
addContourGroup('FRM_R', f104.layers.FRM_INT.contours, rightFrameTransform, colors.frame, 0.15, colors.frame, 1.5);
addContourGroup('FRM_R', f104.layers.GSK_FRM_EXT.contours, rightFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);

// 4. RIGHT SASH RIGHT STILE (placed nested in right frame)
addContourGroup('SSH_R_R', f104.layers.SSH_EXT.contours, rightFrameTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_R_R', f104.layers.SSH_INT.contours, rightFrameTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_R_R', f104.layers.GSK_SSH_EXT.contours, rightFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_R', f104.layers.GSK_SSH_INT.contours, rightFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_R', f104.layers.BZD.contours, rightFrameTransform, colors.bead, 0.2, colors.bead, 1.2);
if (f104.layers.GSK_BZD) addContourGroup('SSH_R_R', f104.layers.GSK_BZD.contours, rightFrameTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_R', f104.layers.SPACER.contours, rightFrameTransform, colors.spacer, 0.6, colors.spacer, 1.0);

// 5. MOVABLE POST (placed centered at splitX)
// post: X is width (centered at 39.60 normalized), Y is depth (0=Int, 103=Ext)
const postTransform = (p) => ({
  x: p.x + (splitX - 39.60),
  y: p.y
});

addContourGroup('PST', post.layers.PST_EXT.contours, postTransform, colors.post, 0.15, colors.post, 1.5);
addContourGroup('PST', post.layers.PST_INT.contours, postTransform, colors.post, 0.15, colors.post, 1.5);
if (post.layers.GSK_PST_L) addContourGroup('PST', post.layers.GSK_PST_L.contours, postTransform, colors.gasket, 0.8, colors.gasket, 1.0);
if (post.layers.IGE_GSK_MD_MOVABLE_POST) addContourGroup('PST', post.layers.IGE_GSK_MD_MOVABLE_POST.contours, postTransform, colors.gasket, 0.8, colors.gasket, 1.0);

// 6. RIGHT SASH LEFT STILE (placed relative to Movable Post)
addContourGroup('SSH_R_L', post.layers.SSH_EXT.contours, postTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_R_L', post.layers.SSH_INT.contours, postTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_R_L', post.layers.GSK_SSH_EXT.contours, postTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_L', post.layers.GSK_SSH_INT.contours, postTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_L', post.layers.BZD.contours, postTransform, colors.bead, 0.2, colors.bead, 1.2);
if (post.layers.GSK_BZD) addContourGroup('SSH_R_L', post.layers.GSK_BZD.contours, postTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_R_L', post.layers.SPACER.contours, postTransform, colors.spacer, 0.6, colors.spacer, 1.0);

// 7. LEFT SASH RIGHT STILE (mirrored right sash left stile across splitX)
const mirroredPostTransform = (p) => ({
  x: splitX - (p.x - 39.60),
  y: p.y
});

addContourGroup('SSH_L_R', post.layers.SSH_EXT.contours, mirroredPostTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_L_R', post.layers.SSH_INT.contours, mirroredPostTransform, colors.sash, 0.15, colors.sash, 1.5);
addContourGroup('SSH_L_R', post.layers.GSK_SSH_EXT.contours, mirroredPostTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_R', post.layers.GSK_SSH_INT.contours, mirroredPostTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_R', post.layers.BZD.contours, mirroredPostTransform, colors.bead, 0.2, colors.bead, 1.2);
if (post.layers.GSK_BZD) addContourGroup('SSH_L_R', post.layers.GSK_BZD.contours, mirroredPostTransform, colors.gasket, 0.8, colors.gasket, 1.0);
addContourGroup('SSH_L_R', post.layers.SPACER.contours, mirroredPostTransform, colors.spacer, 0.6, colors.spacer, 1.0);

// 8. GLASS PANELS (drawn as continuous paths matching GLS_EXT, GLS_MD, GLS_INT)
// Left sash glass
const glassLeftX1 = 99.00;
const glassLeftX2 = splitX - 103.00;

// Right sash glass
const glassRightX1 = splitX + 103.00;
const glassRightX2 = W - 99.00;

// Glass depths (Y): EXT [65, 69], MD [43, 47], INT [21, 25]
const glassLayers = [
  { name: 'GLS_EXT', y1: 65, y2: 69 },
  { name: 'GLS_MD', y1: 43, y2: 47 },
  { name: 'GLS_INT', y1: 21, y2: 25 }
];

glassLayers.forEach(gl => {
  // Left Glass
  const leftPts = [
    { x: glassLeftX1, y: gl.y1 }, { x: glassLeftX2, y: gl.y1 },
    { x: glassLeftX2, y: gl.y2 }, { x: glassLeftX1, y: gl.y2 }
  ];
  components.push({
    groupName: `GLS_L_${gl.name}`,
    path: toPath(leftPts),
    color: colors.glass,
    opacity: 0.25,
    strokeColor: colors.glass,
    strokeWidth: 1.0
  });

  // Right Glass
  const rightPts = [
    { x: glassRightX1, y: gl.y1 }, { x: glassRightX2, y: gl.y1 },
    { x: glassRightX2, y: gl.y2 }, { x: glassRightX1, y: gl.y2 }
  ];
  components.push({
    groupName: `GLS_R_${gl.name}`,
    path: toPath(rightPts),
    color: colors.glass,
    opacity: 0.25,
    strokeColor: colors.glass,
    strokeWidth: 1.0
  });
});

// Assembly SVG String
let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#0d1117;">
  <!-- Grid Lines -->
  <defs>
    <pattern id="grid" width="${10*scale}" height="${10*scale}" patternUnits="userSpaceOnUse">
      <path d="M ${10*scale} 0 L 0 0 0 ${10*scale}" fill="none" stroke="#1f2937" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Title & Meta Header -->
  <text x="30" y="40" fill="#fff" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold">IGLO EDGE — Double Window Cross-Section (Parametric)</text>
  <text x="30" y="60" fill="#6b7280" font-family="monospace" font-size="11">System: IGE_DW_PST_LEFT_TT-T.json | Width: ${W}mm | Split Ratio: 0.50</text>

  <!-- Exterior / Interior Label Indicators -->
  <rect x="${tx(W/2) - 80}" y="15" width="160" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="${tx(W/2)}" y="31" fill="#ea580c" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">EXTERIOR SIDE</text>

  <rect x="${tx(W/2) - 80}" y="415" width="160" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="${tx(W/2)}" y="431" fill="#3b82f6" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">INTERIOR SIDE</text>

  <!-- Split Line Reference -->
  <line x1="${tx(splitX)}" y1="70" x2="${tx(splitX)}" y2="385" stroke="#ef4444" stroke-dasharray="5,5" stroke-width="1.5" />
  <text x="${tx(splitX) + 6}" y="85" fill="#ef4444" font-family="monospace" font-size="10" font-weight="bold">SPLIT CENTER (X=${splitX}mm)</text>

  <!-- Render All Components -->
  ${components.map(c => `  <path d="${c.path}" fill="${c.color}" fill-opacity="${c.opacity}" stroke="${c.strokeColor}" stroke-width="${c.strokeWidth}" />`).join('\n')}

  <!-- Dimension line at bottom -->
  <line x1="${tx(0)}" y1="395" x2="${tx(W)}" y2="395" stroke="#9ca3af" stroke-width="1" />
  <line x1="${tx(0)}" y1="390" x2="${tx(0)}" y2="400" stroke="#9ca3af" stroke-width="1" />
  <line x1="${tx(W)}" y1="390" x2="${tx(W)}" y2="400" stroke="#9ca3af" stroke-width="1" />
  <rect x="${tx(W/2) - 50}" y="385" width="100" height="20" rx="3" fill="#0d1117" />
  <text x="${tx(W/2)}" y="399" fill="#9ca3af" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">Total Width: ${W}mm</text>

  <!-- Profile labels -->
  <!-- Left Jamb Frame -->
  <text x="${tx(25)}" y="${ty(-8)}" fill="${colors.frame}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Left Frame (FRM_L)</text>
  <!-- Right Jamb Frame -->
  <text x="${tx(W - 25)}" y="${ty(-8)}" fill="${colors.frame}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Right Frame (FRM_R)</text>
  <!-- Left Sash -->
  <text x="${tx(160)}" y="${ty(-8)}" fill="${colors.sash}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Left Sash (SSH_L)</text>
  <!-- Right Sash -->
  <text x="${tx(W - 160)}" y="${ty(-8)}" fill="${colors.sash}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Right Sash (SSH_R)</text>
  <!-- Movable Post -->
  <text x="${tx(splitX)}" y="${ty(110)}" fill="${colors.post}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Movable Post (PST)</text>

  <!-- Legend -->
  <g transform="translate(30, 460)">
    <!-- Frame -->
    <rect x="0" y="0" width="12" height="12" rx="2" fill="${colors.frame}" fill-opacity="0.3" stroke="${colors.frame}" stroke-width="1"/>
    <text x="18" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">Frame (F104)</text>

    <!-- Sash -->
    <rect x="110" y="0" width="12" height="12" rx="2" fill="${colors.sash}" fill-opacity="0.3" stroke="${colors.sash}" stroke-width="1"/>
    <text x="128" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">Sash (F104)</text>

    <!-- Post -->
    <rect x="220" y="0" width="12" height="12" rx="2" fill="${colors.post}" fill-opacity="0.3" stroke="${colors.post}" stroke-width="1"/>
    <text x="238" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">Movable Post</text>

    <!-- Bead -->
    <rect x="330" y="0" width="12" height="12" rx="2" fill="${colors.bead}" fill-opacity="0.3" stroke="${colors.bead}" stroke-width="1"/>
    <text x="348" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">Glazing Bead (BZD)</text>

    <!-- Glass -->
    <rect x="470" y="0" width="12" height="12" rx="2" fill="${colors.glass}" fill-opacity="0.3" stroke="${colors.glass}" stroke-width="1"/>
    <text x="488" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">Triple Glazing</text>

    <!-- Gaskets -->
    <rect x="590" y="0" width="12" height="12" rx="2" fill="${colors.gasket}" fill-opacity="0.9" stroke="${colors.gasket}" stroke-width="1"/>
    <text x="608" y="10" fill="#9ca3af" font-family="sans-serif" font-size="10">EPDM Gaskets</text>
  </g>
</svg>
`;

// Save SVG files
const svgPathBrain = `${brainDir}/IGE_DW_PST_LEFT_TT-T.svg`;
const svgPathPublic = `${workspaceRoot}/public/IGE_DW_PST_LEFT_TT-T.svg`;
fs.mkdirSync(path.dirname(svgPathBrain), { recursive: true });
fs.writeFileSync(svgPathBrain, svg, 'utf-8');
fs.writeFileSync(svgPathPublic, svg, 'utf-8');
console.log(`✅ SVG saved to brain and public directories.`);

// Convert to PNG using sharp
async function convertToPng() {
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  const pngPathBrain = `${brainDir}/IGE_DW_PST_LEFT_TT-T.png`;
  const pngPathPublic = `${workspaceRoot}/public/IGE_DW_PST_LEFT_TT-T.png`;
  const pngPathDownloads = `${downloadsDir}/IGE_DW_PST_LEFT_TT-T.png`;
  
  fs.writeFileSync(pngPathBrain, pngBuffer);
  fs.writeFileSync(pngPathPublic, pngBuffer);
  fs.writeFileSync(pngPathDownloads, pngBuffer);
  
  console.log(`✅ PNG saved to brain: ${pngPathBrain}`);
  console.log(`✅ PNG saved to public: ${pngPathPublic}`);
  console.log(`✅ PNG saved to Downloads: ${pngPathDownloads}`);
}

convertToPng().catch(err => {
  console.error('Sharp conversion error:', err);
  process.exit(1);
});
