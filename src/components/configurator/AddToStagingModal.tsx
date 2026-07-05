import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useStagingStore } from '../../store/useStagingStore';
import { CONFIG_SCHEMA, PROFILE_GLAZING_LIMITS } from '../SlateConfigurator/types';

interface AddToStagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any; // Pass the current configurator state
  defaultProfile?: string;
}

export function AddToStagingModal({ isOpen, onClose, config, defaultProfile = 'IGLO 5 F252' }: AddToStagingModalProps) {
  const stagingAreas = useStagingStore(state => state.areas);
  const addWindowToArea = useStagingStore(state => state.addWindowToArea);
  const setClonedWindow = useStagingStore(state => state.setClonedWindow);

  const ig5GlazingIds = PROFILE_GLAZING_LIMITS['IG5']?.packages || [];
  const ig5Glazings = CONFIG_SCHEMA.glazing.filter(g => ig5GlazingIds.includes(g.id));

  const [selectedAreaId, setSelectedAreaId] = useState(stagingAreas[0]?.id || 'pilar_stq');
  const [windowName, setWindowName] = useState('');
  const [profileName, setProfileName] = useState(defaultProfile);
  const [glazing, setGlazing] = useState(ig5Glazings[0]?.name || ig5Glazings[0]?.id || '');
  const [blindBox, setBlindBox] = useState(false);
  const [motor, setMotor] = useState(false);
  const [mosquito, setMosquito] = useState(false);
  const [cloneConfig, setCloneConfig] = useState(true);
  const [uwValue, setUwValue] = useState('0.85 W/m²K');
  
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setProfileName(defaultProfile);
      setWindowName('');
      setBlindBox(config?.blindBox ?? false);
      setMotor(config?.motor ?? false);
      setMosquito(config?.mosquito ?? false);
      setUwValue(config?.uwValue ?? '0.85 W/m²K');
      setGlazing(config?.glazing || ig5Glazings[0]?.name || ig5Glazings[0]?.id || '');
      setIsSuccess(false);
    }
  }, [isOpen, defaultProfile, config]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!windowName.trim()) {
      alert("Please enter a window name");
      return;
    }

    addWindowToArea(selectedAreaId, {
      name: windowName,
      profile: profileName,
      glazing,
      blindBox,
      motor,
      mosquito,
      config,
      image: '/iglo_edge_preview.svg',
      uwValue
    });

    if (cloneConfig) {
      setClonedWindow({
        name: windowName + ' (Clone)',
        profile: profileName,
        glazing,
        blindBox,
        motor,
        mosquito,
        config,
        uwValue
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setWindowName('');
      setBlindBox(false);
      setMotor(false);
      setMosquito(false);
      setUwValue('0.85 W/m²K');
      setGlazing(ig5Glazings[0]?.name || ig5Glazings[0]?.id || '');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-mammut-gold mb-6 border-b border-white/10 pb-4">
          Add to Staging Area
        </h2>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-green-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center border border-green-400/30">
              <Check size={32} />
            </div>
            <p className="font-bold text-lg">Added Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Send To (Staging Area)</label>
              <select 
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-mammut-gold transition-colors"
              >
                {stagingAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Window Name</label>
              <input 
                type="text"
                placeholder="e.g. Living Room Front"
                value={windowName}
                onChange={(e) => setWindowName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-mammut-gold transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Profile Name</label>
              <input 
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-mammut-gold transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Type of Glazing</label>
              <select 
                value={glazing}
                onChange={(e) => setGlazing(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-mammut-gold transition-colors"
              >
                {ig5Glazings.map(g => (
                  <option key={g.id} value={g.name || g.id}>
                    {g.name || g.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Uw Value</label>
              <input 
                type="text"
                placeholder="e.g. 0.85 W/m²K"
                value={uwValue}
                onChange={(e) => setUwValue(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-mammut-gold transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={blindBox} onChange={(e) => setBlindBox(e.target.checked)} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${blindBox ? 'bg-mammut-gold text-black' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    {blindBox && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <span className="text-sm text-gray-300">Blind Box</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={motor} onChange={(e) => setMotor(e.target.checked)} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${motor ? 'bg-mammut-gold text-black' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    {motor && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <span className="text-sm text-gray-300">Motor</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={mosquito} onChange={(e) => setMosquito(e.target.checked)} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${mosquito ? 'bg-mammut-gold text-black' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    {mosquito && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <span className="text-sm text-gray-300">Mosquito Net</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group mt-4 pt-4 border-t border-white/10">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={cloneConfig} onChange={(e) => setCloneConfig(e.target.checked)} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${cloneConfig ? 'bg-[#10b981] text-white' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    {cloneConfig && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-200">Clone Configuration</span>
                  <span className="text-[10px] text-gray-400">Keep these exact measurements and options for the next window</span>
                </div>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full mt-6 bg-mammut-gold hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(234,182,118,0.3)]"
            >
              Add to Staging List
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
