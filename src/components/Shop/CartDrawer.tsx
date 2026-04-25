import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
      toggleCart();
      navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[500] flex justify-end font-sans">
      <div className="absolute inset-0 bg-mammut-black/40 backdrop-blur-sm animate-fade-in" onClick={toggleCart} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left z-10 border-l border-gray-100">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-black" />
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-black">Your Cart</h2>
           </div>
           <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
           {items.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <span className="text-sm font-bold uppercase tracking-widest">Cart is empty</span>
               </div>
           ) : (
               items.map(item => (
                   <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm group">
                      <div className="w-20 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                         {item.image ? (
                             <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                         ) : (
                             <ShoppingBag size={20} className="text-gray-300" />
                         )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start">
                               <h4 className="text-sm font-extrabold text-black uppercase">{item.name}</h4>
                               <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                   <X size={16} />
                               </button>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#b48017] mb-1 block">{item.type}</span>
                            <span className="text-xs text-gray-500 font-medium">{item.width} x {item.height} mm</span>
                         </div>
                         
                         <div className="flex justify-between items-center mt-3">
                             {item.config ? (
                                <div className="flex items-center border border-gray-200 rounded-md">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"><Minus size={14}/></button>
                                    <span className="px-3 text-xs font-bold text-black border-x border-gray-200">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"><Plus size={14}/></button>
                                </div>
                             ) : (
                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                                    Qty 1: Unique Item
                                </div>
                             )}
                             <span className="text-sm font-black text-black">{(item.price * item.quantity).toFixed(2)} €</span>
                         </div>
                      </div>
                   </div>
               ))
           )}
        </div>

        {items.length > 0 && (
           <div className="bg-gray-50 p-6 border-t border-gray-200 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                 <span className="text-2xl font-black text-mammut-gold">{getCartTotal().toFixed(2)} €</span>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-medium">Taxes and shipping are explicitly calculated at checkout validation.</p>
              
              <button onClick={handleCheckout} className="w-full bg-mammut-black text-mammut-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-xl shadow-black/20">
                 Proceed to Checkout <ArrowRight size={18} />
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
