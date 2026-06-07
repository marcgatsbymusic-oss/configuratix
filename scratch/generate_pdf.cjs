const fs = require('fs');
const puppeteer = require('puppeteer');

const activeProfiles = [
  {
    name: 'BottomTop_EXT',
    type: 'Exterior Frame Outer Shell (outer track/bed)',
    group: 'Child2 (Fixed)',
    matType: 'ext',
    colorType: 'ext (Color/Texture)',
    xBounds: '[1.88, 123.49]',
    yBounds: 'Bottom: [0.00, 55.87] <br> Top: [268.89, 324.76]'
  },
  {
    name: 'BottomTop_INT',
    type: 'Interior Frame Inner Shell (interior track/bed facing room)',
    group: 'Child2 (Fixed)',
    matType: 'int',
    colorType: 'int (Color/Texture)',
    xBounds: '[109.96, 164.92]',
    yBounds: 'Bottom: [0.00, 36.06] <br> Top: [288.70, 324.76]'
  },
  {
    name: 'DOOR_FRM_EXT',
    type: 'Exterior Sash Profile (outer sash shell)',
    group: 'Child1 (Sash)',
    matType: 'ext',
    colorType: 'ext (Color/Texture)',
    xBounds: '[98.39, 143.06]',
    yBounds: 'Bottom: [42.88, 138.38] <br> Top: [186.38, 281.88]'
  },
  {
    name: 'DOOR_FRM_INT',
    type: 'Interior Sash Profile (interior room-facing sash shell)',
    group: 'Child1 (Sash)',
    matType: 'int',
    colorType: 'int (Color/Texture)',
    xBounds: '[143.76, 180.39]',
    yBounds: 'Bottom: [29.88, 118.38] <br> Top: [206.38, 294.88]'
  },
  {
    name: 'Profile cover exterior',
    type: 'Frame Exterior Cover/Drip Profile',
    group: 'Child2 (Fixed)',
    matType: 'ext',
    colorType: 'ext (Color/Texture)',
    xBounds: '[0.00, 96.69]',
    yBounds: 'Bottom: [42.28, 60.60] <br> Top: [264.15, 282.48]'
  },
  {
    name: 'BZD',
    type: 'Decorative Glazing Bead (holds glass in interior sash)',
    group: 'Child1 (Sash)',
    matType: 'int',
    colorType: 'int (Color/Texture) *Rail UVs*',
    xBounds: '[167.29, 179.39]',
    yBounds: 'Bottom: [112.63, 138.38] <br> Top: [186.38, 212.13]'
  },
  {
    name: 'Aluminium Rail',
    type: 'Sliding track rail guide (styled as Stainless Steel)',
    group: 'Child2 (Fixed)',
    matType: 'spacer',
    colorType: 'rail (Hex #8a9597 steel)',
    xBounds: '[133.91, 164.90]',
    yBounds: 'Bottom: [33.86, 49.88]'
  },
  {
    name: 'Spacer',
    type: 'Triple glazing unit spacers (holds glass panes apart)',
    group: 'Child1 (Sash)',
    matType: 'spacer',
    colorType: 'spacer (Hex #4B4B4D)',
    xBounds: '[118.89, 159.89]',
    yBounds: 'Bottom: [123.38, 134.38] <br> Top: [190.38, 201.38]'
  },
  {
    name: 'GSK_BZD',
    type: 'Glazing bead gasket seal',
    group: 'Child1 (Sash)',
    matType: 'gsk',
    colorType: 'gsk (Hex #1c1c1c)',
    xBounds: '[163.30, 170.29]',
    yBounds: 'Bottom: [128.41, 142.89] <br> Top: [181.87, 196.34]'
  },
  {
    name: 'GSK_SEAL_DOOR',
    type: 'Compression gaskets (seals sliding sash against frame tracks)',
    group: 'Child1 (Sash)',
    matType: 'gsk',
    colorType: 'gsk (Hex #1c1c1c)',
    xBounds: '[164.41, 172.89]',
    yBounds: 'Bottom: [30.37, 38.58] <br> Top: [286.18, 294.38]'
  },
  {
    name: 'GSK_EXT_DOOR_GLS',
    type: 'Outer glazing gasket (between glass and sash)',
    group: 'Child1 (Sash)',
    matType: 'gsk',
    colorType: 'gsk (Hex #1c1c1c)',
    xBounds: '[90.16, 115.39]',
    yBounds: 'Bottom: [128.69, 138.97] <br> Top: [185.79, 196.07] <br> Outer: [267.19, 277.47]'
  },
  {
    name: 'GLS_EXT',
    type: 'Triple Glazing - Exterior Glass Pane',
    group: 'Child1 (Sash)',
    matType: 'Custom Glass',
    colorType: 'Translucent (glassMat)',
    xBounds: '[115.39, 119.39]',
    yBounds: '[123.38, 201.38]'
  },
  {
    name: 'GLS_MDL',
    type: 'Triple Glazing - Middle Glass Pane',
    group: 'Child1 (Sash)',
    matType: 'Custom Glass',
    colorType: 'Translucent (glassMat)',
    xBounds: '[137.39, 141.39]',
    yBounds: '[123.38, 201.38]'
  },
  {
    name: 'GLS_INT',
    type: 'Triple Glazing - Interior Glass Pane',
    group: 'Child1 (Sash)',
    matType: 'Custom Glass',
    colorType: 'Translucent (glassMat)',
    xBounds: '[159.39, 163.39]',
    yBounds: '[123.38, 201.38]'
  }
];

const unrenderedProfiles = [
  {
    name: 'Hidden Piece',
    type: 'Frame pvc connector/bed blocks',
    xBounds: '[12.40, 95.89]',
    yBounds: 'Bottom: [28.89, 58.68] <br> Top: [266.08, 295.87]',
    reason: 'Internal coupling blocks; invisible once assembled.'
  },
  {
    name: 'GSK_HIDDEN_PIECE_EXT',
    type: 'Seal for hidden coupling pieces',
    xBounds: '[90.16, 98.39]',
    yBounds: 'Bottom: [47.29, 57.57]',
    reason: 'Gasket sealing internal frame cavities.'
  },
  {
    name: 'GSK_LARGE_UNDERNEATH_DOOR',
    type: 'Frame barrier drip gasket',
    xBounds: '[111.62, 122.38]',
    yBounds: 'Bottom: [29.10, 48.32] <br> Top: [276.43, 295.66]',
    reason: 'Sub-threshold seal blocks.'
  }
];

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SLE201 Profiles and Geometry Catalog</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
  
  body {
    font-family: 'Outfit', sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    margin: 50px;
    line-height: 1.6;
  }
  
  .header-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    padding: 35px;
    border-radius: 18px;
    margin-bottom: 40px;
  }
  
  .header-card h1 {
    font-size: 28px;
    font-weight: 800;
    color: #f8fafc;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
  
  .header-card p {
    color: #94a3b8;
    margin: 0;
    font-size: 15px;
  }

  .meta-tag {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #f59e0b;
    margin-bottom: 12px;
  }
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
    border-left: 4px solid #f59e0b;
    padding-left: 12px;
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    font-size: 12.5px;
  }
  
  th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    text-align: left;
    padding: 12px 14px;
    border-bottom: 2px solid #e2e8f0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: top;
  }
  
  tr:nth-child(even) td {
    background-color: #fafbfc;
  }
  
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10.5px;
    font-weight: 600;
  }
  
  .badge-fixed {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
  .badge-sash {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .badge-mat {
    background-color: #f1f5f9;
    color: #475569;
    font-family: monospace;
  }
  
  .coordinate {
    font-family: monospace;
    font-size: 11.5px;
    color: #0f172a;
    background-color: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .info-box {
    background-color: #fafbfb;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3b82f6;
    padding: 18px 22px;
    border-radius: 10px;
    margin-bottom: 35px;
  }
  
  .info-box h3 {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #1e3a8a;
  }
  
  .info-box p {
    margin: 0;
    font-size: 13px;
    color: #475569;
  }
  
  @media print {
    body {
      margin: 15px;
    }
    tr {
      page-break-inside: avoid;
    }
    h2 {
      page-break-after: avoid;
    }
  }
</style>
</head>
<body>
  <div class="header-card">
    <div class="meta-tag">Configurator Database Catalog</div>
    <h1>SLE201 Profiles and Geometry Specification</h1>
    <p>A comprehensive inventory of PVC profiles, track rails, glass, and gaskets used in the Iglo Edge SLE201 3D viewer, extracted from the A+W Cantor CAD database.</p>
  </div>

  <div class="info-box">
    <h3>3D Coordinate Mapping Details</h3>
    <p>
      Lengths are scaled to meters by multiplying the native CAD millimeter values by <code>0.001</code>. 
      The sash width is 82 mm, with the interior face sitting at World Z coordinate <code>-180 mm</code> (interior camera view) 
      and the exterior face at <code>-98 mm</code>.
    </p>
  </div>

  <h2>Active Rendered Profiles (Sash & Frame Pieces)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 15%">Layer Name</th>
        <th style="width: 25%">Description</th>
        <th style="width: 15%">Render Group</th>
        <th style="width: 10%">Material</th>
        <th style="width: 12%">Color Info</th>
        <th style="width: 11%">X-Bounds (mm)</th>
        <th style="width: 12%">Y-Bounds (mm)</th>
      </tr>
    </thead>
    <tbody>
      ${activeProfiles.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.type}</td>
          <td><span class="badge ${p.group.includes('Fixed') ? 'badge-fixed' : 'badge-sash'}">${p.group}</span></td>
          <td><span class="badge badge-mat">${p.matType}</span></td>
          <td>${p.colorType}</td>
          <td><span class="coordinate">${p.xBounds}</span></td>
          <td>${p.yBounds.split('<br>').map(b => `<span class="coordinate">${b.trim()}</span>`).join('<br>')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Unrendered Structural & Auxiliary Layers</h2>
  <table style="margin-top: 20px;">
    <thead>
      <tr>
        <th style="width: 18%">Layer Name</th>
        <th style="width: 25%">Description</th>
        <th style="width: 13%">X-Bounds (mm)</th>
        <th style="width: 16%">Y-Bounds (mm)</th>
        <th style="width: 28%">Reason Skipped in 3D Rendering</th>
      </tr>
    </thead>
    <tbody>
      ${unrenderedProfiles.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.type}</td>
          <td><span class="coordinate">${p.xBounds}</span></td>
          <td>${p.yBounds.split('<br>').map(b => `<span class="coordinate">${b.trim()}</span>`).join('<br>')}</td>
          <td style="color: #64748b; font-style: italic;">${p.reason}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
`;

(async () => {
  console.log("Launching headless browser to generate PDF...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Setting page content...");
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const outputPath = 'sle201_profiles_and_geometry.pdf';
  console.log(`Saving PDF to ${outputPath}...`);
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    },
    printBackground: true
  });
  
  await browser.close();
  console.log(`PDF successfully generated and saved to: ${outputPath}`);
})().catch(err => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
