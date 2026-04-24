import fs from 'fs';
import { execSync } from 'child_process';

async function queryCantor(query) {
  const q = query.replace(/"/g, '\\"');
  try {
    const output = execSync(`node .agents/skills/cantor-access/scripts/queryCantor.mjs "${q}"`, { encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (e) {
    console.error("Query failed:", q);
    return [];
  }
}

async function extract() {
  console.log("Extracting Shutter Options from Cantor DB...");
  
  // Base configuration structure
  const config = {
    rollerBlindTypes: [
      { value: 'RNV', label: 'RNV (Standard)' },
      { value: 'RA', label: 'RA (Exterior)' },
      { value: 'RS', label: 'RS (Facade)' },
      { value: 'RSZ', label: 'RSZ' },
      { value: 'RAOW', label: 'RAOW' },
      { value: 'RA90', label: 'RA90' }
    ],
    windowScreens: [
      { value: '', label: 'Lack (-)' },
      { value: 'MOSK', label: 'Mosquito Net (MKT)' }
    ],
    windowScreenLocations: [
      { value: 'IN', label: 'Inside' },
      { value: 'OUT', label: 'Outside' }
    ],
    curtainTypes: [
      { value: '', label: 'Lack (-)' },
      { value: 'ALU37', label: 'ALU 37mm' },
      { value: 'ALU42', label: 'ALU 42mm' },
      { value: 'ALU55', label: 'ALU 55mm' }
    ],
    finsPerforations: [
      { value: 'PERF', label: 'Perforated' },
      { value: 'NOPERF', label: 'Non-Perforated' }
    ],
    driveTypes: [
      { value: '', label: 'Lack (-)' }
    ],
    controlSides: [
      { value: 'L', label: 'Left' },
      { value: 'R', label: 'Right' }
    ],
    doorChecks: [
      { value: 'STD', label: 'Standard' }
    ],
    boxTypes: [
      { value: 'SP', label: 'Standard Profile (SP)' },
      { value: 'SK', label: 'Square (SK)' }
    ],
    plasterCarriers: [
      { value: 'YES', label: 'Yes' },
      { value: 'NO', label: 'No' }
    ],
    reviews: [
      { value: 'BOT', label: 'From Bottom' },
      { value: 'IN', label: 'From Inside' }
    ],
    guideRailsCuttings: [
      { value: 'STD', label: 'Standard' },
      { value: 'CUST', label: 'Custom' }
    ],
    guideRailsTypes: [
      { value: 'PVC', label: 'PVC' },
      { value: 'ALU', label: 'Aluminum' }
    ]
  };

  // 1. Extract dynamic Matrix Classes for Drive Types (TYP_NAPEDU) from ROL_DOD
  const driveTypes = await queryCantor("SELECT DISTINCT KLASSE2 FROM PREISMAT WHERE PREISMATRIX = 'ROL_DOD' AND KLASSE1 = 'TYP_NAPEDU' AND KLASSE2 != ''");
  if (driveTypes.length > 0) {
    config.driveTypes = [
      { value: '', label: 'Lack (-)' },
      ...driveTypes.map(d => ({ value: d.KLASSE2, label: `Drive: ${d.KLASSE2}` }))
    ];
  } else {
    // Fallback if matrix is empty
    for (let i = 1; i <= 9; i++) {
      config.driveTypes.push({ value: `T0${i}`, label: `Type: 0${i}` });
    }
  }

  // Write the output to data file
  const outPath = 'src/data/shutter_lookups.json';
  fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
  console.log(`Saved dynamic configuration to ${outPath}`);
}

extract();
