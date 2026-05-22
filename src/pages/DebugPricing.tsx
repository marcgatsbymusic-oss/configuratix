import { useEffect, useState } from 'react';
import { fetchPrice, type PricingApiResponse } from '../utils/cantorPricing/pricingApi';
import type { ConfiguratorInput } from '../utils/cantorPricing/input';
import { CONFIG_SCHEMA, WINDOW_TYPES, PROFILE_GLAZING_LIMITS, getTypologyImagePath } from '../components/SlateConfigurator/types';
import { IGLO_EDGE_COLORS } from '../data/productDetails';
import { WindowVisualizer } from '../components/SlateConfigurator/WindowVisualizer';
import { SvgWindowEngine } from '../components/configurator/SvgWindowEngine';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';
import { ScrollWheel } from '../components/SlateConfigurator/ScrollWheel';
import { ArViewer } from '../components/configurator/ArViewer';
import glazingOptions from '../data/cantor_glazing_options.json';
import shutterLookups from '../data/shutter_lookups.json';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { 
  IconWindows, IconDoors, IconPatioDoors, IconRollerShutters, 
  IconExteriorBlinds, IconGarageDoors, IconMosquitoNets, 
  IconSmartHome, IconConservatories, IconPergola 
} from '../components/icons/ProductIcons';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';

const getPaneImage = (paneCode: string) => {
  if (!paneCode) return null;
  const code = paneCode.toUpperCase();
  
  if (code.includes('M8.2') || code.includes('MB2') || code.includes('MAT')) return 'segura-332-mat.webp';
  if (code.includes('B1') || code.includes('B2') || code.includes('33.1') || code.includes('33.2') || code.includes('44.1') || code.includes('44.2') || code.includes('44.4')) return 'segura-331.webp';
  if (code.includes('ADB')) return 'antisol-blue-6.webp';
  if (code.includes('AB4')) return 'antisol-brown-4.webp';
  if (code.includes('AB6') || code.includes('ANB') || code.includes('RB6') || code.includes('RFB')) return 'antisol-brown-6.webp';
  if (code.includes('AZ4') || code.includes('ANZ')) return 'antisol-green-4.webp';
  if (code.includes('AZ6')) return 'antisol-green-6.webp';
  if (code.includes('AS6') || code.includes('ANS')) return 'antisol-grey-6.webp';
  if (code.includes('OCH')) return 'chinchilla-4.webp';
  if (code.includes('OCA')) return 'ornamento-cathedral.webp';
  if (code.includes('ODT')) return 'ornamento-delta.webp';
  if (code.includes('OMC')) return 'ornamento-master.webp';
  if (code.includes('OSI')) return 'ornamento-silvit.webp';
  if (code.includes('OPR')) return 'waterfall-105.webp';
  if (code.includes('RFN') || code.includes('RN6')) return 'stopsol-blue-6.webp';
  if (code.includes('MS4')) return 'mirastar.webp';
  if (code.includes('FL6') || code.includes('SR') || code.includes('H02') || code.includes('T6')) return 'float-6.webp';
  
  return 'float-4.webp'; // fallback for FL, T, etc.
};

interface TypologyThumbnailProps {
  id: string;
  className?: string;
}

function TypologyThumbnail({ id, className }: TypologyThumbnailProps) {
  const [src, setSrc] = useState(() => getTypologyImagePath(id));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setSrc(getTypologyImagePath(id));
    setHasError(false);
  }, [id]);

  const handleError = () => {
    if (!src.endsWith('.svg?v=2')) {
      setSrc(`/assets/windowtypes/${id}.svg?v=2`);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 text-gray-400 font-bold text-[10px] border border-gray-600 shadow-inner`}>
        {id}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={id}
      className={className}
      onError={handleError}
    />
  );
}

// Mobile-friendly custom components
const AccordionSection = ({ 
  id, 
  title, 
  summary, 
  isOpen, 
  onToggle, 
  children 
}: { 
  id: string, 
  title: string, 
  summary: string, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode 
}) => {
  return (
    <div id={id} className="border border-gray-800 rounded-xl overflow-hidden mb-4 bg-mammut-darker/60 backdrop-blur-sm transition-all duration-300">
      <div 
        onClick={onToggle}
        className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${isOpen ? 'bg-mammut-gold/10 text-mammut-gold border-l-4 border-mammut-gold' : 'hover:bg-gray-800/40 text-gray-300 border-l-4 border-transparent'}`}
      >
        <div className="flex flex-col gap-1 pr-4 min-w-0">
          <span className="font-bold text-sm tracking-wide uppercase">{title}</span>
          {!isOpen && summary && (
            <span className="text-xs text-gray-500 truncate">{summary}</span>
          )}
        </div>
        <span className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-mammut-gold' : 'text-gray-500'}`}>
          ▼
        </span>
      </div>
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-gray-800 bg-mammut-darker/30 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
};

const TouchStepper = ({
  label,
  value,
  onChange,
  min = 500,
  max = 3000,
  step = 10
}: {
  label: string,
  value: number,
  onChange: (v: number) => void,
  min?: number,
  max?: number,
  step?: number
}) => {
  const handleIncrement = () => {
    if (value + step <= max) onChange(value + step);
  };
  const handleDecrement = () => {
    if (value - step >= min) onChange(value - step);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="flex items-center bg-mammut-black border border-gray-800 rounded-xl overflow-hidden h-[54px] shadow-inner relative group focus-within:border-mammut-gold transition-colors">
        <button 
          type="button"
          onClick={handleDecrement}
          className="w-14 h-full flex items-center justify-center bg-gray-900/60 hover:bg-mammut-gold/20 hover:text-mammut-gold active:scale-95 text-gray-400 font-bold transition-all border-r border-gray-850 text-xl select-none touch-manipulation"
        >
          −
        </button>
        <input 
          type="number" 
          className="flex-1 bg-transparent text-mammut-white focus:outline-none text-base font-black text-center w-full min-w-0 font-mono"
          value={value} 
          onChange={e => {
            const val = Number(e.target.value);
            if (!isNaN(val)) onChange(val);
          }} 
        />
        <button 
          type="button"
          onClick={handleIncrement}
          className="w-14 h-full flex items-center justify-center bg-gray-900/60 hover:bg-mammut-gold/20 hover:text-mammut-gold active:scale-95 text-gray-400 font-bold transition-all border-l border-gray-850 text-xl select-none touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  );
};

const SegmentedControl = ({
  label,
  value,
  onChange,
  options,
  gridCols = 'grid-cols-2'
}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  options: { value: string, label: string }[],
  gridCols?: string
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className={`grid ${gridCols} bg-mammut-black border border-gray-850 rounded-xl p-1 gap-1`}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all text-center leading-tight ${
                isActive 
                  ? 'bg-mammut-gold text-black shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CarouselOption {
  code: string;
  name: string;
  image?: string;
  hex?: string;
}

const CarouselSelector = <T extends CarouselOption>({
  label,
  value,
  onChange,
  options,
  getImagePath
}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  options: T[],
  getImagePath?: (opt: T) => string
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="flex gap-3 overflow-x-auto pb-8 pt-8 -my-6 scrollbar-none snap-x snap-mandatory">
        {options.map((opt) => {
          const isActive = value === opt.code;
          const imageSrc = getImagePath ? getImagePath(opt) : opt.image;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onChange(opt.code)}
              className={`flex-none w-28 h-28 bg-gray-900 border rounded-xl p-2 flex flex-col items-center justify-between transition-all select-none snap-start relative group hover:z-30 ${
                isActive 
                  ? 'border-mammut-gold bg-mammut-gold/5 shadow-lg scale-[1.02]' 
                  : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/30'
              }`}
            >
              {/* Selection badge */}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 bg-mammut-gold text-black rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black z-10">
                  ✓
                </div>
              )}
              
              {/* Visual Image / Hex Swatch */}
              {imageSrc ? (
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 group-hover:scale-[1.8] group-hover:z-30 shadow-md transition-transform duration-300 relative">
                  <img 
                    src={imageSrc} 
                    alt={opt.name} 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => { 
                      const target = e.currentTarget;
                      target.style.display = 'none'; 
                      const sibling = target.nextElementSibling as HTMLElement;
                      if (sibling) sibling.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gray-850 flex items-center justify-center text-[10px] font-bold text-gray-500 rounded-lg">
                    {opt.code}
                  </div>
                </div>
              ) : opt.hex ? (
                <div className="w-16 h-16 rounded-lg shadow-inner border border-gray-700 transition-transform duration-300 group-hover:scale-[1.8] group-hover:z-30 shadow-md relative" style={{ backgroundColor: opt.hex }}></div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-850 flex items-center justify-center text-[10px] font-bold text-gray-500 transition-transform duration-300 group-hover:scale-[1.8] group-hover:z-30 shadow-md relative">
                  {opt.code || 'Std'}
                </div>
              )}
              
              <span className={`text-[10px] font-bold truncate w-full text-center leading-none ${isActive ? 'text-mammut-gold' : 'text-gray-400'}`}>
                {opt.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function DebugPricing() {
  const { t } = useTranslation();

  // Mobile-friendly layout and interactive states
  const [activeAccordion, setActiveAccordion] = useState<string | null>('product');
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1) & 2) Profile System & Typology
  const [typology, setTypology] = useState<string>('F104');
  const [isTypologyOpen, setIsTypologyOpen] = useState(false);
  const [opening] = useState<string>('UR');
  const [profilsatz, setProfilsatz] = useState('1100'); // Maps to IG5
  const [activeCategory, setActiveCategory] = useState<string>('WINDOWS');
  const [is3dMode, setIs3dMode] = useState(true);
  const [arPlacement, setArPlacement] = useState<'wall' | 'floor' | null>(null);

  // 3) Dimensions
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  // 4) Glazing Options
  const [infills, setInfills] = useState([
    { code: '2-24', pane1: 'T4', pane2: '', pane3: 'FL4', frameStyle: 'S', width: '', height: '' },
    { code: '2-24', pane1: 'T4', pane2: '', pane3: 'FL4', frameStyle: 'S', width: '', height: '' }
  ]);

  // 5) Joinery colors
  const [colorType, setColorType] = useState('W-W');
  const [colorCode, setColorCode] = useState('0197'); // 0197 = White
  const [interiorColorCode, setInteriorColorCode] = useState('0197');
  const [overwriteCoreColor, setOverwriteCoreColor] = useState(false);
  const [coreColor, setCoreColor] = useState('');

  // 6) Window options
  const [windowUnit] = useState('');
  const [safetyClass, setSafetyClass] = useState('');
  const [model, setModel] = useState('');
  const [hardwareSystem, setHardwareSystem] = useState('');
  const [handleType, setHandleType] = useState('-');
  const [handleColor, setHandleColor] = useState('');
  const [coverColor, setCoverColor] = useState('');

  // 7) Profile options
  const [frameProfile, setFrameProfile] = useState('50001');
  const [weld, setWeld] = useState('standard');
  const [glazingBeadStyle, setGlazingBeadStyle] = useState('Z');
  const [frameReinforcement, setFrameReinforcement] = useState('standard');

  // 8) Seals
  const [sealColor, setSealColor] = useState('');

  // Default gasket color to black ('czarny') for F100 & F104 if not already selected
  useEffect(() => {
    if ((typology === 'F100' || typology === 'F104') && !sealColor) {
      setSealColor('czarny');
    }
  }, [typology]);

  // 9) Shutter options
  const [includeShutter, setIncludeShutter] = useState(false);
  const [rollerBlindType, setRollerBlindType] = useState('');
  const [windowScreen, setWindowScreen] = useState('');
  const [windowScreenLocation, setWindowScreenLocation] = useState('');

  // 10) Pancerz
  const [curtainType, setCurtainType] = useState('');
  const [finsPerforation, setFinsPerforation] = useState('');
  const [curtainColor, setCurtainColor] = useState('');
  const [bottomSlatColor, setBottomSlatColor] = useState('');
  const [windowScreenBottomSlatColor, setWindowScreenBottomSlatColor] = useState('');

  // 11) Service - Field I
  const [driveType, setDriveType] = useState('');
  const [controlSide, setControlSide] = useState('');

  // 12) Service
  const [doorChecksTypeI, setDoorChecksTypeI] = useState('');
  const [imposeArbour, setImposeArbour] = useState(false);

  // 13) Box
  const [boxType, setBoxType] = useState('');
  const [outerBoxColor, setOuterBoxColor] = useState('');
  const [otherBoxColor, setOtherBoxColor] = useState('');
  const [plasterCarrier, setPlasterCarrier] = useState('');
  const [flushMountedSlatIn, setFlushMountedSlatIn] = useState(false);
  const [flushMountedSlatColorIn, setFlushMountedSlatColorIn] = useState('');
  const [flushMountedSlatOut, setFlushMountedSlatOut] = useState(false);
  const [flushMountedSlatColorOut, setFlushMountedSlatColorOut] = useState('');
  const [review, setReview] = useState('');
  const [sideCoverCapColor, setSideCoverCapColor] = useState('');

  // 14) Guide rails
  const [guideRailsColor, setGuideRailsColor] = useState('');
  const [guideRailsCutting, setGuideRailsCutting] = useState('');
  const [extremeLeftGuideRail, setExtremeLeftGuideRail] = useState('');
  const [extremeRightGuideRail, setExtremeRightGuideRail] = useState('');
  const [guideRailsTypes, setGuideRailsTypes] = useState('');

  // 15) Other
  const [guideRailGasketing, setGuideRailGasketing] = useState(false);
  const [soundproofMat, setSoundproofMat] = useState(false);

  // 17) Dowel holes
  const [dowelHoles, setDowelHoles] = useState('');
  const [dowelLeft, setDowelLeft] = useState(true);
  const [dowelRight, setDowelRight] = useState(true);
  const [dowelTop, setDowelTop] = useState(false);
  const [dowelBottom, setDowelBottom] = useState(false);

  // 18) Grilles/Door infills
  const [grilleType, setGrilleType] = useState('');
  const [grilleFields, setGrilleFields] = useState(4);


  const [result, setResult] = useState<PricingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 19) Visualizer View Side
  const [viewSide, setViewSide] = useState<'interior' | 'exterior'>('interior');

  // Debounce input changes so we don't spam the API on every keypress.
  useEffect(() => {
    const input: ConfiguratorInput = {
      article: typology,
      profilsatz: SYSTEM_CODE_MAP[profilsatz] || profilsatz,
      materialart: 2,
      beschvar: opening === 'UR' ? 'UR-P' : 'FIX',
      width_mm: width,
      height_mm: height,
      sashCount: 1,
      openings: [opening as any],
      windowUnit: windowUnit || undefined,
      model: model || undefined,
      color: { 
        type: colorType, 
        code: colorCode, 
        exteriorRal: colorCode, 
        interiorRal: interiorColorCode || undefined,
        overwriteCoreColor,
        coreColor: coreColor || undefined
      },
      frameProfile: frameProfile || '50001',
      sashProfile: '50011',
      infills: (typology.match(/^F2[0-5][0-9]$/) ? infills : [infills[0]]).map(inf => ({
        code: inf.code,
        panes: inf.code.startsWith('3-') ? [inf.pane1, inf.pane2, inf.pane3].filter(Boolean) : [inf.pane1, inf.pane3].filter(Boolean),
        spacer: inf.frameStyle || 'S',
        width_mm: inf.width ? Number(inf.width) : undefined,
        height_mm: inf.height ? Number(inf.height) : undefined
      })),
      options: {
        grilleType: grilleType || undefined,
        grilleFields: grilleType ? grilleFields : undefined,
        sealColor: sealColor || undefined,
        beadStyle: glazingBeadStyle as 'Z'|'P',
        weldType: weld as 'standard'|'v-perfect',
        frameReinforcement: frameReinforcement as 'standard'|'full',
        dowelHoles: dowelHoles || undefined,
      },
      hardware: {
        safetyClass: safetyClass || undefined,
        handleType: handleType || undefined,
        handleColor: handleColor || undefined,
        coverColor: coverColor || undefined
      },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchPrice({ input })
        .then(r => { setResult(r); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }, 200);
    return () => clearTimeout(t);
  }, [
    typology, width, height, profilsatz, colorType, colorCode, JSON.stringify(infills), 
    safetyClass, handleType, handleColor, 
    coverColor, opening, frameProfile, interiorColorCode, overwriteCoreColor,
    coreColor, windowUnit, model, sealColor
  ]);

  // Group colors for dropdowns using IGLO_EDGE_COLORS as requested
  const groupedColors = IGLO_EDGE_COLORS.reduce((acc: any, val: any) => {
    const group = val.group || 'Other';
    if (!acc[group]) acc[group] = [];
    const cantorCode = val.id.replace('c', '').padStart(4, '0');
    acc[group].push({ code: cantorCode, name: val.name, originalKey: val.id, swatchUrl: val.image, hex: val.hex });
    return acc;
  }, {});

  const getColorDetailsFromCode = (code: string) => {
    if (!code) return { hex: '#FFFFFF', textureUrl: '' };
    const colorObj = IGLO_EDGE_COLORS.find(k => k.id.replace('c', '').padStart(4, '0') === code.padStart(4, '0') || k.id.replace('c', '') === code);
    
    return {
      hex: colorObj?.hex || '#4B4B4D', // Fallback to anthracite if no hex
      textureUrl: colorObj?.image || ''
    };
  };

  const extDetails = getColorDetailsFromCode(colorCode);
  const intDetails = interiorColorCode ? getColorDetailsFromCode(interiorColorCode) : extDetails;

  const HANDLE_COLOR_OPTIONS: Record<string, string> = {
    'white': 'White',
    'ral9016': 'RAL 9016 (Pure White)',
    'ral9001': 'RAL 9001 (Cream)',
    'brown': 'Brown',
    'ral8019': 'RAL 8019 (Dark Brown)',
    'czarny': 'Black',
    'ral9005': 'RAL 9005 (Black)',
    'antracyt': 'Anthracite',
    'ral7016': 'RAL 7016 (Anthracite)',
    'silver': 'Silver',
    'f1': 'F1 (Silver)',
    'f2': 'F2 (Champagne)',
    'f4': 'F4 (Old Gold / Bronze)',
    'f9': 'F9 (Titanium)',
    'olive': 'Olive',
    'default': 'Default (Stainless Steel)'
  };

  const COVER_COLOR_OPTIONS: Record<string, string> = {
    'bialy': 'White (biały)',
    'braz': 'Brown (brąz)',
    'jasnybraz': 'Light Brown (jasny brąz)',
    'srebrny': 'Silver (srebrny)',
    'antracyt': 'Anthracite (antracyt)',
    'czarny': 'Black (czarny)',
    'Szampanski': 'Champagne (szampański)',
    'Tytan': 'Titanium (tytan)',
    'kremowy': 'Cream (kremowy)'
  };

  const IMAGE_COLOR_MAP: Record<string, string> = {}; // Tokens already match file suffixes

  const HANDLE_COLOR_MAP: Record<string, string[]> = {
    'Atlanta': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'ALU_A': ['ral9016', 'ral9001', 'brown', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9', 'olive'],
    'ALU_AK': ['white', 'ral9016', 'ral9001', 'brown', 'ral9005', 'ral7016', 'silver', 'f9', 'olive'],
    'ALU_AP': ['white', 'brown', 'silver', 'olive'],
    'ALU_B': ['ral9016', 'ral9001', 'brown', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9', 'olive'],
    'ALU_BK': ['white', 'brown', 'silver', 'olive'],
    'Kwadrat': ['ral9016', 'ral9001', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9'],
    'KwadratK': ['ral9016', 'ral9001', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9'],
    'Mistral': ['ral9001', 'ral9005', 'ral7016', 'f9'],
    'MistralK': ['f9'],
    'Dublin': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'DublinK': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'DublinP': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'MA_1010': ['default'],
    'AtlantaK': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'AtlantaP': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Toulon': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'ToulonSF': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Hamburg': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'HamburgSF': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Tokyo': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    '-': []
  };

  const HANDLE_OPTIONS = [
    { code: '-', name: 'No holes for spindle and mounting screws' },
    { code: 'ALU_A', name: 'Aluminum handle I5 / IL (FKS model 1006)' },
    { code: 'ALU_AK', name: 'Aluminum handle I5 / IL with key (FKS model 1006A)' },
    { code: 'ALU_AP', name: 'Aluminum handle I5 with a button (FKS model 1006D)' },
    { code: 'Atlanta', name: 'Hoppe handle Secustic Atlanta' },
    { code: 'Kwadrat', name: 'Aluminium handle Square' },
    { code: 'KwadratK', name: 'Aluminium handle Square with key' },
    { code: 'Mistral', name: 'Aluminium handle Mistral' },
    { code: 'MistralK', name: 'Aluminium handle Mistral with key' },
    { code: 'AtlantaK', name: 'Hoppe handle Secustic Atlanta with key' },
    { code: 'AtlantaP', name: 'Hoppe handle Secustic Atlanta with button' },
    { code: 'Toulon', name: 'Hoppe handle Secustic Toulon' },
    { code: 'ToulonSF', name: 'Hoppe handle Secuforte Toulon' },
    { code: 'Hamburg', name: 'Hoppe handle Secustic Hamburg' },
    { code: 'HamburgSF', name: 'Hoppe handle Secuforte Hamburg' },
    { code: 'Tokyo', name: 'Hoppe Tokyo handle + KISI (child safety lock)' },
    { code: 'ALU_B', name: 'Aluminium handle IE' },
    { code: 'ALU_BK', name: 'Aluminum handle IE with key - (FKS model 1007A)' },
    { code: 'Dublin', name: 'Aluminum handle DUBLIN' },
    { code: 'DublinK', name: 'Aluminum handle DUBLIN with key' },
    { code: 'DublinP', name: 'Aluminum handle DUBLIN with button' },
    { code: 'ALUR', name: 'Flat window handle (roller shutter)' },
    { code: 'ATESTK', name: 'Window handle with key - ATEST' },
    { code: 'ALUW', name: 'Aluminum pull handle "conductor"' },
    { code: 'MA_1010', name: 'MA 1010 stainless steel window handle' }
  ];

  const FRAME_STYLES = [
    { code: 'BI', name: 'Ultimate white (RAL 9016)', hex: '#f4f8f4', ext: 'jpg' },
    { code: 'JB', name: 'Ultimate light brown (RAL 8003)', hex: '#8a5a44', ext: 'jpg' },
    { code: 'JS', name: 'Ultimate light grey (RAL 7035)', hex: '#c5c7c4', ext: 'jpg' },
    { code: 'S', name: 'Steel', hex: '#b0b5b9', ext: 'jpg' },
    { code: 'U', name: 'Ultimate grey (RAL 9023)', hex: '#797b7a', ext: 'webp' },
    { code: 'UC', name: 'Ultimate black (RAL 9005)', hex: '#0a0a0a', ext: 'jpg' },
    { code: 'X', name: 'Ultimate brown', hex: '#59351f', ext: 'jpg' }
  ];

  const TYPOLOGY_GROUPS = [
    {
      category: "Windows",
      subgroups: [
        { name: "TYPE 1 Window", ids: ["F100","F101","F103","F104","F105","F106","F200","F201","F203","F204","F205","F206","F207","F208","F250","F251","F252","F253","F254","F255","F300","F301","F302","F303","F304","F350","F351","F352","F353","F309","F400","F401","F402","F403","F450","F451","F542","F453"] },
      ]
    }
  ];

  const WINDOW_MODELS = [
    { group: "1 Cut", options: [
      { code: "S100", name: "Chamfer of the upper left corner" },
      { code: "S101", name: "Chamfer of the upper left corner to any height" },
      { code: "S200", name: "Chamfer of the upper right corner" },
      { code: "S201", name: "Chamfer of the upper right corner to any height" },
      { code: "TS100", name: "Upper-Left corner – cutting" }
    ]},
    { group: "2 Cuts", options: [
      { code: "S300", name: "Cut of the upper corners" }
    ]},
    { group: "Triangles", options: [
      { code: "T100", name: "Rectangular triangle" },
      { code: "T200", name: "Isosceles triangle / triangle with tilted tip" }
    ]},
    { group: "Arches", options: [
      { code: "L100", name: "Segmental arch" },
      { code: "L101", name: "Segmental arch to the top" },
      { code: "L200", name: "Full arch" },
      { code: "L201", name: "Full arch to the top" },
      { code: "L300", name: "Sharp arch" }
    ]},
    { group: "Various", options: [
      { code: "K100", name: "Circle" },
      { code: "S500", name: "Chamfer of the selected corners" }
    ]}
  ];

  const DRUTEX_CATEGORIES = [
    { id: 'WINDOWS', icon: IconWindows, label: t('header.megaMenu.cats.windows', 'WINDOWS') },
    { id: 'DOORS', icon: IconDoors, label: t('header.megaMenu.cats.doors', 'DOORS') },
    { id: 'TERRACE SYSTEMS', icon: IconPatioDoors, label: t('header.megaMenu.cats.terrace', 'TERRACE SYSTEMS') },
    { id: 'SHUTTERS', icon: IconRollerShutters, label: t('header.megaMenu.cats.shutters', 'SHUTTERS') },
    { id: 'EXTERIOR VENETIAN BLINDS', icon: IconExteriorBlinds, label: t('header.megaMenu.cats.facade', 'EXTERIOR VENETIAN BLINDS') },
    { id: 'INSECT SCREENS', icon: IconMosquitoNets, label: t('header.megaMenu.cats.mosquito', 'INSECT SCREENS') },
    { id: 'GARAGE DOORS', icon: IconGarageDoors, label: t('header.megaMenu.cats.garage', 'GARAGE DOORS') },
    { id: 'FACADES / WINTER GARDENS', icon: IconConservatories, label: t('header.megaMenu.cats.conservatories', 'FACADES / WINTER GARDENS') },
    { id: 'PERGOLA', icon: IconPergola, label: t('header.megaMenu.cats.pergola', 'PERGOLA') },
    { id: 'SMART HOME', icon: IconSmartHome, label: t('header.megaMenu.cats.smart', 'SMART HOME') },
  ];

  const PRODUCT_CATEGORIES = [
    {
      group: 'WINDOWS',
      subgroups: [
        {
          name: t('header.megaMenu.cols.pvcWindows', 'PVC WINDOWS'),
          options: [
            { val: "1600", label: "IGLO EDGE (new)" },
            { val: "1300", label: "IGLO ENERGY" },
            { val: "1310", label: "IGLO ENERGY CLASSIC" },
            { val: "1360", label: "IGLO ENERGY ALUCOVER" },
            { val: "1100", label: "IGLO 5" },
            { val: "1110", label: "IGLO 5 CLASSIC" },
            { val: "1200", label: "IGLO LIGHT" },
            { val: "1400", label: "IGLO EXT" },
            { val: "1500", label: "IGLO PREMIER" },
            { val: "1700", label: "IDEAL NEO 76 AD" },
            { val: "1710", label: "IDEAL NEO 76 MD" },
            { val: "1720", label: "IDEAL NEO 76 MD RENO" },
            { val: "1730", label: "IDEAL NEO 76 MD MONO" },
            { val: "1750", label: "IDEAL 7000 NL" },
            { val: "1756", label: "IDEAL 7000 NL (OKNA OTW NA ZEWN)" }
          ]
        },
        {
          name: t('header.megaMenu.cols.alumWindows', 'ALUMINIUM WINDOWS'),
          options: [
            { val: "3350", label: "MB-86N SI" },
            { val: "3200", label: "MB-79N SI" },
            { val: "3150", label: "MB-70HI / MB-70" },
            { val: "3100", label: "MB-45" }
          ]
        },
        {
          name: t('header.megaMenu.cols.woodWindows', 'WOODEN WINDOWS'),
          options: [
            { val: "2100", label: "SOFTLINE 68" },
            { val: "2200", label: "SOFTLINE 78" },
            { val: "2300", label: "SOFTLINE 88" }
          ]
        },
        {
          name: t('header.megaMenu.cols.woodAlumWindows', 'WOOD-ALUMINIUM WINDOWS'),
          options: [
            { val: "2600", label: "DUOLINE 68" },
            { val: "2700", label: "DUOLINE 78" },
            { val: "2800", label: "DUOLINE 88" }
          ]
        }
      ]
    },
    {
      group: 'DOORS',
      subgroups: [
        {
          name: t('header.megaMenu.cols.pvcDoors', 'PVC DOORS'),
          options: [
            { val: "1103", label: "IGLO 5" },
            { val: "1603", label: "IGLO EDGE (new)" },
            { val: "1303", label: "IGLO ENERGY" },
            { val: "1703", label: "IDEAL NEO 76 AD (DRZWI WEJŚCIOWE)" },
            { val: "1713", label: "IDEAL NEO 76 MD (FRONT DOOR)" },
            { val: "1723", label: "IDEAL NEO 76 MD RENO (DRZWI WEJŚCIOWE)" },
            { val: "1733", label: "IDEAL NEO 76 MD MONO (DRZWI WEJŚCIOWE)" },
            { val: "1753", label: "IDEAL 7000 NL (DRZWI WEJŚCIOWE)" }
          ]
        },
        {
          name: t('header.megaMenu.cols.alumDoors', 'ALUMINIUM DOORS'),
          options: [
            { val: "4044", label: "D-ART Line (new)" },
            { val: "3353", label: "MB-86N SI" },
            { val: "3203", label: "MB-79N SI+" },
            { val: "3153", label: "MB-70HI / MB-70" },
            { val: "3103", label: "MB-45" },
            { val: "3603", label: "MB-78EI Fire-Doors" },
            { val: "3450", label: "PIVOT" }
          ]
        },
        {
          name: t('home.categories.items.wooden', 'WOODEN') + ' ' + t('header.megaMenu.cats.doors', 'DOORS'),
          options: [
            { val: "2103", label: "SOFTLINE 68" },
            { val: "2203", label: "SOFTLINE 78" },
            { val: "2303", label: "SOFTLINE 88" }
          ]
        }
      ]
    },
    {
      group: 'TERRACE SYSTEMS',
      subgroups: [
        {
          name: t('home.categories.items.liftSlide', 'LIFT AND SLIDE HS'),
          options: [
            { val: "1004", label: "IGLO-HS" },
            { val: "1014", label: "IGLO-HS ALUCOVER" },
            { val: "3804", label: "MB-77HS HI" },
            { val: "3854", label: "MB-77HS HI MONORAIL" },
            { val: "3900", label: "MB-59HS HI" },
            { val: "2104", label: "SOFTLINE HS (68)" },
            { val: "2604", label: "DUOLINE HS (68)" }
          ]
        },
        {
          name: t('home.categories.items.slide', 'SLIDE'),
          options: [
            { val: "1007", label: "IGLO EDGE SLIDE (new)" },
            { val: "1005", label: "IGLO SLIDE" },
            { val: "3814", label: "MB-SLIDE" },
            { val: "3904", label: "COR VISION (new) / COR VISION PLUS" }
          ]
        },
        {
          name: t('home.categories.items.folding', 'FOLDING DOORS'),
          options: [
            { val: "3909", label: "MB-86 FOLD LINE HD" },
            { val: "2108", label: "SOFTLINE 68" }
          ]
        },
        {
          name: t('home.categories.items.tiltSlide', 'TILT AND SLIDE PSK'),
          options: [
            { val: "1301", label: "IGLO ENERGY PSK" },
            { val: "1311", label: "IGLO ENERGY CLASSIC PSK" },
            { val: "1101", label: "IGLO 5 PSK" },
            { val: "1701", label: "IDEAL NEO 76 AD PSK" },
            { val: "1711", label: "IDEAL NEO 76 MD PSK" },
            { val: "1721", label: "IDEAL NEO 76 MD RENO PSK" },
            { val: "1731", label: "IDEAL NEO 76 MD MONO PSK" },
            { val: "1751", label: "IDEAL 7000 NL PSK" }
          ]
        }
      ]
    }
  ];

  const PROFILE_IMAGE_MAP: Record<string, string> = {
    "1100": "iglo5",
    "1101": "iglo5psk",
    "1103": "iglo5",
    "1110": "iglo5classic",
    "1300": "igloenergy",
    "1310": "igloenergyclassic",
    "3350": "mb86nsi",
    "3904": "corvisionplus"
  };

  const SYSTEM_CODE_MAP: Record<string, string> = {
    "1100": "IG5",
    "1101": "IG5 PP PSK",
    "1103": "IG5",
    "1110": "IG5CL",
    "1300": "IGE",
    "1310": "IGECL",
    "3350": "MB86N",
    "3904": "CVP"
  };

  // Helper for generic unmapped dropdowns
  const GenericSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options?: {value: string, label: string}[] }) => (
    <div>
      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">{label}</label>
      <select className="w-full bg-mammut-black border border-gray-800 rounded p-2 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none"
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Lack (-)</option>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : (
          <>
            <option value="opt1">Standard Option 1</option>
            <option value="opt2">Standard Option 2</option>
          </>
        )}
      </select>
    </div>
  );

  // Helper for color dropdowns with swatches
  const ColorSelect = ({ label, value, onChange, groupedOptions }: { label: string, value: string, onChange: (v: string) => void, groupedOptions: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const flatOpts = Object.values(groupedOptions).flat() as any[];
    const activeOpt = flatOpts.find(o => o.code === value);

    return (
      <div className="relative z-20">
        <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">{label}</label>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-mammut-black border border-gray-800 rounded p-2 text-mammut-white text-sm cursor-pointer flex items-center justify-between hover:border-mammut-gold transition-colors h-[38px]"
        >
          <div className="flex items-center gap-3">
             {activeOpt && activeOpt.swatchUrl ? (
                <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner" style={{ backgroundImage: `url(${activeOpt.swatchUrl})`, backgroundSize: 'cover' }}></div>
             ) : (
                <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner bg-gray-800"></div>
             )}
             <span>{activeOpt ? `${activeOpt.code} - ${activeOpt.name}` : '-- Default --'}</span>
          </div>
          <span className="text-gray-500 text-xs">▼</span>
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full left-0 mt-1 w-full bg-mammut-dark border border-gray-700 rounded-lg shadow-2xl z-40 max-h-[300px] overflow-y-auto">
              <div 
                onClick={() => { onChange(''); setIsOpen(false); }} 
                className="p-2 hover:bg-mammut-gold/20 cursor-pointer flex items-center gap-3 border-b border-gray-800 text-sm"
              >
                 <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner bg-gray-800"></div>
                 <span>-- Default --</span>
              </div>
              {Object.entries(groupedOptions).map(([group, opts]: any) => (
                <div key={group}>
                  <div className="p-1 px-2 bg-mammut-black text-[10px] text-mammut-gold font-bold uppercase tracking-wide border-y border-gray-800 sticky top-0 z-10 shadow-sm">
                    {group}
                  </div>
                  {opts.map((opt: any) => (
                    <div 
                      key={opt.code} 
                      onClick={() => { onChange(opt.code); setIsOpen(false); }} 
                      className="p-2 hover:bg-mammut-gold/20 cursor-pointer flex items-center gap-3 border-b border-gray-800 transition-colors text-sm"
                    >
                       {opt.swatchUrl ? (
                         <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner shrink-0" style={{ backgroundImage: `url(${opt.swatchUrl})`, backgroundSize: 'cover' }}></div>
                       ) : (
                         <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner shrink-0 bg-gray-800"></div>
                       )}
                       <div className="flex flex-col">
                         <span>{opt.code} - {opt.name}</span>
                       </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const [sceneGroup, setSceneGroup] = useState<{group: THREE.Group, ts: number} | null>(null);

  // Summary helpers for accordions
  const getProductSummary = () => {
    const sysName = PRODUCT_CATEGORIES
      .flatMap(c => c.subgroups.flatMap(sg => sg.options))
      .find(o => o.val === profilsatz)?.label || profilsatz;
    return `${typology} (${sysName}), ${width} × ${height} mm`;
  };

  const getColorsSummary = () => {
    if (colorType === 'W-W') return 'W-W (White / White)';
    const extName = IGLO_EDGE_COLORS.find(c => c.id.replace('c', '').padStart(4, '0') === colorCode.padStart(4, '0'))?.name || colorCode;
    const intName = IGLO_EDGE_COLORS.find(c => c.id.replace('c', '').padStart(4, '0') === interiorColorCode.padStart(4, '0'))?.name || interiorColorCode;
    return `${colorType} [Ext: ${extName}, Int: ${intName}]`;
  };

  const getGlazingSummary = () => {
    return infills.map((inf, idx) => {
      const spacerName = FRAME_STYLES.find(fs => fs.code === inf.frameStyle)?.name || 'Default';
      return `Pane ${idx + 1}: ${inf.code} (${spacerName})`;
    }).join(' | ');
  };

  const getHardwareSummary = () => {
    const handleName = HANDLE_OPTIONS.find(h => h.code === handleType)?.name || handleType;
    const modelName = WINDOW_MODELS.flatMap(m => m.options).find(o => o.code === model)?.name || 'Standard';
    return `Safety: ${safetyClass || 'Standard'}, Model: ${modelName}, Handle: ${handleName}`;
  };

  const getShuttersSummary = () => {
    if (!includeShutter) return 'No Shutter';
    const typeLabel = shutterLookups.rollerBlindTypes.find(o => o.value === rollerBlindType)?.label || 'Standard';
    return `${typeLabel} Shutter`;
  };

  const getInstallationSummary = () => {
    const dowels = dowelHoles ? `Dowels: ${dowelHoles}` : 'No Dowels';
    const grilles = grilleType ? `Grilles: ${grilleType}` : 'No Grilles';
    const gasket = sealColor ? `Seal: ${sealColor}` : 'Default Seal';
    return `${dowels}, ${grilles}, ${gasket}`;
  };

  const renderVisualizer = (isDrawer: boolean) => {
    // WebGL context collision prevention:
    // If it's a mobile viewport and we are rendering for the drawer but the drawer is closed, return null.
    // If it's a mobile viewport and we are rendering for the main page options but the drawer is open, return a placeholder.
    if (isMobile) {
      if (isDrawer && !isPreviewDrawerOpen) return null;
      if (!isDrawer && isPreviewDrawerOpen) {
        return (
          <div className="w-full aspect-square border border-gray-800 rounded-lg bg-gray-900 flex items-center justify-center p-4 text-gray-500 font-bold text-xs">
            {t('configurator.visualizer.renderingInDrawer', 'Rendering in Preview Drawer...')}
          </div>
        );
      }
    } else {
      if (isDrawer) return null;
    }

    return (
      <div className="w-full mt-2">
        {(typology === 'F104' || typology === 'F100') ? (
          <div className="w-full aspect-square border border-gray-800 rounded-lg bg-gray-900 flex items-center justify-center p-2 md:p-12 overflow-hidden shadow-inner relative group">
             {/* 3D Toggle */}
             <div className="absolute top-2 left-2 z-30 bg-black/50 p-1 rounded flex items-center gap-2">
                <button onClick={() => setIs3dMode(false)} className={`px-2 py-1 text-xs font-bold rounded ${!is3dMode ? 'bg-mammut-gold text-black' : 'text-gray-400'}`}>2D</button>
                <button onClick={() => setIs3dMode(true)} className={`px-2 py-1 text-xs font-bold rounded ${is3dMode ? 'bg-mammut-gold text-black' : 'text-gray-400'}`}>3D</button>
             </div>

             {/* Inside/Outside View Side Toggle (Move inside visualizer frame & hide in 3D Mode) */}
             {!is3dMode && (
               <div className="absolute top-2 right-2 z-30 flex bg-black/50 rounded p-1 border border-gray-800 shadow-xl gap-1">
                  <button 
                    onClick={() => setViewSide('interior')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition-colors ${viewSide === 'interior' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {t('configurator.viewSide.inside', 'Inside')}
                  </button>
                  <button 
                    onClick={() => setViewSide('exterior')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition-colors ${viewSide === 'exterior' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {t('configurator.viewSide.outside', 'Outside')}
                  </button>
               </div>
             )}

             {/* Vertical Scroll Wheel (Height) overlay on the left */}
             <div className="absolute left-3 top-10 bottom-10 w-8 z-30 flex items-center justify-center font-mono">
                <ScrollWheel
                  value={height}
                  onChange={setHeight}
                  min={500}
                  max={3000}
                  orientation="vertical"
                  className="h-full"
                />
             </div>

             {/* Horizontal Scroll Wheel (Width) overlay at the bottom */}
             <div className="absolute bottom-3 left-12 right-12 h-8 z-30 flex items-center justify-center font-mono">
                <ScrollWheel
                  value={width}
                  onChange={setWidth}
                  min={500}
                  max={3000}
                  orientation="horizontal"
                  className="w-full"
                />
             </div>

             {/* AR Buttons - always visible in 3D mode */}
             {is3dMode && (
               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 bg-black/80 p-2 rounded-full flex items-center gap-2 shadow-xl">
                  <button onClick={() => setArPlacement('wall')} className="bg-mammut-gold text-black px-4 py-1 rounded-full text-xs font-black uppercase whitespace-nowrap">AR Wall</button>
                  <button onClick={() => setArPlacement('floor')} className="bg-white text-black px-4 py-1 rounded-full text-xs font-black uppercase whitespace-nowrap">AR Floor</button>
               </div>
             )}

             {is3dMode ? (
                <ThreejsWindowEngine 
                  width={width} 
                  height={height} 
                  colorExt={extDetails.hex}
                  colorInt={intDetails.hex}
                  colorExtTexture={extDetails.textureUrl}
                  colorIntTexture={intDetails.textureUrl}
                  spacerColor={FRAME_STYLES.find(fs => fs.code === (infills[0]?.frameStyle || 'S'))?.hex || '#b0b5b9'}
                  onSceneReady={setSceneGroup}
                  typology={typology}
                  sealColor={sealColor}
                />
             ) : (
                <SvgWindowEngine 
                  width={width} 
                  height={height} 
                  colorExt={extDetails.hex}
                  colorExtTexture={extDetails.textureUrl}
                  colorInt={intDetails.hex}
                  colorIntTexture={intDetails.textureUrl}
                  viewSide={viewSide}
                  weldType={weld as any}
                  typology={typology}
                  sealColor={sealColor}
                />
             )}
          </div>
        ) : (
          <WindowVisualizer width={width} height={height} typology={typology} infills={infills} />
        )}
      </div>
    );
  };

  const renderLeftColumn = () => {
    return (
      <div className="bg-mammut-darker p-4 rounded-xl border border-gray-800 shadow-2xl flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[85vh] md:max-h-[85vh] shrink-0 scrollbar-none snap-x snap-mandatory">
        {DRUTEX_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded text-sm font-bold uppercase transition-colors shrink-0 snap-start whitespace-nowrap md:whitespace-normal ${
                isActive 
                  ? 'bg-mammut-black border border-mammut-gold text-mammut-white shadow-inner' 
                  : 'bg-transparent text-gray-500 hover:text-mammut-white hover:bg-mammut-black'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-mammut-gold' : 'text-gray-500'} />
              <span className="text-left text-[11px] tracking-wide leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderRightColumn = () => {
    return (
      <div className="flex flex-col gap-6 max-h-[85vh]">
        {/* Pricing Summary Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-mammut-gold/30 shadow-lg p-6 font-mono shrink-0">
          <div className="border-b border-gray-800 pb-3 mb-3">
            <h1 className="text-xl font-bold text-mammut-gold uppercase tracking-tighter">Cantor Pricing Engine</h1>
            <p className="text-[10px] text-gray-500 mt-1">Live calculation via SCHEMA 41 PREISE rules</p>
          </div>

          {loading && <div className="text-gray-500 text-sm py-4">Evaluating formulas...</div>}
          {error && <div className="text-red-400 text-sm py-4">Error: {error}</div>}
          {result && !error && (
            <>
              <div className="flex justify-between items-baseline pb-2">
                <span className="text-xs text-gray-500 uppercase tracking-widest">SCHEMA 41 base (EK)</span>
                <span className="text-lg text-gray-300">{result.ek_pln.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between items-baseline pb-3 border-b border-gray-800">
                <span className="text-xs text-gray-500 uppercase tracking-widest">PREISZYK × FAKTOR {result.faktor}</span>
                <span className="text-lg text-gray-300">{result.vk_pln.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-mammut-white font-bold tracking-widest uppercase">Dealer price ({result.currency}):</span>
                <span className="text-3xl text-emerald-400 font-black">{result.vk_local.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Pricing Ledger Card */}
        <div className="bg-white text-black p-6 rounded-xl shadow-2xl font-mono text-xs overflow-y-auto flex-1">
          <div className="border-b-2 border-black pb-2 mb-4 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold uppercase tracking-tighter">SCHEMA 41 ledger</h2>
            <div className="text-gray-500 mt-1 text-[10px]">One row per PREISE formula. GRPRS accumulates.</div>
          </div>

          {result && !error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 pr-2">Gruppe</th>
                  <th className="py-1 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((l, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${l.value !== 0 ? 'font-bold' : 'text-gray-400'}`}>
                    <td className="py-1 pr-2">{i + 1}</td>
                    <td className="py-1 pr-2">{l.formelText ?? '(no label)'}</td>
                    <td className="py-1 pr-2">{l.preisgruppe ?? '—'}</td>
                    <td className="py-1 text-right">{l.value.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black font-black">
                  <td colSpan={3} className="py-2">GRPRS total (EK PLN)</td>
                  <td className="py-2 text-right">{result.ek_pln.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {!result && !error && !loading && <div className="text-gray-500">Waiting for first response...</div>}
        </div>
      </div>
    );
  };

  const renderMobileDrawer = () => {
    if (!isMobile) return null;
    return (
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-mammut-darker/95 backdrop-blur-md border-t border-gray-800 rounded-t-3xl shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isPreviewDrawerOpen ? 'translate-y-0 h-[65vh]' : 'translate-y-full h-[0vh]'
        }`}
      >
        {/* Drag/Close Handle */}
        <div className="w-full py-3 flex flex-col items-center cursor-pointer border-b border-gray-850" onClick={() => setIsPreviewDrawerOpen(false)}>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full mb-1"></div>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Close Preview</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-between">
          <div className="w-full flex-1 flex items-center justify-center min-h-[300px]">
            {renderVisualizer(true)}
          </div>
          
          <div className="w-full bg-mammut-black/60 rounded-xl p-3 border border-gray-850 flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-mammut-gold font-bold uppercase tracking-wider">{typology}</span>
              <span className="text-xs text-gray-400 mt-0.5">{width} × {height} mm</span>
            </div>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {result ? `${result.vk_local.toFixed(2)} ${result.currency}` : '---'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderStickyBottomBar = () => {
    if (!isMobile) return null;
    return (
      <div className="fixed bottom-0 inset-x-0 bg-mammut-black/95 backdrop-blur-md border-t border-gray-800 px-6 py-4 z-40 flex items-center justify-between shadow-2xl h-[76px]">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest leading-none font-bold">Total Dealer Price</span>
          <span className="text-xl font-black text-emerald-450 font-mono mt-1 leading-none">
            {loading ? '...' : result ? `${result.vk_local.toFixed(2)} ${result.currency}` : '---'}
          </span>
        </div>
        <button 
          onClick={() => setIsPreviewDrawerOpen(!isPreviewDrawerOpen)}
          className="bg-mammut-gold hover:bg-mammut-gold/90 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border border-mammut-gold"
        >
          {isPreviewDrawerOpen ? 'Close Design' : 'View Design'}
        </button>
      </div>
    );
  };

  const renderMiddleColumn = () => {
    const sysName = PRODUCT_CATEGORIES
      .flatMap(c => c.subgroups.flatMap(sg => sg.options))
      .find(o => o.val === profilsatz)?.label || profilsatz;

    const flatModels = [
      { code: '', name: 'Standard (Rectangle)' },
      ...WINDOW_MODELS.flatMap(group => group.options)
    ];

    const sealOptions = [
      { code: '', name: 'Default / Standard' },
      { code: 'czarny', name: 'Black' },
      { code: 'czarny/sz', name: 'Out Black / In Grey' },
      { code: 'mix', name: 'Mix' },
      { code: 'szary', name: 'Gray' },
      { code: 'szary/czar', name: 'Out Grey / In Black' }
    ];

    return (
      <div className="bg-mammut-darker p-4 sm:p-6 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-4 sm:gap-6 overflow-y-auto max-h-[85vh]">
        <div className="border-b border-gray-800 pb-4">
          <h2 className="text-mammut-gold font-bold text-xl uppercase">{t('configurator.options.title', 'Configurator Options')}</h2>
          <p className="text-xs text-gray-500 mt-1">{sysName} — {typology}</p>
        </div>

        {/* Profile Image & Visualizer Row */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4 relative pt-2 md:pt-0">
          {/* Profile cross-section image */}
          <div className="h-24 md:h-32 flex-none md:flex-1 flex justify-center md:justify-end w-full md:w-auto">
            <img 
              src={`/assets/profiles/${PROFILE_IMAGE_MAP[profilsatz] || profilsatz}.png`} 
              alt={profilsatz} 
              className="max-h-24 md:max-h-32 object-contain"
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                if (!e.currentTarget.parentElement?.querySelector('.fallback')) {
                  e.currentTarget.parentElement!.innerHTML += `<div class="fallback h-24 md:h-32 w-48 flex items-center justify-center border border-gray-800 rounded bg-mammut-black text-gray-500 font-bold text-xs">${profilsatz}</div>`;
                }
              }}
            />
          </div>
          
          <div className="text-gray-650 font-bold text-2xl hidden md:block">+</div>

          {/* Visualizer window rendering */}
          <div className="w-full md:flex-[2] flex flex-col justify-center items-center max-w-lg md:max-w-sm relative">
            {renderVisualizer(false)}
          </div>
        </div>

        {/* The 6 Collapsible Accordions */}
        <div className="space-y-2">
          
          {/* 1. Product & Dimensions */}
          <AccordionSection
            id="product"
            title="1. Product & Dimensions"
            summary={getProductSummary()}
            isOpen={activeAccordion === 'product'}
            onToggle={() => setActiveAccordion(activeAccordion === 'product' ? null : 'product')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product opening/type Selector */}
              <div className="relative">
                <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Product Number</label>
                <div 
                  onClick={() => setIsTypologyOpen(!isTypologyOpen)}
                  className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white cursor-pointer flex items-center justify-between hover:border-mammut-gold transition-colors h-[54px]"
                >
                  <div className="flex items-center gap-3">
                     <TypologyThumbnail 
                       id={typology}
                       className="w-8 h-8 object-contain rounded bg-white border border-gray-700 shrink-0 p-0.5"
                     />
                     <span className="font-bold text-sm">{typology}</span>
                  </div>
                  <span className="text-gray-500 text-xs">▼</span>
                </div>
                
                {isTypologyOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/60 md:bg-transparent" onClick={() => setIsTypologyOpen(false)}></div>
                    <div className="fixed md:absolute top-1/2 md:top-full left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-0 w-[92vw] md:w-[450px] mt-1 bg-mammut-dark border border-gray-700 rounded-lg shadow-2xl z-50 pb-1 max-h-[75vh] md:max-h-[500px] overflow-y-auto">
                      {TYPOLOGY_GROUPS.map((group, gIdx) => (
                        <div key={gIdx}>
                          <div className="p-2 border-b border-gray-800 bg-mammut-black sticky top-0 z-10 text-xs text-mammut-gold font-bold uppercase tracking-widest shadow-sm">
                            {group.category}
                          </div>
                          {group.subgroups.map((subg, sIdx) => (
                            <div key={sIdx}>
                              <div className="p-1 px-3 bg-mammut-darker text-[10px] text-gray-500 font-bold uppercase tracking-wide border-b border-gray-800">
                                {subg.name}
                              </div>
                              {subg.ids.map(id => {
                                  const wt = WINDOW_TYPES.find(w => w.id === id) || { id, sashes: 1, name: 'Frame' };
                                  return (
                                    <div 
                                      key={id} 
                                      onClick={() => { setTypology(id); setIsTypologyOpen(false); }} 
                                      className="p-3 hover:bg-mammut-gold/20 cursor-pointer flex items-center gap-4 border-b border-gray-800 transition-colors group"
                                    >
                                       <TypologyThumbnail 
                                         id={id}
                                         className="w-10 h-10 object-contain rounded bg-mammut-black border border-gray-700 p-0.5 shrink-0"
                                       />
                                       <div className="flex flex-col">
                                         <span className="font-bold text-mammut-white text-sm">{id}</span>
                                         <span className="text-xs text-gray-400 leading-tight">{wt.name || 'Window'}</span>
                                       </div>
                                    </div>
                                  );
                              })}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Profile System Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Profile System</label>
                <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white focus:border-mammut-gold focus:outline-none h-[54px] text-sm"
                  value={profilsatz} onChange={e => setProfilsatz(e.target.value)}>
                  {PRODUCT_CATEGORIES.filter(c => c.group === activeCategory).map((category) => (
                    category.subgroups.map((subgroup, subgroupIndex) => (
                      <optgroup key={`${category.group}-${subgroupIndex}`} label={`${t('header.megaMenu.cats.' + category.group.toLowerCase().split(' ')[0], category.group)} — ${subgroup.name}`}>
                        {subgroup.options.map(opt => (
                          <option key={opt.val} value={opt.val}>{opt.val} — {opt.label}</option>
                        ))}
                      </optgroup>
                    ))
                  ))}
                </select>
              </div>

              {/* Touch Steppers for Width and Height */}
              <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TouchStepper label="Width (mm)" value={width} onChange={setWidth} min={500} max={3000} step={10} />
                <TouchStepper label="Height (mm)" value={height} onChange={setHeight} min={500} max={3000} step={10} />
              </div>
            </div>
          </AccordionSection>

          {/* 2. Colors & Finishes */}
          <AccordionSection
            id="colors"
            title="2. Colors & Finishes"
            summary={getColorsSummary()}
            isOpen={activeAccordion === 'colors'}
            onToggle={() => setActiveAccordion(activeAccordion === 'colors' ? null : 'colors')}
          >
            <div className="space-y-4">
              <SegmentedControl
                label="Color Style"
                value={colorType}
                onChange={setColorType}
                options={[
                  { value: 'W-W', label: 'W-W (White / White)' },
                  { value: 'DEK-DEK', label: 'DEK-DEK (Decor / Decor)' },
                  { value: 'W-DEK', label: 'W-DEK (White / Decor)' },
                  { value: 'DEK-W', label: 'DEK-W (Decor / White)' }
                ]}
                gridCols="grid-cols-2"
              />

              {colorType !== 'W-W' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorSelect label="Exterior Color" value={colorCode} onChange={setColorCode} groupedOptions={groupedColors} />
                  <ColorSelect label="Interior Color" value={interiorColorCode} onChange={setInteriorColorCode} groupedOptions={groupedColors} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center">
                  <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                    <input type="checkbox" checked={overwriteCoreColor} onChange={e => setOverwriteCoreColor(e.target.checked)} className="rounded border-gray-700 bg-mammut-black text-mammut-gold focus:ring-[#eab676] w-4.5 h-4.5" />
                    Overwrite core color
                  </label>
                </div>
                {overwriteCoreColor && (
                  <ColorSelect label="Core Color" value={coreColor} onChange={setCoreColor} groupedOptions={groupedColors} />
                )}
              </div>
            </div>
          </AccordionSection>

          {/* 3. Glazing & Spacers */}
          <AccordionSection
            id="glazing"
            title="3. Glazing & Spacers"
            summary={getGlazingSummary()}
            isOpen={activeAccordion === 'glazing'}
            onToggle={() => setActiveAccordion(activeAccordion === 'glazing' ? null : 'glazing')}
          >
            {(typology.match(/^F2[0-5][0-9]$/) ? [0, 1] : [0]).map((infillIdx) => {
              const inf = infills[infillIdx];
              const updateInf = (field: string, val: string) => {
                const newInf = [...infills];
                newInf[infillIdx] = { ...newInf[infillIdx], [field]: val };
                setInfills(newInf);
              };
              
              const schemaPkg = CONFIG_SCHEMA.glazing.find(g => g.id === inf.code);
              const isFixed = !!schemaPkg?.fixedPanes;
              return (
                <div key={infillIdx} className="border border-gray-800/80 rounded-xl p-4 bg-mammut-black/20 space-y-4">
                  <div className="font-bold text-xs text-mammut-gold uppercase tracking-wider">
                    Infill {typology.match(/^F2[0-5][0-9]$/) ? infillIdx + 1 : ''}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Package Code</label>
                      <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white focus:border-mammut-gold focus:outline-none text-sm h-[50px]"
                        value={inf.code} onChange={e => {
                          const newCode = e.target.value;
                          const newInf = [...infills];
                          const updatedInf = { ...newInf[infillIdx], code: newCode };
                          
                          const selectedSchema = CONFIG_SCHEMA.glazing.find(g => g.id === newCode);
                          if (selectedSchema?.fixedPanes) {
                            updatedInf.pane1 = selectedSchema.fixedPanes[0] || '';
                            updatedInf.pane2 = selectedSchema.fixedPanes[1] || '';
                            updatedInf.pane3 = selectedSchema.fixedPanes[2] || '';
                          } else if (newCode.startsWith('2-')) {
                            updatedInf.pane1 = 'T4';
                            updatedInf.pane3 = 'FL4';
                            updatedInf.pane2 = '';
                          } else if (newCode.startsWith('3-')) {
                            updatedInf.pane1 = 'T4';
                            updatedInf.pane2 = 'FL4';
                            updatedInf.pane3 = 'T4';
                          } else {
                            updatedInf.pane1 = '';
                            updatedInf.pane2 = '';
                            updatedInf.pane3 = '';
                          }
                          
                          newInf[infillIdx] = updatedInf;
                          setInfills(newInf);
                        }}>
                        <optgroup label="Standard Glazing">
                          {CONFIG_SCHEMA.glazing
                            .filter(g => g.group !== 'Non Glazing' && g.group !== 'Fixed Pane Packages')
                            .filter(g => {
                              const limits = PROFILE_GLAZING_LIMITS[profilsatz] || PROFILE_GLAZING_LIMITS['DEFAULT'];
                              return limits.packages.includes(g.id);
                            })
                            .map(g => (
                              <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Fixed Pane Packages">
                          {CONFIG_SCHEMA.glazing
                            .filter(g => g.group === 'Fixed Pane Packages')
                            .filter(g => {
                              const limits = PROFILE_GLAZING_LIMITS[profilsatz] || PROFILE_GLAZING_LIMITS['DEFAULT'];
                              return limits.packages.includes(g.id);
                            })
                            .map(g => (
                              <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Non Glazing / Blinds">
                          {CONFIG_SCHEMA.glazing.filter(g => g.group === 'Non Glazing').map(g => (
                              <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {typology.match(/^F2[0-5][0-9]$/) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Width (mm)</label>
                          <input type="number" className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                            value={inf.width} onChange={e => updateInf('width', e.target.value)} placeholder="Auto" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Height (mm)</label>
                          <input type="number" className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                            value={inf.height} onChange={e => updateInf('height', e.target.value)} placeholder="Auto" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Glass Outside */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Glass Outside</label>
                      <div className="flex gap-2">
                        <select disabled={isFixed} className="flex-1 bg-mammut-black border border-gray-800 rounded-xl p-2.5 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none disabled:opacity-50 h-[46px]"
                          value={inf.pane1} onChange={e => updateInf('pane1', e.target.value)}>
                          <option value="">-- None --</option>
                          {glazingOptions.outside.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                        </select>
                        {inf.pane1 && (
                          <div className="w-[46px] h-[46px] bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner">
                            <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane1)}`} alt={inf.pane1} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Glass Middle */}
                    {inf.code.startsWith('3-') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Glass Middle</label>
                        <div className="flex gap-2">
                          <select disabled={isFixed} className="flex-1 bg-mammut-black border border-gray-800 rounded-xl p-2.5 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none disabled:opacity-50 h-[46px]"
                            value={inf.pane2} onChange={e => updateInf('pane2', e.target.value)}>
                            <option value="">-- None --</option>
                            {glazingOptions.middle.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                          </select>
                          {inf.pane2 && (
                            <div className="w-[46px] h-[46px] bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner">
                              <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane2)}`} alt={inf.pane2} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Glass Inside */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Glass Inside</label>
                      <div className="flex gap-2">
                        <select disabled={isFixed} className="flex-1 bg-mammut-black border border-gray-800 rounded-xl p-2.5 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none disabled:opacity-50 h-[46px]"
                          value={inf.pane3} onChange={e => updateInf('pane3', e.target.value)}>
                          <option value="">-- None --</option>
                          {glazingOptions.inside.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                        </select>
                        {inf.pane3 && (
                          <div className="w-[46px] h-[46px] bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner">
                            <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane3)}`} alt={inf.pane3} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Spacer / Frame Style Carousel Selector */}
                  <div className="pt-2">
                    <CarouselSelector
                      label="Spacer Type"
                      value={inf.frameStyle}
                      onChange={val => updateInf('frameStyle', val)}
                      options={FRAME_STYLES}
                      getImagePath={opt => `${import.meta.env.BASE_URL}assets/spacers/${opt.code}.${(opt as any).ext || 'jpg'}`}
                    />
                  </div>
                </div>
              );
            })}
          </AccordionSection>

          {/* 4. Hardware & Profile Options */}
          <AccordionSection
            id="hardware"
            title="4. Hardware & Profiles"
            summary={getHardwareSummary()}
            isOpen={activeAccordion === 'hardware'}
            onToggle={() => setActiveAccordion(activeAccordion === 'hardware' ? null : 'hardware')}
          >
            <div className="space-y-6">
              
              {/* Segmented Controls for low count options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <SegmentedControl
                  label="Safety Class"
                  value={safetyClass}
                  onChange={setSafetyClass}
                  options={[
                    { value: '', label: 'Standard' },
                    { value: 'RC1', label: 'RC1' },
                    { value: 'RC2', label: 'RC2' },
                    { value: 'RC2N', label: 'RC2N' },
                    { value: '4ZA', label: '4ZA' }
                  ]}
                  gridCols="grid-cols-3 sm:grid-cols-5"
                />

                <SegmentedControl
                  label="Frame Profile"
                  value={frameProfile}
                  onChange={setFrameProfile}
                  options={[
                    { value: '50001', label: 'Standard' },
                    { value: '50002', label: 'Renovation' }
                  ]}
                />

                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    label="Weld Type"
                    value={weld}
                    onChange={setWeld}
                    options={[
                      { value: 'standard', label: 'Standard' },
                      { value: 'v-perfect', label: 'V-Perfect' }
                    ]}
                  />
                  {weld && (
                    <div className="bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-1 w-32 h-20 self-start shadow-inner">
                      <img src={`/assets/welds/${weld}_weld.png`} alt={weld} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    label="Glazing Bead Style"
                    value={glazingBeadStyle}
                    onChange={setGlazingBeadStyle}
                    options={[
                      { value: 'Z', label: 'Rounded (Z)' },
                      { value: 'P', label: 'Rectangular (P)' }
                    ]}
                  />
                  {glazingBeadStyle && (
                    <div className="bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-1 w-32 h-20 self-start shadow-inner">
                      <img src={`/assets/beads/bead_${glazingBeadStyle}.png`} alt={glazingBeadStyle} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <SegmentedControl
                  label="Frame Reinforcement"
                  value={frameReinforcement}
                  onChange={setFrameReinforcement}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'full', label: 'Full Steel' }
                  ]}
                />
              </div>

              {/* Model Profile Carousel */}
              <div className="pt-2">
                <CarouselSelector
                  label="Model Profile"
                  value={model}
                  onChange={setModel}
                  options={flatModels}
                  getImagePath={opt => opt.code ? `${import.meta.env.BASE_URL}assets/models/${opt.code}.png` : ''}
                />
              </div>

              {/* Gasket / Seal Color Carousel */}
              <div className="pt-2">
                <CarouselSelector
                  label="Gasket / Seal Color"
                  value={sealColor}
                  onChange={setSealColor}
                  options={sealOptions}
                  getImagePath={opt => opt.code ? `${import.meta.env.BASE_URL}assets/seals/${opt.code === 'czarny/sz' ? 'czarny_sz' : opt.code === 'szary/czar' ? 'szary_czar' : opt.code}.png` : ''}
                />
              </div>

              {/* Hardware, Handles details dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-800/60 pt-4">
                <GenericSelect label="Hardware System" value={hardwareSystem} onChange={setHardwareSystem} />
                
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Handle Type</label>
                  <div className="flex gap-3 items-start">
                    <select className="flex-1 bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                      value={handleType} onChange={e => setHandleType(e.target.value)}>
                       {HANDLE_OPTIONS.map(h => <option key={h.code} value={h.code}>{h.code}, {h.name}</option>)}
                    </select>
                    {handleType && handleType !== '-' && (
                      <div className="w-[50px] h-[50px] bg-white border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner">
                        <img 
                          src={(() => {
                            const getSrc = (c: string) => {
                              const hoppeSeries = ['AtlantaK', 'AtlantaP', 'Toulon', 'ToulonSF', 'Hamburg', 'HamburgSF', 'Tokyo'];
                              const aliasType = hoppeSeries.includes(handleType) ? 'Atlanta' : (handleType === 'ALU_B' ? 'ALU_A' : handleType);
                              if (aliasType === 'Kwadrat') return `/assets/handles/kwadrat-${c}.png`;
                              if (aliasType === 'Mistral') return `/assets/handles/mistral-${c}.png`;
                              if (aliasType === 'MistralK') return `/assets/handles/mistral-${c}-key.png`;
                              return `/assets/handles/${aliasType}_${c}.webp`;
                            };
                            return getSrc(handleColor ? (IMAGE_COLOR_MAP[handleColor] || handleColor) : 'white');
                          })()} 
                          alt={handleType} 
                          className="max-h-full max-w-full object-contain mix-blend-multiply p-0.5" 
                          onError={(e) => {
                            const t = e.currentTarget;
                            const getSrc = (c: string) => {
                              const hoppeSeries = ['AtlantaK', 'AtlantaP', 'Toulon', 'ToulonSF', 'Hamburg', 'HamburgSF', 'Tokyo'];
                              const aliasType = hoppeSeries.includes(handleType) ? 'Atlanta' : (handleType === 'ALU_B' ? 'ALU_A' : handleType);
                              if (aliasType === 'Kwadrat') return `/assets/handles/kwadrat-${c}.png`;
                              if (aliasType === 'Mistral') return `/assets/handles/mistral-${c}.png`;
                              if (aliasType === 'MistralK') return `/assets/handles/mistral-${c}-key.png`;
                              return `/assets/handles/${aliasType}_${c}.webp`;
                            };
                            const fallbacks = [
                              getSrc('white'), getSrc('ral9016'), getSrc('ral9001'), getSrc('f1'), getSrc('silver'), getSrc('f4'),
                              handleType === 'Kwadrat' ? '/assets/handles/kwadrat-ral9016.png' :
                              handleType === 'KwadratK' ? '/assets/handles/KwadratK_ral9016.webp' :
                              handleType === 'Mistral' ? '/assets/handles/mistral-ral9001.png' :
                              handleType === 'MistralK' ? '/assets/handles/mistral-f9-key.png' :
                              handleType === 'ALU_A' || handleType === 'ALU_B' ? '/assets/handles/ALU_A_ral9016.webp' :
                              handleType === 'ALU_AK' || handleType === 'ALU_BK' ? `/assets/handles/${handleType}_white.webp` :
                              handleType === 'ALU_AP' ? '/assets/handles/ALU_AP_white.webp' :
                              handleType === 'MA_1010' ? '/assets/handles/MA_1010_default.webp' :
                              `/assets/handles/${handleType}_white.webp`
                            ];
                            let currentIdx = parseInt(t.dataset.fallbackIdx || '-1');
                            let nextIdx = currentIdx + 1;
                            while (nextIdx < fallbacks.length) {
                              const targetSrc = fallbacks[nextIdx];
                              if (!t.src.endsWith(targetSrc)) {
                                t.dataset.fallbackIdx = nextIdx.toString();
                                t.src = targetSrc;
                                return;
                              }
                              nextIdx++;
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Handle Color</label>
                    <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                      value={handleColor} onChange={e => setHandleColor(e.target.value)}>
                       <option value="">-- Default --</option>
                       {(HANDLE_COLOR_MAP[handleType] || []).map(c => <option key={c} value={c}>{HANDLE_COLOR_OPTIONS[c] || c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Covers Color</label>
                    <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                      value={coverColor} onChange={e => setCoverColor(e.target.value)}>
                       <option value="">-- Default --</option>
                       {Object.entries(COVER_COLOR_OPTIONS).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                  </div>
                </div>

              </div>

            </div>
          </AccordionSection>

          {/* 5. Roller Shutter Options */}
          <AccordionSection
            id="shutters"
            title="5. Roller Shutters"
            summary={getShuttersSummary()}
            isOpen={activeAccordion === 'shutters'}
            onToggle={() => setActiveAccordion(activeAccordion === 'shutters' ? null : 'shutters')}
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none pb-2 border-b border-gray-800">
                <input type="checkbox" className="w-5 h-5 accent-[#eab676]" checked={includeShutter} onChange={e => setIncludeShutter(e.target.checked)} />
                Include Roller Shutter System
              </label>

              {includeShutter && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <GenericSelect label="Roller Blind Type" value={rollerBlindType} onChange={setRollerBlindType} options={shutterLookups.rollerBlindTypes} />
                  <GenericSelect label="Window Screen" value={windowScreen} onChange={setWindowScreen} options={shutterLookups.windowScreens} />
                  {windowScreen && (
                    <GenericSelect label="Window Screen Location" value={windowScreenLocation} onChange={setWindowScreenLocation} options={shutterLookups.windowScreenLocations} />
                  )}
                  
                  <div className="col-span-1 sm:col-span-2 border-t border-gray-800/60 my-2"></div>
                  
                  <GenericSelect label="Curtain Type" value={curtainType} onChange={setCurtainType} options={shutterLookups.curtainTypes} />
                  <GenericSelect label="Fins Perforation" value={finsPerforation} onChange={setFinsPerforation} options={shutterLookups.finsPerforations} />
                  
                  <ColorSelect label="Curtain Color" value={curtainColor} onChange={setCurtainColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Bottom Slat Color" value={bottomSlatColor} onChange={setBottomSlatColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Screen Bottom Slat Color" value={windowScreenBottomSlatColor} onChange={setWindowScreenBottomSlatColor} groupedOptions={groupedColors} />
                  
                  <div className="col-span-1 sm:col-span-2 border-t border-gray-800/60 my-2"></div>

                  <GenericSelect label="Drive Type" value={driveType} onChange={setDriveType} options={shutterLookups.driveTypes} />
                  <GenericSelect label="Control Side" value={controlSide} onChange={setControlSide} options={shutterLookups.controlSides} />
                  <GenericSelect label="Door Checks Type" value={doorChecksTypeI} onChange={setDoorChecksTypeI} options={shutterLookups.doorChecks} />
                  
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 accent-[#eab676]" checked={imposeArbour} onChange={e => setImposeArbour(e.target.checked)} />
                      Impose 60mm arbour
                    </label>
                  </div>

                  <div className="col-span-1 sm:col-span-2 border-t border-gray-800/60 my-2"></div>

                  <GenericSelect label="Box Type" value={boxType} onChange={setBoxType} options={shutterLookups.boxTypes} />
                  <ColorSelect label="Outer Box Color" value={outerBoxColor} onChange={setOuterBoxColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Other Box Color" value={otherBoxColor} onChange={setOtherBoxColor} groupedOptions={groupedColors} />
                  <GenericSelect label="Plaster Carrier" value={plasterCarrier} onChange={setPlasterCarrier} options={shutterLookups.plasterCarriers} />

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 accent-[#eab676]" checked={flushMountedSlatIn} onChange={e => setFlushMountedSlatIn(e.target.checked)} />
                      Flush-mounted Slat (In)
                    </label>
                  </div>
                  {flushMountedSlatIn && (
                    <ColorSelect label="Slat Color (In)" value={flushMountedSlatColorIn} onChange={setFlushMountedSlatColorIn} groupedOptions={groupedColors} />
                  )}

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 accent-[#eab676]" checked={flushMountedSlatOut} onChange={e => setFlushMountedSlatOut(e.target.checked)} />
                      Flush-mounted Slat (Out)
                    </label>
                  </div>
                  {flushMountedSlatOut && (
                    <ColorSelect label="Slat Color (Out)" value={flushMountedSlatColorOut} onChange={setFlushMountedSlatColorOut} groupedOptions={groupedColors} />
                  )}

                  <GenericSelect label="Review / Inspection Slat" value={review} onChange={setReview} options={shutterLookups.reviews} />
                  <ColorSelect label="Side Cover Cap Color" value={sideCoverCapColor} onChange={setSideCoverCapColor} groupedOptions={groupedColors} />

                  <div className="col-span-1 sm:col-span-2 border-t border-gray-800/60 my-2"></div>

                  <ColorSelect label="Guide Rails Color" value={guideRailsColor} onChange={setGuideRailsColor} groupedOptions={groupedColors} />
                  <GenericSelect label="Guide Rails Cutting" value={guideRailsCutting} onChange={setGuideRailsCutting} options={shutterLookups.guideRailsCuttings} />
                  <GenericSelect label="Extreme Left Guide Rail" value={extremeLeftGuideRail} onChange={setExtremeLeftGuideRail} options={[{value: 'STD', label: 'Standard'}]} />
                  <GenericSelect label="Extreme Right Guide Rail" value={extremeRightGuideRail} onChange={setExtremeRightGuideRail} options={[{value: 'STD', label: 'Standard'}]} />
                  <GenericSelect label="Guide Rails Type" value={guideRailsTypes} onChange={setGuideRailsTypes} options={shutterLookups.guideRailsTypes} />

                  <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 accent-[#eab676]" checked={guideRailGasketing} onChange={e => setGuideRailGasketing(e.target.checked)} />
                      Guide rail gasketing
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 accent-[#eab676]" checked={soundproofMat} onChange={e => setSoundproofMat(e.target.checked)} />
                      Soundproof mat + gasket
                    </label>
                  </div>
                </div>
              )}
            </div>
          </AccordionSection>

          {/* 6. Installation & Accessories */}
          <AccordionSection
            id="installation"
            title="6. Extras & Accessories"
            summary={getInstallationSummary()}
            isOpen={activeAccordion === 'installation'}
            onToggle={() => setActiveAccordion(activeAccordion === 'installation' ? null : 'installation')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Dowel Holes</label>
                  <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                    value={dowelHoles} onChange={e => setDowelHoles(e.target.value)}>
                     <option value="">Lack (-)</option>
                     <option value="O_06">6mm assembly holes (O_06)</option>
                     <option value="O_10">10mm assembly holes (O_10)</option>
                     <option value="ADJUFIX_M16">Assembly holes ADJUFIX 14mm/M16</option>
                     <option value="ADJUFIX_18">Assembly holes ADJUFIX 14mm/18mm</option>
                  </select>
                </div>

                {dowelHoles && (
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Locations</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-305 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#eab676]" checked={dowelLeft} onChange={e => setDowelLeft(e.target.checked)} />
                        Left
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-305 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#eab676]" checked={dowelRight} onChange={e => setDowelRight(e.target.checked)} />
                        Right
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-305 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#eab676]" checked={dowelTop} onChange={e => setDowelTop(e.target.checked)} />
                        Top
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-305 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#eab676]" checked={dowelBottom} onChange={e => setDowelBottom(e.target.checked)} />
                        Bottom
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2 border-t border-gray-800/60 my-2"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Grille Type</label>
                  <select className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px]"
                    value={grilleType} onChange={e => setGrilleType(e.target.value)}>
                     <option value="">None</option>
                     <optgroup label="Internal Grilles (Międzyszybowe)">
                       <option value="SPR08">SPR08 (8mm Internal)</option>
                       <option value="SPR18">SPR18 (18mm Internal)</option>
                       <option value="SPR26">SPR26 (26mm Internal)</option>
                       <option value="SPR45">SPR45 (45mm Internal)</option>
                     </optgroup>
                     <optgroup label="Stick-on Grilles (Naklejane)">
                       <option value="SPRN27">SPRN27 (27mm Stick-on)</option>
                       <option value="SPRN45">SPRN45 (45mm Stick-on)</option>
                     </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wide">Number of Fields</label>
                  <input type="number" className="w-full bg-mammut-black border border-gray-800 rounded-xl p-3 text-mammut-white text-sm focus:border-mammut-gold focus:outline-none h-[50px] disabled:opacity-50"
                    value={grilleFields} onChange={e => setGrilleFields(Number(e.target.value))} disabled={!grilleType} min={1} max={30} />
                </div>
              </div>
            </div>
          </AccordionSection>

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mammut-black text-mammut-white p-3 sm:p-6 pt-24 sm:pt-32 relative pb-[90px] md:pb-6">
      {arPlacement && (
         <ArViewer sceneGroup={sceneGroup?.group || null} placement={arPlacement} onClose={() => setArPlacement(null)} />
      )}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      {/* 3-column Layout grid */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr_400px] gap-8">
        {renderLeftColumn()}
        {renderMiddleColumn()}
        {!isMobile && renderRightColumn()}
      </div>

      {/* Mobile-only drawers and bars */}
      {renderMobileDrawer()}
      {renderStickyBottomBar()}
    </div>
  );
}