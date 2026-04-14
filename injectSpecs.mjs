import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, 'src', 'data', 'website_catalog.json');
const specsPath = path.join(__dirname, 'src', 'data', 'technical_specs.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const specs = JSON.parse(fs.readFileSync(specsPath, 'utf8'));

// Iterate over the catalog
for (const category in catalog) {
  for (const profile of catalog[category]) {
    const specKey = profile.id.replace(/-/g, '').toLowerCase();
    const data = specs[specKey];
    if (data && data.technical) {
      profile.technical = {
        uwValue: parseFloat(data.technical.thermalTransmittance.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0.8,
        profileDepth: parseInt(data.technical.installationDepth) || 82,
        chambers: parseInt(data.technical.chambers) || undefined,
        gaskets: parseInt(data.technical.gaskets) || undefined,
        soundInsulation: data.technical.soundInsulation,
        profileClass: data.technical.profileClass,
        energyGrade: 'B', 
        description: data.description
      };

      if (profile.technical.uwValue <= 0.70) profile.technical.energyGrade = 'A+';
      else if (profile.technical.uwValue <= 0.80) profile.technical.energyGrade = 'A';
      else if (profile.technical.uwValue <= 0.90) profile.technical.energyGrade = 'B';
      else profile.technical.energyGrade = 'C';
    }
  }
}

// Ensure the 6 missing IDEAL profiles exist in the Windows array:
const idealProfiles = [
  { id: 'ideal-neo-ad', name: 'IDEAL NEO AD', image: '/assets/ideal_neo_ad_img.jpg', material: 'PVC' },
  { id: 'ideal-neo-md', name: 'IDEAL NEO MD', image: '/assets/neo_md_okno_profil.png', material: 'PVC' },
  { id: 'ideal-neo-md-fs', name: 'IDEAL NEO MD-FS', image: '/assets/ideal_neo_md_fs.jpg', material: 'PVC' },
  { id: 'ideal-neo-md-monoblock', name: 'IDEAL NEO MD MONOBLOCK', image: '/assets/ideal_ne_md_monoblock.jpg', material: 'PVC' },
  { id: 'ideal-neo-md-renovation', name: 'IDEAL NEO MD RENOVATION', image: '/assets/ideal_neo_md_renovation_profil.jpg', material: 'PVC' },
  { id: 'ideal-7000-nl', name: 'IDEAL 7000 NL', image: '/assets/ideal_7000_nl.jpg', material: 'PVC' }
];

for (const ip of idealProfiles) {
  const existing = catalog['Windows'].find(p => p.id === ip.id);
  if (!existing) {
    const specKey = ip.id.replace(/-/g, '').toLowerCase();
    const data = specs[specKey];
    if (data && data.technical) {
       ip.technical = {
          uwValue: parseFloat(data.technical.thermalTransmittance.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0.8,
          profileDepth: parseInt(data.technical.installationDepth) || 82,
          chambers: parseInt(data.technical.chambers) || undefined,
          gaskets: parseInt(data.technical.gaskets) || undefined,
          soundInsulation: data.technical.soundInsulation,
          profileClass: data.technical.profileClass,
          energyGrade: 'B', 
          description: data.description
       };
       if (ip.technical.uwValue <= 0.70) ip.technical.energyGrade = 'A+';
       else if (ip.technical.uwValue <= 0.80) ip.technical.energyGrade = 'A';
       else if (ip.technical.uwValue <= 0.90) ip.technical.energyGrade = 'B';
       else ip.technical.energyGrade = 'C';
    }
    catalog['Windows'].push(ip);
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('Successfully updated website_catalog.json');
