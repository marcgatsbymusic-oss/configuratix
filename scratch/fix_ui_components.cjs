const fs = require('fs');

// --- 1. ProductDetailData Updates ---
let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

pd = pd.replace(
  'features?: { title: string; description: string; image: string }[]',
  'features?: { title: string; description: string; image: string }[]\n  relatedProductLink?: { text: string; url: string }'
);
pd = pd.replace(
  'features?: { title: string; description: string; image: string }[]\r',
  'features?: { title: string; description: string; image: string }[]\r\n  relatedProductLink?: { text: string; url: string }\r'
);

// Fix Iglo Edge
pd = pd.replace(
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\n  standardEquipment: [",
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\n  relatedProductLink: { text: 'relatedIgloEdge', url: '/products/iglo-edge-slide' },\n  standardEquipment: ["
);
pd = pd.replace(
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\r\n  standardEquipment: [",
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\r\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\r\n  relatedProductLink: { text: 'relatedIgloEdge', url: '/products/iglo-edge-slide' },\r\n  standardEquipment: ["
);

// Fix Alucover
pd = pd.replace(
  "  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\n  disableHeroFilter: false,",
  "  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\n  relatedProductLink: { text: 'relatedAlucover', url: '/products/iglo-hs-alucover' },\n  disableHeroFilter: false,"
);
pd = pd.replace(
  "  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\r\n  disableHeroFilter: false,",
  "  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\r\n  relatedProductLink: { text: 'relatedAlucover', url: '/products/iglo-hs-alucover' },\r\n  disableHeroFilter: false,"
);

fs.writeFileSync('src/data/productDetails.ts', pd);

// --- 2. Update Locales ---
const enPath = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.productData['iglo-edge'] = en.productData['iglo-edge'] || {};
en.productData['iglo-edge'].relatedIgloEdge = "SEE IGLO EDGE SLIDE TERRACE SYSTEM";
en.productData['iglo-energy-alucover'] = en.productData['iglo-energy-alucover'] || {};
en.productData['iglo-energy-alucover'].relatedAlucover = "SEE IGLO-HS ALUCOVER TERRACE SYSTEM";
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const esPath = 'src/locales/es.json';
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
es.productData['iglo-edge'] = es.productData['iglo-edge'] || {};
es.productData['iglo-edge'].relatedIgloEdge = "VER SISTEMA DE TERRAZA IGLO EDGE SLIDE";
es.productData['iglo-energy-alucover'] = es.productData['iglo-energy-alucover'] || {};
es.productData['iglo-energy-alucover'].relatedAlucover = "VER SISTEMA DE TERRAZA IGLO-HS ALUCOVER";
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));


// --- 3. Update ProductDetailPage.tsx ---
let tsx = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');
const buttonHtml = `
              {detailData.relatedProductLink && (
                <Link 
                  to={detailData.relatedProductLink.url}
                  className="inline-block bg-mammut-gold text-black text-xs font-bold uppercase tracking-widest px-6 py-3 mt-6 mb-8 hover:bg-[#F3C47F] transition-colors"
                >
                  {t(\`productData.\${detailData.slug}.\${detailData.relatedProductLink.text}\`)}
                </Link>
              )}
`;

// Insert after the ul of standardEquipment, before Video CTA
tsx = tsx.replace(
  "              </ul>\n              {/* Video CTA */}",
  "              </ul>\n" + buttonHtml + "\n              {/* Video CTA */}"
);
tsx = tsx.replace(
  "              </ul>\r\n              {/* Video CTA */}",
  "              </ul>\r\n" + buttonHtml + "\r\n              {/* Video CTA */}"
);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', tsx);
console.log('Fixed related product links and Iglo Edge video');
