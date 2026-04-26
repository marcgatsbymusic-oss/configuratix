const fs = require('fs');

let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// Fix the image swap
pd = pd.replace(
  "  profileImage: '/assets/products/iglo_energy_alucover_pr.png',\n  blueprintImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',",
  "  profileImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',\n  blueprintImage: '/assets/products/iglo_energy_alucover_pr.png',"
);
pd = pd.replace(
  "  profileImage: '/assets/products/iglo_energy_alucover_pr.png',\r\n  blueprintImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',",
  "  profileImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',\r\n  blueprintImage: '/assets/products/iglo_energy_alucover_pr.png',"
);

// Eliminate See Video button by clearing modalVideoSrc for Alucover
pd = pd.replace(
  "  modalVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\n  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',",
  "  modalVideoSrc: '',\n  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',"
);
pd = pd.replace(
  "  modalVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\r\n  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',",
  "  modalVideoSrc: '',\r\n  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',"
);


fs.writeFileSync('src/data/productDetails.ts', pd);
console.log('Fixed Alucover image order and removed See Video button');
