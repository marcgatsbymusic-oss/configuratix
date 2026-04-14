import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, 'data', 'prodtyp_raw.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'generated_profiles.json');

function cleanFamilyName(name) {
    let clean = name.split(' - ')[0]; // Split at first dash with spaces
    // Remove trailing modifiers that aren't part of the core family name
    clean = clean.replace(/ADAPT.*$/, '').trim();
    clean = clean.replace(/RENO.*$/, '').trim();
    clean = clean.replace(/OUTWARD.*$/, '').trim();
    // Special cleanup for common appended text
    if (clean.includes('MB45')) return 'MB 45';
    if (clean.includes('MB70') || clean.includes('MB 70')) return 'MB 70';
    if (clean.includes('MB79N') || clean.includes('MB 79N')) return 'MB 79N';
    if (clean.includes('MB86') || clean.includes('MB 86')) return 'MB 86';
    if (clean.includes('MB-77')) return 'MB 77 HS';
    if (clean.includes('MB SLIDE')) return 'MB Slide';
    if (clean.includes('STAR')) return 'Star';
    if (clean.includes('GENESIS')) return 'Genesis';
    if (clean.includes('SOFTLINE 68')) return 'Softline 68';
    if (clean.includes('SOFTLINE 78')) return 'Softline 78';
    if (clean.includes('SOFTLINE 88')) return 'Softline 88';
    if (clean.includes('DUOLINE 68')) return 'Duoline 68';
    if (clean.includes('DUOLINE 78')) return 'Duoline 78';
    if (clean.includes('DUOLINE 88')) return 'Duoline 88';
    
    // Default capitalize words (e.g. "IGLO 5 CLASSIC" -> "Iglo 5 Classic")
    return clean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

async function main() {
    console.log('Reading prodtyp_raw.json...');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

    // Material Maps
    // 1 = Wood/System, 2 = PVC, 3 = Aluminium
    const categories = {
        'PVC': [],
        'Aluminium': [],
        'PVC-Aluminium': [],
        'Wood': [],
        'Wood-Aluminium': []
    };

    const familiesTracker = new Set();
    const resultFamilies = [];

    rawData.rows.forEach(row => {
        const desc = row.BEZEICHNUNG.toUpperCase();
        
        // Filter out obvious separator rows or non-products
        const junkKeywords = [
            '=====', 'TEST', 'MOSQUITO', 'ROLETA', 'SYSTEM R', 'PROFIL', 'WYPOSAZENIE',
            'COLOUR', 'COLOR', 'VENTILATION', 'GLASS', 'HANDLE', 'GRILL', 'GUIDE', 'SILL',
            'ZABEZPIECZENIE', 'USZCZELKA', 'PANEL', 'MASKOWNICA', 'ZAŚLEPKA', 'ZASLEPKA',
            'CASSONETTO', 'BUMPER', 'BUFFER', 'HINGE', 'KLAMK', 'POCHWYT', 'PROG', 'PRÓG',
            'AERECO', 'AMO', 'BROOKVENT', 'DORMA', 'GEZE', 'IQUOTE', 'INFILLS', 'DOOR CLOSER',
            'KOLOR', 'LISTWY', 'MOSKITIERA', 'INSECT SCREEN', 'PACKAGE', 'PAKIET',
            'PIASKOWA', 'SANDWICH', 'PŁYTY', 'PLYTY', 'ROLLER SHUTTER', 'WYPEŁNIENI', 'WYPELNIENI',
            'WZORY', 'ŻALUZJE', 'ZALUZJE', 'BLINDS', 'GLUING', 'GLAZING BEAD',
            'OUTDOOR SHUTTER', 'NIEVISIBLE', 'BRAMY', 'GARAGE DOOR', 'PACKAGING', 
            'PRZETŁOCZENIA', 'PRZETLOCZENIA', 'TYPE OF GLAZING', 'VIRTUAL TYPE', 'VIRTUAL'
        ];
        
        if (junkKeywords.some(kw => desc.includes(kw))) return;
        
        const familyName = cleanFamilyName(desc);
        const slug = generateSlug(familyName);

        if (!slug || slug.length < 3) return; // Ignore single letter/number junk

        if (!familiesTracker.has(slug)) {
            familiesTracker.add(slug);
            
            // Determine material logic
            let category = 'Unknown';
            if (desc.includes('ALUCOVER')) {
                category = 'PVC-Aluminium';
            } else if (desc.includes('DUOLINE')) {
                category = 'Wood-Aluminium';
            } else if (row.MATERIALART === 2) {
                category = 'PVC';
            } else if (row.MATERIALART === 3 || desc.includes('MB') || desc.includes('GENESIS') || desc.includes('STAR')) {
                // Alu is 3, but MB series, Genesis, Star are definitely Alu.
                category = 'Aluminium';
            } else if (row.MATERIALART === 1 || desc.includes('SOFTLINE')) {
                category = 'Wood';
            }

            if (categories[category]) {
                // Set default tags
                const tags = [];
                if (desc.includes('ENERGY') || desc.includes('EDGE')) {
                    tags.push({ text: 'High Efficiency', color: 'emerald' });
                }
                if (desc.includes('MB86') || desc.includes('MB 86') || desc.includes('STAR')) {
                    tags.push({ text: 'Premium', color: 'blue' });
                }
                
                // Construct profile object
                const profileObj = {
                    id: slug,
                    name: familyName,
                    image: '/assets/profiles/' + slug + '.png', // We will fallback if missing in UI
                    tags: tags,
                    cantorSystemMap: row.PRODUCTSYSTEM // e.g. "DRUTEX1"
                };
                
                categories[category].push(profileObj);
            }
        }
    });

    // Cleanup: Sort arrays by name
    Object.keys(categories).forEach(cat => {
        categories[cat] = categories[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf8');
    console.log(`Successfully generated ${outputPath} with ${familiesTracker.size} profiles mapped.`);
    
    // Quick summary
    Object.keys(categories).forEach(cat => {
        console.log(`- ${cat}: ${categories[cat].length} profiles`);
    });
}

main().catch(console.error);
