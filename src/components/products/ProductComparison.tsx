import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProductComparisonProps {
  comparisonData: {
    [productName: string]: {
      [specName: string]: string;
    };
  };
}

export function ProductComparison({ comparisonData }: ProductComparisonProps) {
  const { t } = useTranslation();
  
  if (!comparisonData || Object.keys(comparisonData).length === 0) return null;

  const productNames = Object.keys(comparisonData);
  const specNames = Object.keys(comparisonData[productNames[0]]);

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl font-black uppercase mb-8 text-black tracking-widest text-center">
          {t('productDetail.compareProducts')}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-mammut-gold">
                <th className="py-4 px-6 text-mammut-gold font-bold uppercase tracking-widest bg-[#111] text-sm">
                  {t('productDetail.technicalData')}
                </th>
                {productNames.map((productName) => (
                  <th key={productName} className="py-4 px-6 text-black font-bold uppercase tracking-widest bg-gray-50 text-sm border-l border-gray-200">
                    {productName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specNames.map((specName, index) => (
                <tr key={specName} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-4 px-6 text-black font-semibold text-sm">
                    {t(`productDetail.specs.${specName}`, { defaultValue: specName })}
                  </td>
                  {productNames.map((productName) => (
                    <td key={productName} className="py-4 px-6 text-gray-600 text-sm border-l border-gray-100 whitespace-pre-wrap">
                      {comparisonData[productName][specName]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
