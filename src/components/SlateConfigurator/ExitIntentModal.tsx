import React from 'react';
import { Phone, Mail, Bot, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExitIntentModalProps {
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ onClose, onConfirmExit }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-[#1a1a1b] border border-[#2a2a2b] rounded-3xl w-full max-w-lg shadow-2xl p-1 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="p-8 pb-6">
          <h2 className="text-3xl font-black text-[#f1f5f9] mb-6 tracking-tight leading-tight">{t('help.leaveConf', '¿Salir del configurador?')}</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#eab676]/20 border border-[#eab676]/40 flex items-center justify-center text-[#eab676] flex-shrink-0">
               <Bot size={32} />
            </div>
            <p className="text-[#f1f5f9] text-lg leading-snug font-medium">
              {t('help.stillQuestions', '¿Tienes todavía preguntas sobre tu pedido o el configurador?')}
            </p>
          </div>

          <div className="bg-[#111112] rounded-2xl p-6 border border-[#2a2a2b] mb-8">
            <p className="text-[#f1f5f9] mb-5 font-medium leading-relaxed">
              {t('help.csTeam', 'Nuestro equipo de atención al cliente (y nuestro Asistente de IA) estará encantado de asesorarte gratuitamente:')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white border-b border-[#2a2a2b] pb-4">
                <Phone className="text-[#eab676]" size={20} />
                <span className="font-bold text-lg text-[#f1f5f9]">900 75 11 75</span>
                <span className="text-white/60 text-sm font-medium">{t('help.monFri', '(de lunes a viernes de 8:00 a 18:00)')}</span>
              </div>
              
              <div className="flex items-center gap-3 text-white border-b border-[#2a2a2b] pb-4">
                <Mail className="text-[#eab676]" size={20} />
                <span className="font-medium text-lg text-[#f1f5f9]">info@ventanas.es</span>
              </div>

              <div className="flex items-center gap-3 text-white pt-2">
                <Bot className="text-[#eab676]" size={20} />
                <span className="font-bold text-lg text-[#eab676]">{t('help.aiAssist', 'Asistente de IA')}</span>
                <span className="text-white/60 text-sm font-medium">{t('help.avail247', '(Disponible 24/7)')}</span>
              </div>
            </div>
          </div>

          <p className="text-[#f1f5f9] text-sm font-medium italic mb-6">
            {t('help.exitWarning', 'Al salir del configurador, se perderá tu selección anterior.')}
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onClose}
              className="w-full py-4 px-6 rounded-xl bg-[#eab676] text-black font-black hover:bg-[#F3C47F] transition-all text-lg shadow-lg shadow-[#eab676]/20"
            >
              {t('help.continueConf', 'Continuar en el configurador')}
            </button>
            <button 
              onClick={onConfirmExit}
              className="w-full py-4 px-6 rounded-xl border border-[#3a3a3b] text-[#f1f5f9] font-bold hover:bg-[#2a2a2b] hover:border-[#4a4a4b] hover:text-white transition-all text-lg"
            >
              {t('help.exitConf', 'Salir del configurador')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
