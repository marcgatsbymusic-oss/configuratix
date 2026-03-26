import { X, CopyPlus, ShoppingCart, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
  onMoreWindows: () => void;
  onCheckout: () => void;
}

export function SaveToCartModal({ onClose, onMoreWindows, onCheckout }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a1a1b] border border-[#2a2a2b] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-8 text-center pt-10">
          <div className="w-16 h-16 bg-[#eab676]/20 rounded-full flex items-center justify-center text-[#eab676] mx-auto mb-6">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Window Saved to Cart!</h2>
          <p className="text-white/60 mb-8 max-w-sm mx-auto">Would you like to configure another window with these exact same settings?</p>
          
          <div className="flex flex-col gap-4">
            <button onClick={onMoreWindows} className="bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors shadow-[0_0_20px_rgba(234,182,118,0.2)] flex items-center justify-center gap-2">
              <CopyPlus size={20} /> Yes, More Windows
            </button>
            <button onClick={onCheckout} className="bg-[#111112] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2a2a2b] transition-colors border border-[#2a2a2b] flex items-center justify-center gap-2">
              <ShoppingCart size={20} /> Bring me directly to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
