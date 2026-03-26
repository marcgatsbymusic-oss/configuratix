import { useState } from 'react';
import { Phone, Mail, Bot, X, Headset } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FloatingHelpMenu = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {showPopup && (
        <div className="bg-[#1a1a1b] border border-[#2a2a2b] shadow-2xl shadow-black/50 rounded-2xl p-6 mb-2 w-80 text-white animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-[#f1f5f9]">{String(t('help.haveQuestions', '¿Tienes alguna pregunta?'))}</h3>
            <button onClick={() => setShowPopup(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-[#111112] rounded-xl p-4 border border-[#2a2a2b] mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#eab676]/20 flex items-center justify-center text-[#eab676]">
                <Headset size={24} />
              </div>
              <div>
                <a href="tel:900751175" className="font-black text-xl text-[#eab676] hover:underline block mb-1">900 75 11 75</a>
                <p className="text-[#f1f5f9] text-xs font-medium">{String(t('help.availableToday', 'Estamos disponibles hoy hasta 18:00.'))}</p>
              </div>
            </div>
            <p className="text-sm mt-3 text-[#f1f5f9] font-medium">{String(t('help.shallWeTalk', '¿Hablamos? Reserva tu llamada ahora.'))}</p>
          </div>
          
          <button className="w-full py-3 px-4 rounded-xl border border-[#eab676] text-[#eab676] font-bold hover:bg-[#eab676] hover:text-black transition-all mb-3 shadow-[0_0_15px_rgba(220,169,92,0.15)]">
            {String(t('help.scheduleMeeting', 'Programar reunión'))}
          </button>
          
          <button className="w-full py-3 px-4 rounded-xl bg-[#eab676] text-black font-bold hover:bg-[#F3C47F] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#eab676]/20">
            <Bot size={20} />
            {String(t('help.aiAssist', 'Asistente de IA'))}
          </button>
        </div>
      )}

      {/* Main floating buttons stack */}
      <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <a href="tel:900751175" className="w-12 h-12 rounded-full bg-[#1a1a1b] border border-[#eab676]/40 flex items-center justify-center text-[#f1f5f9] hover:bg-[#eab676] hover:text-black transition-all shadow-lg" title="Phone">
          <Phone size={20} />
        </a>
        <a href="mailto:info@ventanas.es" className="w-12 h-12 rounded-full bg-[#1a1a1b] border border-[#eab676]/40 flex items-center justify-center text-[#f1f5f9] hover:bg-[#eab676] hover:text-black transition-all shadow-lg" title="Email">
          <Mail size={20} />
        </a>
        <button onClick={() => setShowPopup(true)} className="w-12 h-12 rounded-full bg-[#1a1a1b] border border-[#eab676]/40 flex items-center justify-center text-[#f1f5f9] hover:bg-[#eab676] hover:text-black transition-all shadow-lg" title="AI Chat">
          <Bot size={20} />
        </button>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-5 rounded-lg bg-[#2a2a2b] border border-[#3a3a3b] flex items-center justify-center text-white font-bold hover:bg-[#3a3a3b] transition-all shadow-xl shadow-black/50 tracking-wider text-sm uppercase"
      >
        {isOpen ? <X size={20} /> : String(t('help.up', 'ARRIBA'))}
      </button>
    </div>
  );
};
