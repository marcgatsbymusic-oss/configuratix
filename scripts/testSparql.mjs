import fs from 'fs';

const query = `
SELECT ?cityLabel ?provinceLabel ?elevation WHERE {
  ?city wdt:P31 wd:Q2074737.
  ?city wdt:P131* ?province.
  ?province wdt:P31 wd:Q170889.
  ?city wdt:P2044 ?elevation.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
}
LIMIT 100
`;

const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

async function fetchTopo() {
  console.log('Querying Wikidata (SPARQL)...');
  try {
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/sparql-results+json', 
        'User-Agent': 'MammutWindowConfigurator/1.1 (test@example.com)' 
      } 
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    console.log(`Success! Extracted ${data.results.bindings.length} nodes.`);
    console.log(data.results.bindings.slice(0, 5).map(b => ({
      city: b.cityLabel?.value,
      province: b.provinceLabel?.value,
      elevation: b.elevation?.value
    })));
  } catch (e) {
    console.error('Failed:', e);
  }
}

fetchTopo();
