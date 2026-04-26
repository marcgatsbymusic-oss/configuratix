import fs from 'fs';

let content = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const target = `export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {
  id: 'p1_slide',
  slug: 'iglo-edge-slide',
  name: 'IGLO EDGE SLIDE',
  tagline: 'Technology That Impresses',
  description: 'Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0,65 W/(m2K)* and a modern, angular profile shape.',
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',`;

const replacement = `export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {
  id: 'p1_slide',
  slug: 'iglo-edge-slide',
  name: 'IGLO EDGE SLIDE',
  tagline: 'Technology That Impresses',
  description: 'Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0,65 W/(m2K)* and a modern, angular profile shape.',
  heroImage: '/assets/iglo-edge-slide-hero.mp4',
  windowPhoto: '/assets/iglo-edge-slide-profile.png',
  profileImage: '/assets/iglo-edge-slide-profile.png',
  blueprintImage: '/assets/iglo-edge-slide-cross-section.png',
  videoSrc: '/assets/iglo-edge-slide-hero.mp4',
  modalVideoSrc: '/assets/iglo-edge-slide-product.mp4',`;

content = content.replace(target, replacement);
fs.writeFileSync('src/data/productDetails.ts', content);
console.log("Replaced successfully!");
