import { Trash2, Plus, Minus, Home } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSessionStore } from '../../store/useSessionStore';

interface Props {
  onClose: () => void; // Used for "Start new window with previous settings"
  onCheckout: () => void;
}

export function CartDashboard({ onClose, onCheckout }: Props) {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { name, email } = useSessionStore();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-mammut-darker animate-fade-in overflow-y-auto w-full max-w-[100vw]">
      {/* Header */}
      <div className="bg-mammut-dark border-b border-mammut-border sticky top-0 z-10 w-full px-4 sm:px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-mammut-white uppercase tracking-widest">{name}'s Project</h1>
          <p className="text-mammut-white/50 text-sm font-medium">{email}</p>
        </div>
        <button onClick={onClose} className="bg-[#2a2a2b] hover:bg-[#3a3a3b] text-mammut-white px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm text-sm border border-white/5">
          <Home size={18} /> Return to Configurator
        </button>
      </div>

      {/* Cart Content */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex-1 relative z-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <h2 className="text-3xl font-black text-mammut-gold uppercase tracking-tighter">Your Windows ({items.length})</h2>
          <button onClick={onClose} className="bg-mammut-gold !text-black hover:bg-[#ffc882] hover:scale-105 active:scale-95 px-6 py-3.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,182,118,0.2)] flex items-center gap-3 text-sm">
            <Plus size={18} strokeWidth={3} /> Configure Another Window
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-mammut-dark rounded-3xl border border-mammut-border shadow-inner mb-20">
            <p className="text-mammut-white/40 font-medium mb-8 text-lg">Your project is currently empty.</p>
            <button onClick={onClose} className="bg-mammut-gold !text-black px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors shadow-lg shadow-[#eab676]/10">Start Configuring</button>
          </div>
        ) : (
          <div className="grid gap-6 mb-24">
            {items.map((item, idx) => (
              <div key={item.id} className="bg-mammut-dark rounded-2xl border border-mammut-border p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start relative group hover:border-mammut-border transition-colors shadow-sm">
                
                {/* Delete Button */}
                <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 p-2 text-mammut-white/20 hover:text-red-500 bg-mammut-darker rounded-lg transition-colors border border-white/5" title="Remove window">
                  <Trash2 size={18} />
                </button>

                <div className="w-full lg:w-40 h-40 bg-mammut-darker rounded-xl flex items-center justify-center p-6 border border-mammut-border shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                </div>
                
                <div className="flex-1 w-full pt-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded bg-mammut-gold text-[#111112] text-xs font-black flex items-center justify-center shadow-[0_0_10px_rgba(234,182,118,0.3)]">{idx + 1}</span>
                    <h3 className="text-xl font-black text-mammut-white">{item.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                    {item.details?.map((detail, dIdx) => (
                      <div key={dIdx} className="text-sm font-medium text-mammut-white/60 flex items-center gap-3 bg-mammut-darker p-2 px-3 rounded-lg border border-mammut-border">
                        <div className="w-1.5 h-1.5 rounded-full bg-mammut-gold drop-shadow-[0_0_4px_rgba(234,182,118,0.5)]"></div> {detail}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-48 flex lg:flex-col items-center justify-between lg:items-end gap-6 shrink-0 border-t lg:border-t-0 border-mammut-border pt-6 lg:pt-0 mt-2 lg:mt-0 lg:h-full lg:min-h-[160px]">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-mammut-gold uppercase tracking-[0.2em] mb-1">Unit Price</div>
                    <div className="text-2xl font-black text-mammut-white">€{item.price.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-4 bg-mammut-darker border border-mammut-border rounded-xl p-1.5 shadow-inner mt-auto">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-12 h-12 flex items-center justify-center text-mammut-white/50 hover:text-mammut-gold hover:bg-[#2a2a2b] rounded-lg transition-colors disabled:opacity-30" disabled={item.quantity <= 1}>
                      <Minus size={18} strokeWidth={3} />
                    </button>
                    <span className="font-black text-mammut-white text-lg w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-12 h-12 flex items-center justify-center text-mammut-gold hover:bg-[#2a2a2b] rounded-lg transition-colors">
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Checkout */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-mammut-dark border-t border-mammut-gold/20 py-5 px-6 md:px-12 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-black text-mammut-gold uppercase tracking-[0.2em] mb-1">Total Project Value</div>
              <div className="text-4xl md:text-5xl font-black text-mammut-white tracking-tighter drop-shadow-lg">€{getCartTotal().toFixed(2)}</div>
            </div>
            
            <button onClick={onCheckout} className="w-full md:w-auto bg-mammut-gold !text-black px-14 py-5 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,182,118,0.4)] flex items-center justify-center gap-3">
              Request Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
