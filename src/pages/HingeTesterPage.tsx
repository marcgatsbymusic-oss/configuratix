import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HingeTester } from '../components/configurator/HingeTester';
import { ArrowLeft } from 'lucide-react';

export const HingeTesterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col bg-[#08080f] overflow-hidden">
      {/* Mini Header */}
      <div className="h-12 border-b border-white/5 bg-[#0b0c16] flex items-center px-4 justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/configurator-test')}
            className="flex items-center justify-center p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 text-white/70 hover:text-white transition-all active:scale-95"
            title="Back to Configurator Test"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-yellow-500 tracking-widest">
              Drutex CAD Lab
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Bottom Hinge Right
            </span>
          </div>
        </div>

        <div className="text-[9px] font-black uppercase tracking-wider text-white/25">
          WebGL Rotation Tester v1.0
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow relative overflow-hidden">
        <HingeTester />
      </div>
    </div>
  );
};
