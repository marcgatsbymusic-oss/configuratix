import fs from 'fs';
import path from 'path';

const TXT_PATH = path.resolve('ES.txt');
const OUT_PATH = path.resolve('src/data/spanishGeodata.ts');

const PROVINCE_CTE_BASE = {
  'Álava': { w: 'D', s: '1', alt: 508 },
  'Albacete': { w: 'D', s: '3', alt: 686 },
  'Alicante': { w: 'B', s: '4', alt: 3 },
  'Almería': { w: 'A', s: '4', alt: 27 },
  'Asturias': { w: 'C', s: '1', alt: 3 },
  'Ávila': { w: 'E', s: '1', alt: 1131 },
  'Badajoz': { w: 'C', s: '4', alt: 184 },
  'Baleares': { w: 'B', s: '3', alt: 3 },
  'Barcelona': { w: 'C', s: '2', alt: 4 },
  'Bizkaia': { w: 'C', s: '1', alt: 3 },
  'Burgos': { w: 'E', s: '1', alt: 859 },
  'Cáceres': { w: 'C', s: '4', alt: 398 },
  'Cádiz': { w: 'A', s: '3', alt: 14 },
  'Cantabria': { w: 'C', s: '1', alt: 15 },
  'Castellón': { w: 'B', s: '3', alt: 30 },
  'Ceuta': { w: 'A', s: '3', alt: 5 },
  'Ciudad Real': { w: 'D', s: '4', alt: 628 },
  'Córdoba': { w: 'B', s: '4', alt: 110 },
  'A Coruña': { w: 'C', s: '1', alt: 22 },
  'Cuenca': { w: 'D', s: '3', alt: 1000 },
  'Gipuzkoa': { w: 'C', s: '1', alt: 9 },
  'Girona': { w: 'D', s: '2', alt: 75 },
  'Granada': { w: 'C', s: '3', alt: 680 },
  'Guadalajara': { w: 'D', s: '3', alt: 708 },
  'Huelva': { w: 'A', s: '4', alt: 22 },
  'Huesca': { w: 'D', s: '2', alt: 488 },
  'Jaén': { w: 'C', s: '4', alt: 580 },
  'León': { w: 'E', s: '1', alt: 837 },
  'Lleida': { w: 'D', s: '3', alt: 158 },
  'Lugo': { w: 'D', s: '1', alt: 452 },
  'Madrid': { w: 'D', s: '3', alt: 655 },
  'Málaga': { w: 'A', s: '3', alt: 5 },
  'Melilla': { w: 'A', s: '3', alt: 15 },
  'Murcia': { w: 'B', s: '3', alt: 43 },
  'Navarra': { w: 'D', s: '1', alt: 443 },
  'Ourense': { w: 'D', s: '2', alt: 143 },
  'Palencia': { w: 'E', s: '1', alt: 749 },
  'Las Palmas': { w: 'A', s: '3', alt: 10 },
  'Pontevedra': { w: 'C', s: '1', alt: 22 },
  'La Rioja': { w: 'D', s: '2', alt: 384 },
  'Salamanca': { w: 'D', s: '2', alt: 802 },
  'Santa Cruz de Tenerife': { w: 'A', s: '3', alt: 40 },
  'Segovia': { w: 'D', s: '2', alt: 1005 },
  'Sevilla': { w: 'B', s: '4', alt: 11 },
  'Soria': { w: 'E', s: '1', alt: 1063 },
  'Tarragona': { w: 'C', s: '3', alt: 68 },
  'Teruel': { w: 'D', s: '2', alt: 915 },
  'Toledo': { w: 'C', s: '4', alt: 529 },
  'Valencia': { w: 'B', s: '3', alt: 15 },
  'Valladolid': { w: 'D', s: '2', alt: 698 },
  'Zamora': { w: 'D', s: '2', alt: 652 },
  'Zaragoza': { w: 'D', s: '3', alt: 243 }
};

async function build() {
  console.log('Parsing ES.txt...');
  const text = fs.readFileSync(TXT_PATH, 'utf-8');
  const lines = text.split('\n');
  
  const dynamicProvinceMap = {};
  
  // Pass 1: Extract ADM2
  console.log('Mining ADM2 Province Indices...');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    if (cols[7] === 'ADM2') {
       let code = cols[11];
       let name = cols[1].replace('Provincia de ', '').replace('Province of ', '').trim();
       
       // Clean normalization to match PROVINCE_CTE_BASE
       if (name === 'Balearic Islands' || name === 'Illes Balears') name = 'Baleares';
       if (name === 'Coruña') name = 'A Coruña';
       if (name === 'Gipuzkoa') name = 'Gipuzkoa';
       if (name === 'Alava') name = 'Álava';
       if (name === 'Biscay') name = 'Bizkaia';
       
       dynamicProvinceMap[code] = name;
    }
  }

  // Fallbacks for standard codes missing ADM2
  dynamicProvinceMap['M'] = 'Madrid';
  dynamicProvinceMap['B'] = 'Barcelona';
  dynamicProvinceMap['V'] = 'Valencia';
  dynamicProvinceMap['Z'] = 'Zaragoza';
  dynamicProvinceMap['AL'] = 'Almería';

  console.log("Built Province Map:", dynamicProvinceMap);
  
  const cities = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const featureClass = cols[6];
    const featureCode = cols[7];
    
    if (featureClass === 'P' && featureCode && featureCode.startsWith('PPL')) {
      const name = cols[1];
      const admin2Code = cols[11];
      
      let elevation = cols[15] ? parseInt(cols[15], 10) : null;
      if (elevation === null || isNaN(elevation)) {
          elevation = cols[16] ? parseInt(cols[16], 10) : null;
      }
      
      let province = dynamicProvinceMap[admin2Code];
      
      // Auto-correct spelling against CTE
      if (province) {
         const keys = Object.keys(PROVINCE_CTE_BASE);
         const exact = keys.find(k => k.toLowerCase() === province.toLowerCase());
         if (exact) province = exact;
      }
      
      if (province && elevation !== null && !isNaN(elevation)) {
        cities.push({ p: province, n: name, a: elevation });
      }
    }
  }

  // Deduplicate on Name across Province
  const uniqueCities = {};
  cities.forEach(c => {
    const key = `${c.p}-${c.n}`;
    if (!uniqueCities[key] || uniqueCities[key].a < c.a) {
        uniqueCities[key] = c;
    }
  });

  const finalArray = Object.values(uniqueCities);
  finalArray.sort((a, b) => a.p.localeCompare(b.p) || a.n.localeCompare(b.n));

  console.log(`Successfully mapped ${finalArray.length} municipalities with complete altitude payloads.`);

  const tsContent = `// Auto-generated 8000+ City Elevation Profile directly from GeoNames OpenData Array
export const PROVINCE_CTE_BASE = ${JSON.stringify(PROVINCE_CTE_BASE, null, 2)};

export interface CityData {
  p: string; // Province
  n: string; // Name
  a: number; // Altitude
}

export const CITIES_DB: CityData[] = ${JSON.stringify(finalArray)};
`;

  fs.writeFileSync(OUT_PATH, tsContent);
  console.log('spanishGeodata.ts written natively to /src/data!');
}

build();
