import { loadProfileGeometry, getProfilesBySystem } from '../src/data/profiles/index.js'; // Use .js extension for tsx resolution

async function runTest() {
  console.log('Testing Profile Registry...');
  
  const iglo5Profiles = getProfilesBySystem('IGLO_5');
  console.log(`Found ${iglo5Profiles.length} profiles for IGLO 5`);
  
  console.log('Attempting to load IG5_F100T...');
  try {
    const geometry = await loadProfileGeometry('IG5_F100T');
    console.log('Successfully loaded IG5_F100T geometry!');
    console.log(`- Meta System: ${geometry.meta?.system}`);
    console.log(`- Meta Type: ${geometry.meta?.type}`);
    console.log(`- Number of layers parsed: ${Object.keys(geometry.layers || {}).length}`);
    
    // Check if FRM_INT has one chain as we expect
    const frmInt = geometry.layers['FRM_INT'];
    console.log(`- FRM_INT contours: ${frmInt?.contours?.length}`);
  } catch (err) {
    console.error('Failed test:', err);
    process.exit(1);
  }
}

runTest();
