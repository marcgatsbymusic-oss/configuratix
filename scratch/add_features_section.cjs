const fs = require('fs');

// 1. Update ProductDetailData Interface & Add Feature
let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

pd = pd.replace(
  'outdoorWindowPhoto?: string\n  inlineVideoSrc?: string',
  'outdoorWindowPhoto?: string\n  inlineVideoSrc?: string\n  features?: { title: string; description: string; image: string }[]'
);
pd = pd.replace(
  'outdoorWindowPhoto?: string\r\n  inlineVideoSrc?: string',
  'outdoorWindowPhoto?: string\r\n  inlineVideoSrc?: string\r\n  features?: { title: string; description: string; image: string }[]'
);

const featureToAdd = `
  features: [
    {
      title: 'aluCoverTitle',
      description: 'aluCoverDesc',
      image: '/assets/features/alu-cover-feature.jpg'
    }
  ],`;

pd = pd.replace(
  "  disableHeroFilter: false,",
  "  disableHeroFilter: false," + featureToAdd
);

fs.writeFileSync('src/data/productDetails.ts', pd);

// 2. Update Locales
const enPath = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.productData['iglo-energy-alucover'] = en.productData['iglo-energy-alucover'] || {};
en.productData['iglo-energy-alucover'].aluCoverTitle = "ALUMINIUM COVER";
en.productData['iglo-energy-alucover'].aluCoverDesc = "Crafted with precision, the aluminium overlay not only enhances the window's resistance against external elements but also optimizes its structural integrity, ensuring a lasting and reliable solution.";
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const esPath = 'src/locales/es.json';
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
es.productData['iglo-energy-alucover'] = es.productData['iglo-energy-alucover'] || {};
es.productData['iglo-energy-alucover'].aluCoverTitle = "CUBIERTA DE ALUMINIO";
es.productData['iglo-energy-alucover'].aluCoverDesc = "Elaborado con precisión, el revestimiento de aluminio no solo mejora la resistencia de la ventana contra los elementos externos, sino que también optimiza su integridad estructural, garantizando una solución duradera y fiable.";
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));

// 3. Update ProductDetailPage.tsx
let tsx = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

const featuresSection = `
      {/* Dynamic Features Section */}
      {detailData.features && detailData.features.length > 0 && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-7xl space-y-24">
            {detailData.features.map((feature, idx) => (
              <div key={idx} className={\`flex flex-col lg:flex-row items-center gap-12 \${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}\`}>
                <div className="lg:w-1/2 flex justify-center">
                  <img src={feature.image} alt={t(\`productData.\${detailData.slug}.\${feature.title}\`)} className="max-w-full h-auto drop-shadow-xl" />
                </div>
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl font-black uppercase tracking-widest text-black">
                    {t(\`productData.\${detailData.slug}.\${feature.title}\`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {t(\`productData.\${detailData.slug}.\${feature.description}\`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
`;

tsx = tsx.replace(
  '{/* 3. Interactive Color Swatch Section */}',
  featuresSection + '\n      {/* 3. Interactive Color Swatch Section */}'
);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', tsx);
console.log('Finished updating feature section');
