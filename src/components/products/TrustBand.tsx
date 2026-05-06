import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Leaf, Clock } from 'lucide-react';

interface Benefit {
  label: string;
  text: string;
  icon?: string;
}

interface TrustBandProps {
  benefits: Benefit[];
}

export function TrustBand({ benefits }: TrustBandProps) {
  const { t } = useTranslation();

  if (!benefits || benefits.length === 0) return null;

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'shield':
        return <Shield className="w-8 h-8 text-mammut-gold mb-4" strokeWidth={1.5} />;
      case 'leaf':
        return <Leaf className="w-8 h-8 text-mammut-gold mb-4" strokeWidth={1.5} />;
      case 'clock':
        return <Clock className="w-8 h-8 text-mammut-gold mb-4" strokeWidth={1.5} />;
      default:
        return <Shield className="w-8 h-8 text-mammut-gold mb-4" strokeWidth={1.5} />;
    }
  };

  return (
    <section className="w-full bg-[#111112] py-16 border-t border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {renderIcon(benefit.icon)}
              <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">
                {t(`trustBand.${benefit.label}`, { defaultValue: benefit.label })}
              </h3>
              <p className="text-mammut-white/60 text-sm leading-relaxed max-w-xs">
                {t(`trustBand.${benefit.text}`, { defaultValue: benefit.text })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
