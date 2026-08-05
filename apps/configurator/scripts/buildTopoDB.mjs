import fs from 'fs';
import path from 'path';

const query = `
SELECT ?cityLabel ?provinceLabel ?autonomiaLabel ?elevation WHERE {
  ?city wdt:P31 wd:Q2074737.
  ?city wdt:P131 ?province.
  ?province wdt:P31 wd:Q170889.
  ?province wdt:P131 ?autonomia.
  ?autonomia wdt:P31 wd:Q10742.
  ?city wdt:P2044 ?elevation.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
}
`;

const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

async function fetchTopo() {
  console.log('Querying Wikidata (SPARQL) to architect Spanish Geographic TopoJSON...');
  try {
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/sparql-results+json', 
        'User-Agent': 'MammutWindowConfigurator/1.0 (info@example.com)' 
      } 
    });
    
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    const results = data.results.bindings;
    
    const db = {};
    
    for (const row of results) {
      const city = row.cityLabel.value;
      const province = row.provinceLabel.value.replace('provincia de ', '').replace('Provincia de ', '');
      const autonomia = row.autonomiaLabel.value;
      const elevation = parseFloat(row.elevation.value);
      
      if (!db[autonomia]) db[autonomia] = {};
      if (!db[autonomia][province]) db[autonomia][province] = [];
      
      if (!db[autonomia][province].find(c => c.n === city)) {
        db[autonomia][province].push({ n: city, a: elevation });
      }
    }
    
    // Sort
    for (const aut in db) {
        for (const prov in db[aut]) {
            db[aut][prov].sort((a,b) => a.n.localeCompare(b.n));
        }
    }

    const dir = path.resolve('./src/data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(path.join(dir, 'municipios.json'), JSON.stringify(db));
    console.log(`Successfully compiled topographical altitude data for ${results.length} Spanish municipalities into src/data/municipios.json!`);
    
  } catch (e) {
    console.error('Failed to compile Wikidata:', e);
  }
}

fetchTopo();
