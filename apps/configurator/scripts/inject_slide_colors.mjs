import fs from 'fs';

const colors = JSON.parse(fs.readFileSync('scripts/slide_colors.json', 'utf8'));
const destDir = 'public/assets/windowcolors/iglo-edge-slide';

const productDetails = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const regex = /export const IGLO_EDGE_COLORS[\s\S]*?\];/;
const match = productDetails.match(regex);

if (!match) {
    console.error("Could not find IGLO_EDGE_COLORS block");
    process.exit(1);
}

const block = match[0];

let newColorsArray = [];
const lines = block.split('\n');

const localMap = {};
for (const c of colors) {
    const filename = c.frameUrl.split('/').pop();
    localMap[c.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = `/assets/windowcolors/iglo-edge-slide/${filename}`;
}

localMap['basaltgrey'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_bazaltowy_szary.png';
localMap['basaltgreygadki'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_bazaltowy_szary_gladki.png';
localMap['deepbronze'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_deep_bronze.png';
localMap['graphitesandblasted'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_grafitowy_piaskowy.png';
localMap['greyquartz'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_kwarcytowy_szary.png';
localMap['greyquartzsmooth'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_kwarcytowy_szary_gladki.png';
localMap['steelblue'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_stalowy_niebieski.png';
localMap['anthracite'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_antracyt.png';
localMap['anthraciteultimatt'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_antracyt_ulti_matt.png';
localMap['anthracitesmooth'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_antracyt_gladki.png';
localMap['whitefx'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_bialy_fx.png';
localMap['goldenoak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_zloty_dab.png';
localMap['walnut'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_orzech.png';
localMap['macore'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_macore.png';
localMap['mahogany'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_mahon.png';
localMap['winchester'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_winchester.png';
localMap['darkoak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_ciemny_dab.png';
localMap['swampoak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_ciemny_dab.png'; 
localMap['oregon'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_oregon.png';
localMap['rosewood'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_palisander.png';
localMap['douglasfir'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_daglezja.png';
localMap['turneroak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_turner_oak.png';
localMap['bleachedoak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_dab_bielony.png';
localMap['naturaloak'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_dab_naturalny.png';
localMap['mossgreen'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_zielen_mchu.png';
localMap['darkgreen'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_ciemny_zielony.png';
localMap['darkred'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_ciemny_czerwony.png';
localMap['brilliantblue'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_brylan_niebieski.png';
localMap['whitesandumatt'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_white_sand.png';
localMap['crownplatinum'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_crow_platinium.png';
localMap['grey'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_szary.png';
localMap['lightgrey'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_jasny_szary.png';
localMap['concretegrey'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_betonowy_szary.png';
localMap['slate'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_lupkowy.png';
localMap['slategreysmooth'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_lupkowy_szary_gladki.png';
localMap['jetblack'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_jet_black.png';
localMap['blackultimatt'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_czarny_ultimatt.png';
localMap['chocolatebrown'] = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_braz_czekoladowy.png';

for (let line of lines) {
    if (!line.trim()) continue;
    
    // Make sure we only change windowImage, not image
    let nameMatch = line.match(/name:\s*'([^']+)'/);
    if (nameMatch) {
        let name = nameMatch[1];
        let cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let newImg = localMap[cleanName];
        if (!newImg) {
            newImg = '/assets/windowcolors/iglo-edge-slide/iglo_edge_slide_-_bialy_fx.png';
        }
        
        line = line.replace(/windowImage:\s*'[^']+'/, `windowImage: '${newImg}'`);
    }
    
    // replace variable name
    if (line.includes('export const IGLO_EDGE_COLORS')) {
        line = line.replace('IGLO_EDGE_COLORS', 'IGLO_EDGE_SLIDE_COLORS');
    }
    
    newColorsArray.push(line);
}

const tsCode = `\n${newColorsArray.join('\n')}\n`;

const finalContent = productDetails.replace(block, block + tsCode);
fs.writeFileSync('src/data/productDetails.ts', finalContent);

let finalFinalContent = fs.readFileSync('src/data/productDetails.ts', 'utf8');
finalFinalContent = finalFinalContent.replace(/colors: IGLO_EDGE_COLORS,(\s*glassOptions: \[\])/g, 'colors: IGLO_EDGE_SLIDE_COLORS,$1');
fs.writeFileSync('src/data/productDetails.ts', finalFinalContent);

console.log("SUCCESSFULLY injected without syntax errors!");
