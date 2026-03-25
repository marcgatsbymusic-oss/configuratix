import fs from 'fs';
let code = fs.readFileSync('./src/components/SlateConfigurator/MainConfigurator.tsx', 'utf-8');

if (!code.includes('useTranslation')) {
  code = code.replace("import { useRef, useState } from 'react';", "import { useRef, useState } from 'react';\nimport { useTranslation } from 'react-i18next';");
  code = code.replace("export function MainConfigurator() {", "export function MainConfigurator() {\n  const { t } = useTranslation();");
}

const replacers = [
  ["Design your custom window system.", "{t('configurator.title')}"],
  ["Pick the material and configure your exact architectural specifications below.", "{t('configurator.subtitle')}"],
  [">Material Profile</h2>", ">{t('configurator.steps.material')}</h2>"],
  [">System Profile</h2>", ">{t('configurator.steps.system')}</h2>"],
  [">Window Type</h2>", ">{t('configurator.steps.windowType')}</h2>"],
  [">Opening Type</h2>", ">{t('configurator.steps.openingType')}</h2>"],
  [">Color & Decor</h2>", ">{t('configurator.steps.color')}</h2>"],
  [">Dimensions (mm)</h2>", ">{t('configurator.steps.dimensions')}</h2>"],
  [">Glazing Package</h2>", ">{t('configurator.steps.glazing')}</h2>"],
  [">Accessories & Add-ons</h2>", ">{t('configurator.steps.options')}</h2>"],
  ["Continue to Color & Decor", "{t('configurator.steps.color')}"],
  ["Continue to Glazing", "{t('configurator.steps.glazing')}"],
  
  // Right Sidebar
  [">Specs Overview</h3>", ">{t('configurator.summary.title')}</h3>"],
  [">Dimensions</span>", ">{t('configurator.summary.dimensions')}</span>"],
  [">Material Profile</span>", ">{t('configurator.summary.material')}</span>"],
  [">System Profile</span>", ">{t('configurator.summary.system')}</span>"],
  [">Window Type</span>", ">{t('configurator.summary.windowType')}</span>"],
  [">Color & Decor</span>", ">{t('configurator.summary.color')}</span>"],
  [">Glazing</span>", ">{t('configurator.summary.glazing')}</span>"],
  [">Financials</h3>", ">{t('configurator.summary.financials')}</h3>"],
  [">Base Framework</span>", ">{t('configurator.summary.baseFramework')}</span>"],
  [">Hardware Assembly</span>", ">{t('configurator.summary.hardwareAssembly')}</span>"],
  [">Accessories</span>", ">{t('configurator.summary.accessories')}</span>"],
  [">Total System</div>", ">{t('configurator.summary.totalSystem')}</div>"],
  ["> JSON\n", "> {t('configurator.summary.exportJson')}\n"],
  ["Save to Cart {items.length > 0 && `(${items.length})`}", "{t('configurator.summary.saveToCart')} {items.length > 0 && `(${items.length})`}"],
  [">Edit Node</button>", ">{t('configurator.summary.edit')}</button>"],

  // Dimensions
  ["> Width\n", "> {t('configurator.inputs.w')}\n"],
  ["> Height\n", "> {t('configurator.inputs.h')}\n"],
  [">mm</span>", ">{t('configurator.inputs.mm')}</span>"],
  // Sashes dynamic text
  ["{state.sashOpenings.length} Sashes Configured", "{t('configurator.state.sashes', { count: state.sashOpenings.length })}"],
  ["Sash Position {sashIndex + 1}", "Sash {sashIndex + 1}"]
];

replacers.forEach(([s, r]) => {
  code = code.split(s).join(r);
});

// For cm, replacing ` cm)` with ` {t('configurator.inputs.cm')}`
code = code.replace(/ cm\)/g, " {t('configurator.inputs.cm')}");

fs.writeFileSync('./src/components/SlateConfigurator/MainConfigurator.tsx', code);
console.log('MainConfigurator localization injection complete.');
