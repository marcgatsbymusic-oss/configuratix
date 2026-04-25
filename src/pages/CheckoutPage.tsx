import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Check } from 'lucide-react';

export function CheckoutPage() {
   const { items, getCartTotal, clearCart } = useCartStore();
   const navigate = useNavigate();
   const [step, setStep] = useState(1);
   const [isProcessing, setIsProcessing] = useState(false);

   useEffect(() => {
       if (items.length === 0 && step !== 3) {
           navigate('/shop');
       }
   }, [items, navigate, step]);

   const handleSimulatePayment = () => {
       setIsProcessing(true);
       setTimeout(() => {
           setIsProcessing(false);
           setStep(3);
           clearCart();
       }, 2000);
   };

   if (step === 3) {
       return (
           <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
               <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl p-12 text-center animate-fade-in border border-gray-100">
                   <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                       <Check size={48} strokeWidth={3} />
                   </div>
                   <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight mb-4">Order Confirmed!</h1>
                   <p className="text-gray-500 font-medium mb-8 text-lg">Your high-fidelity Drutex custom windows are entering production.</p>
                   <div className="bg-gray-50 rounded-xl p-6 mb-10 text-left border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Order Reference</span>
                          <span className="text-sm font-black text-black">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Est. Delivery</span>
                          <span className="text-sm font-black text-mammut-gold">14 - 21 Business Days</span>
                      </div>
                   </div>
                   <button onClick={() => navigate('/shop')} className="bg-mammut-black text-mammut-white hover:bg-gray-800 transition-colors px-12 py-4 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-black/20">
                      Continue Shopping
                   </button>
               </div>
           </div>
       );
   }

   const subtotal = getCartTotal();
   const shipping = 199.00;
   const discount = subtotal > 2000 ? subtotal * 0.1 : 0;
   const total = subtotal + shipping - discount;

   return (
       <div className="min-h-screen bg-gray-50 pt-24 pb-32 font-sans">
           <div className="max-w-screen-xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
               
               {/* Left Checkout Forms */}
               <div className="flex-1">
                   <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors mb-10">
                       <ArrowLeft size={16} /> Returns to Shop
                   </button>
                   
                   <div className="flex items-center gap-4 mb-8">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-mammut-black text-mammut-white shadow-lg shadow-black/30' : 'bg-gray-200 text-gray-400'}`}>1</div>
                       <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-mammut-black' : 'bg-gray-200'}`}></div>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-mammut-black text-mammut-white shadow-lg shadow-black/30' : 'bg-gray-200 text-gray-400'}`}>2</div>
                       <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-mammut-black' : 'bg-gray-200'}`}></div>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-mammut-black text-mammut-white shadow-lg shadow-black/30' : 'bg-gray-200 text-gray-400'}`}>3</div>
                   </div>

                   {step === 1 && (
                       <div className="animate-fade-in space-y-6">
                           <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-6">Shipping Details</h2>
                           <div className="grid grid-cols-2 gap-6">
                               <input type="text" placeholder="First Name" className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                               <input type="text" placeholder="Last Name" className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                               <input type="email" placeholder="Email Address" className="col-span-2 w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                               <input type="text" placeholder="Shipping Address" className="col-span-2 w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                               <input type="text" placeholder="City" className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                               <input type="text" placeholder="Postal Code" className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-black outline-none transition-colors" />
                           </div>
                           <button onClick={() => setStep(2)} className="w-full bg-mammut-black text-mammut-white hover:bg-gray-800 transition-all hover:-translate-y-1 block mt-8 px-8 py-5 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-black/20 text-center">
                              Proceed to Payment
                           </button>
                       </div>
                   )}

                   {step === 2 && (
                       <div className="animate-slide-left space-y-6">
                           <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-6">Secure Payment</h2>
                           <div className="bg-white border-2 border-black rounded-xl p-6 relative overflow-hidden shadow-sm">
                               <div className="absolute top-0 right-0 p-4 opacity-10">
                                  <ShieldCheck size={100} />
                               </div>
                               <div className="flex gap-4 items-center mb-8 relative z-10">
                                   <CreditCard size={24} className="text-black" /> 
                                   <span className="font-bold text-black uppercase tracking-widest">Credit Card</span>
                               </div>
                               <input type="text" placeholder="Card Number (Demo)" defaultValue="4242 4242 4242 4242" className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:border-black outline-none transition-colors mb-4 relative z-10 font-mono tracking-widest text-lg" />
                               <div className="grid grid-cols-2 gap-4 relative z-10">
                                   <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:border-black outline-none transition-colors font-mono" />
                                   <input type="text" placeholder="CVC" defaultValue="123" className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:border-black outline-none transition-colors font-mono" />
                               </div>
                           </div>
                           
                           <button onClick={handleSimulatePayment} disabled={isProcessing} className="w-full bg-[#fcd34d] text-black hover:bg-[#fbbf24] transition-all hover:-translate-y-1 mt-8 px-8 py-5 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-[#fcd34d]/30 text-center flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none">
                              {isProcessing ? <ShieldCheck className="animate-pulse" /> : <ShieldCheck />}
                              {isProcessing ? 'Processing Securely...' : `Pay ${total.toFixed(2)} €`}
                           </button>
                       </div>
                   )}
               </div>

               {/* Right Receipt Order Summary */}
               <div className="w-full lg:w-[450px]">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sticky top-32 overflow-hidden flex flex-col max-h-[80vh]">
                     <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                         <ShoppingBag size={20} className="text-black" />
                         <h3 className="font-extrabold text-black uppercase tracking-widest">Order Summary</h3>
                     </div>
                     <div className="p-8 flex-1 overflow-y-auto space-y-6">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-16 h-20 bg-white border border-gray-100 shadow-sm rounded-lg p-1.5 relative">
                                   <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                   <span className="absolute -top-2 -right-2 bg-mammut-black text-mammut-white text-[10px] w-5 h-5 flex flex-col items-center justify-center rounded-full font-bold shadow-md">{item.quantity}</span>
                                </div>
                                <div className="flex-1">
                                   <h4 className="text-xs font-extrabold uppercase text-black mb-1">{item.name}</h4>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{item.type} / {item.material}</p>
                                   <p className="text-xs font-black text-black">{(item.price * item.quantity).toFixed(2)} {item.currency}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                     <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                            <span className="text-sm font-black text-black">{subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Freight Shipping</span>
                            <span className="text-sm font-black text-black">{shipping.toFixed(2)} €</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-green-600">
                                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">Discount (Volume)</span>
                                <span className="text-sm font-black">-{discount.toFixed(2)} €</span>
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-extrabold text-black uppercase tracking-widest">Total</span>
                            <span className="text-2xl font-black text-mammut-gold">{total.toFixed(2)} €</span>
                        </div>
                     </div>
                  </div>
               </div>

           </div>
       </div>
   );
}
