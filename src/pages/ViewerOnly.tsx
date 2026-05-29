import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Child1 } from '../components/configurator/Child1';
import { F100TViewer } from '../components/configurator/F100TViewer';
import { F101CViewer } from '../components/configurator/F101CViewer';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';

export const ViewerOnly: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typology = searchParams.get('typology') || 'F101B';
  const width = parseInt(searchParams.get('w') || '1000', 10);
  const height = parseInt(searchParams.get('h') || '1000', 10);
  
  // Hex Colors
  const colorExt = searchParams.get('cExt') ? decodeURIComponent(searchParams.get('cExt')!) : '#e8e0d4';
  const colorInt = searchParams.get('cInt') ? decodeURIComponent(searchParams.get('cInt')!) : '#f0ece6';
  const colorGsk = searchParams.get('cGsk') ? decodeURIComponent(searchParams.get('cGsk')!) : '#1c1c1c';
  const colorSpacer = searchParams.get('cSpc') ? decodeURIComponent(searchParams.get('cSpc')!) : '#b0b5b9';
  
  // Textures
  const colorExtTexture = searchParams.get('cExtTex') ? decodeURIComponent(searchParams.get('cExtTex')!) : undefined;
  const colorIntTexture = searchParams.get('cIntTex') ? decodeURIComponent(searchParams.get('cIntTex')!) : undefined;

  // Sender Name
  const senderName = searchParams.get('sender_name') ? decodeURIComponent(searchParams.get('sender_name')!) : null;

  // Determine profile image
  let profileImg = 'iglo5.png';
  if (typology.toLowerCase().includes('energy')) {
    profileImg = 'igloenergy.png';
  }

  return (
    <div 
      className="w-screen min-h-screen overflow-x-hidden overflow-y-auto relative flex flex-col light pb-24"
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
    >
      {senderName && (
        <div className="w-full bg-indigo-600 text-white text-center py-3 px-4 shadow-md z-50 text-sm font-bold tracking-wide">
          👋 {senderName} sent you this window they configured!
        </div>
      )}
      <div className="w-full h-[75vh] relative shrink-0 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        {typology === 'F100T' ? (
          <F100TViewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : typology === 'F101C' ? (
          <F101CViewer 
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : typology === 'F101B' ? (
          <Child1
            widthMm={width}
            heightMm={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : (
          <ThreejsWindowEngine
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            spacerColor={colorSpacer}
            typology={typology}
          />
        )}
      </div>

      {/* Technical Description - Moved Below 3D Viewer */}
      <div className="w-full max-w-4xl mx-auto py-12 px-6 shrink-0">
        <div 
          className="border border-gray-200 shadow-xl rounded-2xl p-8 font-sans"
          style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div 
              className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-4"
              style={{ backgroundColor: '#ffffff' }}
            >
              <img 
                src={`/assets/profiles/${profileImg}`}
                alt={`${typology} Profile Cross Section`} 
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black uppercase tracking-wider mb-1" style={{ color: '#0f172a' }}>{typology} Profile System</h2>
              <div className="text-sm font-medium mb-6 uppercase tracking-widest" style={{ color: '#64748b' }}>Drutex S.A. Technical Specification</div>
              
              <p className="text-base leading-relaxed mb-6" style={{ color: '#475569' }}>
                Advanced multi-chamber PVC profile system engineered for exceptional thermal insulation and structural stability. Features specialized internal reinforcement and state-of-the-art sealing technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 border-t border-gray-100 pt-6">
                <div className="flex-1 rounded-lg p-4 border border-slate-100" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="block text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Dimensions</span>
                  <span className="text-lg font-mono font-semibold" style={{ color: '#000000' }}>{width}mm × {height}mm</span>
                </div>
                <div className="flex-1 rounded-lg p-4 border border-slate-100" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="block text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Manufacturing Time</span>
                  <span className="inline-block px-3 py-1 rounded font-bold text-sm" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>5 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {typology === 'F101C' && (
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-wider" style={{ color: '#0f172a' }}>Iglo 5 Detailed Specs</h2>
            <div className="grid md:grid-cols-2 gap-8 text-base leading-relaxed" style={{ color: '#475569' }}>
              <div>
                <p className="mb-4">
                  The IGLO 5 system combines elegance, functionality, and advanced energy-saving solutions. Its timeless 5-chamber profile design makes it a versatile choice for both modern architecture and classic renovations, delivering solid thermal performance at an excellent value.
                </p>
                <p>
                  Engineered for exceptional thermal insulation and structural stability, this advanced multi-chamber PVC profile system features specialized internal reinforcement and state-of-the-art EPDM seals.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-200 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="font-bold mb-4 uppercase tracking-widest text-sm" style={{ color: '#0f172a' }}>Key Technical Data</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold" style={{ color: '#000000' }}>Profile Depth</span><span>70 mm</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold" style={{ color: '#000000' }}>Chambers</span><span>5-chamber system</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold" style={{ color: '#000000' }}>Glazing Options</span><span>Up to 40 mm</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold" style={{ color: '#000000' }}>Thermal Insulation (Uw)</span><span>from 0.89 W/(m²K)</span></li>
                  <li className="flex justify-between"><span className="font-bold" style={{ color: '#000000' }}>Seals</span><span>EPDM gaskets (Black or Grey)</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
