import fs from 'fs';

const tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');
const newColors = fs.readFileSync('scratch/iglo_door_colors.ts', 'utf8');

// Find the definition of IGLO_EDGE_COLORS
const insertionPoint = tsFile.indexOf('export const IGLO_EDGE_COLORS: SwatchColor[] = [');

let updatedTsFile = tsFile.slice(0, insertionPoint) + newColors + '\n' + tsFile.slice(insertionPoint);

// Replace IGLO_EDGE_COLORS with IGLO_DOOR_COLORS inside IGLO5_DOORS_DETAIL
const iglo5Idx = updatedTsFile.indexOf('export const IGLO5_DOORS_DETAIL: ProductDetailData = {');
const endIglo5Idx = updatedTsFile.indexOf('export const IGLO_ENERGY_DOORS_PVC_DETAIL: ProductDetailData = {');

let iglo5Block = updatedTsFile.slice(iglo5Idx, endIglo5Idx);
iglo5Block = iglo5Block.replace('colors: IGLO_EDGE_COLORS,', 'colors: IGLO_DOOR_COLORS,');

// Replace inside IGLO_ENERGY_DOORS_PVC_DETAIL
const igloEnergyIdx = endIglo5Idx;
const endIgloEnergyIdx = updatedTsFile.indexOf('export const IGLO_ENERGY_ALUCOVER_DETAIL: ProductDetailData = {', igloEnergyIdx);

let igloEnergyBlock = updatedTsFile.slice(igloEnergyIdx, endIgloEnergyIdx);
igloEnergyBlock = igloEnergyBlock.replace('colors: IGLO_EDGE_COLORS,', 'colors: IGLO_DOOR_COLORS,');

updatedTsFile = updatedTsFile.slice(0, iglo5Idx) + iglo5Block + igloEnergyBlock + updatedTsFile.slice(endIgloEnergyIdx);

fs.writeFileSync('src/data/productDetails.ts', updatedTsFile);
console.log("Injected IGLO_DOOR_COLORS into productDetails.ts safely!");
