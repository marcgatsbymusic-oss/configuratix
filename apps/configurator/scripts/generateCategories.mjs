import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, 'data', 'prodtyp_raw.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'website_catalog.json');

const WEBSITE_CATALOG = {
    "Windows": {
        "PVC": ["IGLO EDGE", "IGLO ENERGY", "IGLO ENERGY CLASSIC", "IGLO ENERGY ALUCOVER", "IGLO 5", "IGLO 5 CLASSIC", "IGLO LIGHT", "IGLO EXT", "IGLO PREMIER", "IDEAL 4000", "IDEAL 7000", "IDEAL 8000"],
        "Aluminium": ["MB-86N SI", "MB-79N SI", "MB-70HI", "MB-70", "MB-45"],
        "Wood": ["SOFTLINE 68", "SOFTLINE 78", "SOFTLINE 88"],
        "Wood-Aluminium": ["DUOLINE 68", "DUOLINE 78", "DUOLINE 88"]
    },
    "Doors": {
        "PVC": ["IGLO ENERGY Doors", "IGLO 5 Doors", "IGLO EDGE Doors"],
        "Aluminium": ["D-ART Line", "MB-86N SI Doors", "MB-79N SI+ Doors", "MB-70HI Doors", "MB-70 Doors", "MB-45 Doors", "MB-78EI Fire-Doors", "PIVOT"],
        "Wood": ["SOFTLINE 68 Doors", "SOFTLINE 78 Doors", "SOFTLINE 88 Doors"]
    },
    "Terrace Systems": [
        "IGLO-HS", "IGLO-HS ALUCOVER", "MB-77HS HI", "MB-77HS HI MONORAIL", "MB-59HS HI", "SOFTLINE HS", "DUOLINE HS",
        "IGLO EDGE SLIDE", "IGLO SLIDE", "MB-SLIDE", "COR VISION", "COR VISION PLUS",
        "MB-86 FOLD LINE HD", "SOFTLINE 68 Folding",
        "IGLO ENERGY PSK", "IGLO ENERGY CLASSIC PSK", "IGLO 5 PSK", "IGLO 5 CLASSIC PSK", "IGLO LIGHT PSK", "MB-70 / MB-70HI PSK", "SOFTLINE PSK", "DUOLINE PSK"
    ],
    "Shutters": [
        "Aluminium shutters", "Aluminium shutters RDZ", "PVC shutters", "Roller shutters with styrofoam box"
    ],
    "Exterior Venetian Blinds": [
        "Exterior Venetian Blinds"
    ],
    "Insect Screens": [
        "Pleated Insect Screen"
    ],
    "Garage doors": [
        "Garage doors"
    ],
    "Facades / Winter Gardens": [
        "MB-SR50N / SR50N HI", "MB-WG60"
    ],
    "Pergola": [
        "Pergola"
    ]
};

function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getCantorRawList() {
    try {
        const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
        return rawData.rows;
    } catch (e) {
        console.error("Could not read prodtyp_raw.json", e);
        return [];
    }
}

function matchCantorSystem(cleanName, cantorRows) {
    let nameToMatch = cleanName.toUpperCase();
    
    if (nameToMatch.includes('MB-86')) nameToMatch = 'MB86';
    if (nameToMatch.includes('MB-79')) nameToMatch = 'MB79';
    if (nameToMatch.includes('MB-70')) nameToMatch = 'MB70';
    if (nameToMatch.includes('MB-45')) nameToMatch = 'MB45';
    if (nameToMatch.includes('MB-77')) nameToMatch = 'MB77';
    if (nameToMatch.includes('MB-59')) nameToMatch = 'MB59';
    if (nameToMatch.includes('SOFTLINE')) nameToMatch = 'SOFTLINE';
    if (nameToMatch.includes('DUOLINE')) nameToMatch = 'DUOLINE';
    if (nameToMatch.includes('IGLO 5 DOORS')) nameToMatch = 'IGLO 5';
    if (nameToMatch.includes('IGLO ENERGY DOORS')) nameToMatch = 'IGLO ENERGY';
    
    for (let r of cantorRows) {
        const desc = r.BEZEICHNUNG.toUpperCase();
        if (desc === nameToMatch) return r.PRODUCTSYSTEM;
    }
    
    for (let r of cantorRows) {
        const desc = r.BEZEICHNUNG.toUpperCase();
        if (desc.includes(nameToMatch) && r.PRODUCTSYSTEM) {
           return r.PRODUCTSYSTEM;
        }
    }
    
    for (let r of cantorRows) {
        const desc = r.BEZEICHNUNG.toUpperCase();
        if (nameToMatch.includes(desc) && r.PRODUCTSYSTEM) {
           return r.PRODUCTSYSTEM;
        }
    }

    return null;
}

function getTechnicalData(prodName) {
   let uw = 1.0;
   let depth = 70;
   let gaskets = 2;
   let chambers = undefined;
   let desc = "Standard " + prodName + " System.";

   const name = prodName.toUpperCase();
   if (name.includes('EDGE')) { uw = 0.66; depth = 82; gaskets = 3; chambers = 7; desc = "Premium 7-chamber profile with class A depth of 82mm and advanced energy efficiency."; }
   else if (name.includes('ENERGY')) { uw = 0.79; depth = 82; gaskets = 3; chambers = 7; desc = "Advanced 7-chamber profile for maximum energy savings."; }
   else if (name.includes('IGLO 5')) { uw = 0.89; depth = 70; gaskets = 2; chambers = 5; desc = "Classic 5-chamber design combining great value and thermal efficiency."; }
   else if (name.includes('LIGHT')) { uw = 0.95; depth = 70; gaskets = 2; chambers = 5; desc = "Slimmer 5-chamber profile for increased natural light."; }
   else if (name.includes('IDEAL 8000')) { uw = 0.76; depth = 85; gaskets = 3; chambers = 6; desc = "High-end 85mm 6-chamber system for superior thermal insulation."; }
   else if (name.includes('IDEAL 7000')) { uw = 0.85; depth = 85; gaskets = 2; chambers = 6; desc = "Reliable 85mm 6-chamber profile combining strength and efficiency."; }
   else if (name.includes('IDEAL')) { uw = 1.0; depth = 70; gaskets = 2; chambers = 5; desc = "Cost-effective 70mm 5-chamber window system."; }
   else if (name.includes('MB-86')) { uw = 0.72; depth = 77; gaskets = 3; desc = "Advanced aluminium system with excellent thermal insulation and strength."; }
   else if (name.includes('MB-79')) { uw = 0.83; depth = 70; gaskets = 3; desc = "Versatile aluminium system for demanding modern architecture."; }
   else if (name.includes('MB-70')) { uw = 1.0; depth = 70; gaskets = 2; desc = "Standard aluminium profile designed for durability."; }
   else if (name.includes('MB-45')) { uw = 1.5; depth = 45; gaskets = 2; desc = "Non-thermal broken aluminium system for interior partitions."; }
   else if (name.includes('SOFTLINE')) {
      gaskets = 2;
      if (name.includes('88')) { uw = 0.79; depth = 88; desc = "Premium 88mm wooden frame offering outstanding insulation."; }
      else if (name.includes('78')) { uw = 0.88; depth = 78; desc = "High-quality 78mm wooden frame for robust thermal performance."; }
      else { uw = 1.0; depth = 68; desc = "Classic 68mm wooden frame balancing aesthetics and value."; }
   }
   else if (name.includes('DUOLINE')) {
      gaskets = 3;
      if (name.includes('88')) { uw = 0.76; depth = 99; desc = "Premium 88mm wood-aluminium frame with external aluminium shield."; }
      else if (name.includes('78')) { uw = 0.85; depth = 89; desc = "Durable 78mm wood-aluminium frame ensuring long-lasting performance."; }
      else { uw = 0.95; depth = 79; desc = "Classic 68mm wood-aluminium frame with external protection."; }
   }

   let energyGrade = 'C';
   if (uw <= 0.75) energyGrade = 'A+';
   else if (uw <= 0.85) energyGrade = 'A';
   else if (uw <= 1.0) energyGrade = 'B';
   else if (uw > 1.2) energyGrade = 'D';

   const tech = { uwValue: uw, profileDepth: depth, gaskets, energyGrade, description: desc };
   if (chambers) tech.chambers = chambers;
   return tech;
}

async function main() {
    console.log('Building mapped Website Catalog with Technical Data...');
    const cantorRows = getCantorRawList();

    const result = {};

    for (const [category, groupOrArray] of Object.entries(WEBSITE_CATALOG)) {
        let itemsToProcess = [];
        if (Array.isArray(groupOrArray)) {
            itemsToProcess = groupOrArray.map(prodName => ({ prodName, material: null }));
        } else {
            for (const [material, products] of Object.entries(groupOrArray)) {
                for (const prodName of products) {
                    itemsToProcess.push({ prodName, material });
                }
            }
        }

        result[category] = itemsToProcess.map(({ prodName, material }) => {
            const slug = generateSlug(prodName);
            const mapping = matchCantorSystem(prodName, cantorRows);
            const techData = getTechnicalData(prodName);
            
            const tags = [];
            if (techData.energyGrade === 'A+') {
                tags.push({ text: 'High Efficiency', color: 'emerald' });
            }
            if (prodName.includes('86') || prodName.includes('88')) {
                tags.push({ text: 'Premium', color: 'blue' });
            }

            const out = {
                id: slug,
                name: prodName,
                image: '/assets/profiles/' + slug + '.png',
                tags: tags,
                cantorSystemMap: mapping,
                technical: techData
            };
            if (material) out.material = material;
            return out;
        });
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    
    let total = 0;
    let mapped = 0;
    Object.values(result).forEach(arr => {
        total += arr.length;
        arr.forEach(p => { if (p.cantorSystemMap) mapped++; });
    });

    console.log(`Successfully generated ${outputPath}`);
    console.log(`Total Products: ${total}`);
    console.log(`Successfully Mapped to Cantor: ${mapped}`);
}

main().catch(console.error);
