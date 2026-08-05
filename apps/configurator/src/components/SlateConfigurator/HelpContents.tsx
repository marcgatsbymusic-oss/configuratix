import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface HelpProps {
  onClose: () => void;
}

export const MaterialHelp: React.FC<HelpProps> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 bg-slate-50 border border-slate-200 shadow-xl rounded-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 w-full relative">
      <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 bg-white">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Material</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold uppercase transition-colors">
          {t('help.close', 'Cerrar')} <X size={14} />
        </button>
      </div>
      <div className="p-6">
        <h3 className="text-slate-900 font-black text-xl lg:text-2xl mb-8 tracking-tight">{t('help.comp.title', 'Summary Comparison Table (2026 Context)')}</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 pr-4 border-b border-slate-200 font-medium text-slate-400">{t('help.comp.feature', 'Feature')}</th>
                <th className="py-4 px-4 border-b border-slate-200 text-slate-800 font-bold w-1/3">{t('help.comp.pvc', 'PVC (uPVC)')}</th>
                <th className="py-4 px-4 border-b border-slate-200 text-slate-800 font-bold w-1/3">{t('help.comp.aluminum', 'Aluminum')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm md:text-[15px]">
              <tr>
                <td className="py-6 pr-4 border-b border-slate-200 font-bold align-top">{t('help.comp.bestFor', 'Best For')}</td>
                <td className="py-6 px-4 border-b border-slate-200 leading-relaxed align-top">{t('help.comp.bestForPvc', 'Budget, standard sizes, maximum thermal efficiency at low cost.')}</td>
                <td className="py-6 px-4 border-b border-slate-200 leading-relaxed align-top">{t('help.comp.bestForAlu', 'Large glass areas, modern aesthetics, longevity, and strength.')}</td>
              </tr>
              <tr>
                <td className="py-6 pr-4 border-b border-slate-200 font-bold align-top">{t('help.comp.lifespan', 'Lifespan')}</td>
                <td className="py-6 px-4 border-b border-slate-200 align-top">{t('help.comp.lifespanPvc', '20–30 Years')}</td>
                <td className="py-6 px-4 border-b border-slate-200 align-top">{t('help.comp.lifespanAlu', '45+ Years')}</td>
              </tr>
              <tr>
                <td className="py-6 pr-4 border-b border-slate-200 font-bold align-top">{t('help.comp.cost', 'Cost')}</td>
                <td className="py-6 px-4 border-b border-slate-200 align-top">{t('help.comp.costPvc', 'Generally 30%–50% cheaper.')}</td>
                <td className="py-6 px-4 border-b border-slate-200 align-top">{t('help.comp.costAlu', 'Premium price point.')}</td>
              </tr>
              <tr>
                <td className="py-6 pr-4 font-bold align-top">{t('help.comp.aesthetics', 'Aesthetics')}</td>
                <td className="py-6 px-4 align-top">{t('help.comp.aestheticsPvc', 'Bulkier frames.')}</td>
                <td className="py-6 px-4 align-top">{t('help.comp.aestheticsAlu', 'Slim profiles (more natural light).')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const WindowTypeHelp: React.FC<HelpProps> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 bg-slate-50 border border-slate-200 shadow-xl rounded-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 w-full relative">
       <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 bg-white">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Tipo de Ventana</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold uppercase transition-colors">
          {t('help.close', 'Cerrar')} <X size={14} />
        </button>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-8 font-medium text-sm leading-relaxed">
          {t('help.windowTypeDesc', 'Nuestras ventanas tienen diferentes opciones de apertura. Hay ventanas de una, dos y tres hojas con travesaños superiores o inferiores.')}
        </p>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
            <div className="w-16 h-24 border-2 border-slate-300 bg-slate-100 rounded flex items-center justify-center shadow-inner relative overflow-hidden">
               <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
            </div>
            <span className="text-slate-700 font-bold tracking-wide uppercase text-[10px] leading-relaxed">{t('help.singleLeaf', 'Ventanas de una hoja')}</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
            <div className="w-24 h-24 border-2 border-slate-300 bg-slate-100 rounded flex shadow-inner relative overflow-hidden">
               <div className="flex-1 border-r-2 border-slate-300 flex items-center justify-center">
                   <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               </div>
               <div className="flex-1 flex items-center justify-center">
                   <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               </div>
            </div>
            <span className="text-slate-700 font-bold tracking-wide uppercase text-[10px] leading-relaxed">{t('help.doubleLeaf', 'Ventanas de dos hojas')}</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
            <div className="w-full h-24 border-2 border-slate-300 bg-slate-100 rounded flex shadow-inner relative overflow-hidden">
               <div className="flex-1 flex items-center justify-center border-r-2 border-slate-300">
                   <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               </div>
               <div className="flex-1 flex items-center justify-center border-r-2 border-slate-300">
                   <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               </div>
               <div className="flex-1 flex items-center justify-center">
                   <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               </div>
            </div>
            <span className="text-slate-700 font-bold tracking-wide uppercase text-[10px] leading-relaxed">{t('help.tripleLeaf', 'Ventanas de tres hojas')}</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
            <div className="w-24 h-24 border-2 border-slate-300 bg-slate-100 rounded-t-full rounded-b flex items-end pb-4 justify-center gap-6 shadow-inner relative overflow-hidden">
               <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               <span className="text-mammut-gold font-black text-3xl -mt-2">*</span>
               <div className="absolute top-0 w-full h-1/2 border-b-2 border-slate-300"></div>
            </div>
            <span className="text-slate-700 font-bold tracking-wide uppercase text-[10px] leading-relaxed">{t('help.specialWindows', 'Tipos de ventanas especiales')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
