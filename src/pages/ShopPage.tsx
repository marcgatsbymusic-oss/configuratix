import { useState, useMemo, useEffect } from 'react';
import productsData from '../data/outlet_products.json';
import { ShoppingCart, Heart, Search, ChevronLeft, ChevronRight, X, Maximize2, Filter, Image as ImageIcon } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const ReservationTimer = ({ item, onExpire }: { item: any; onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!item?.addedAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - item.addedAt;
      const remaining = (10 * 60 * 1000) - elapsed;
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [item, onExpire]);

  if (timeLeft <= 0) return null;
  const mins = Math.floor(timeLeft / 60000).toString().padStart(2, '0');
  const secs = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');

  return (
    <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center font-black uppercase tracking-widest py-2 z-20 shadow-lg">
       Reserved: {mins}:{secs}
    </div>
  );
};

const safeProducts = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

export function ShopPage() {
  const { items, addItem, toggleCart } = useCartStore();
  
  const [filterType, setFilterType] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Extract unique filters
  const optType = [...new Set(safeProducts.map((p: any) => p.type))].filter(Boolean) as string[];
  const optMat = [...new Set(safeProducts.map((p: any) => p.material))].filter(Boolean) as string[];

  // Reactive Grid
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p: any) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType && p.type !== filterType) return false;
      if (filterMaterial && p.material !== filterMaterial) return false;
      return true;
    });
  }, [searchQuery, filterType, filterMaterial]);

  // Handlers
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addItem({ ...product, image: product.localImages?.[0] || '', quantity: 1 });
    setQuickViewProduct(null);
  };

  const openQuickView = (product: any) => {
    setQuickViewProduct(product);
    setGalleryIndex(0);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quickViewProduct?.localImages) setGalleryIndex(prev => (prev + 1) % quickViewProduct.localImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quickViewProduct?.localImages) setGalleryIndex(prev => (prev - 1 + quickViewProduct.localImages.length) % quickViewProduct.localImages.length);
  };

  const totalCartItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen font-sans selection:bg-black selection:text-white pt-24 pb-32">
      
      {/* Premium Header Menu */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-extrabold tracking-tight uppercase text-black">Outlet Store</h1>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase hidden sm:block">Drutex Certified</span>
          </div>
          
          <button onClick={toggleCart} className="relative p-2 text-gray-800 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
            <ShoppingCart size={24} />
            {totalCartItems > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-black text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Shopify Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sticky top-40">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-100">
               <Filter size={18} className="text-gray-400" />
               <h3 className="font-bold text-sm tracking-widest uppercase text-black">Filter Attributes</h3>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Search Collection</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Model name..." className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Product Type</label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="type" id="all-type" checked={filterType === ''} onChange={() => setFilterType('')} className="accent-black w-4 h-4" />
                    <label htmlFor="all-type" className="text-sm font-medium text-gray-700 cursor-pointer">All Types</label>
                  </div>
                  {optType.map(o => (
                    <div key={o} className="flex items-center gap-3">
                      <input type="radio" name="type" id={`type-${o}`} checked={filterType === o} onChange={() => setFilterType(o)} className="accent-black w-4 h-4 cursor-pointer" />
                      <label htmlFor={`type-${o}`} className="text-sm font-medium text-gray-600 cursor-pointer">{o}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Frame Material</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="mat" id="all-mat" checked={filterMaterial === ''} onChange={() => setFilterMaterial('')} className="accent-black w-4 h-4" />
                    <label htmlFor="all-mat" className="text-sm font-medium text-gray-700 cursor-pointer">Any Material</label>
                  </div>
                  {optMat.map(o => (
                    <div key={o} className="flex items-center gap-3">
                      <input type="radio" name="mat" id={`mat-${o}`} checked={filterMaterial === o} onChange={() => setFilterMaterial(o)} className="accent-black w-4 h-4 cursor-pointer" />
                      <label htmlFor={`mat-${o}`} className="text-sm font-medium text-gray-600 cursor-pointer">{o}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-gray-500">Showing <b className="text-black">{filteredProducts.length}</b> variants</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-black/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => openQuickView(product)}
              >
                {/* Image-First Display */}
                <div className="relative aspect-[4/5] bg-[#f8f9fa] overflow-hidden flex items-center justify-center p-6">
                  {items.some(i => i.id === product.id) && (
                      <ReservationTimer 
                          item={items.find(i => i.id === product.id)} 
                          onExpire={() => useCartStore.getState().removeItem(product.id)} 
                      />
                  )}
                  {product.localImages?.[0] ? (
                    <img 
                      src={product.localImages[0]} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center">
                      <Maximize2 size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-gray-400 hover:text-red-500 shadow-sm">
                     <Heart size={18} />
                  </div>

                  <div className="absolute bottom-4 inset-x-4 z-10">
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={items.some(i => i.id === product.id)}
                      className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-lg opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-gray-800 shadow-lg disabled:opacity-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {items.some(i => i.id === product.id) ? 'In Cart' : 'Quick Add'}
                    </button>
                  </div>
                </div>

                {/* Data Sheet / Meta */}
                <div className="p-5 flex flex-col flex-1 border-t border-gray-50">
                   <div className="flex justify-between items-start mb-2">
                     <h2 className="text-sm font-extrabold text-black uppercase tracking-tight">{product.name}</h2>
                     <span className="text-sm font-black text-[#eab676] bg-[#fcd34d]/10 px-2 py-0.5 rounded">{product.price} €</span>
                   </div>
                   <div className="text-xs text-gray-400 font-medium space-x-2 truncate mb-4">
                      <span>{product.type}</span>
                      <span>•</span>
                      <span>{product.material}</span>
                      <span>•</span>
                      <span>{product.width}x{product.height}mm</span>
                   </div>
                   
                   <div className="mt-auto grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 border border-gray-100 rounded p-2 flex flex-col items-center justify-center">
                         <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Outer Color</span>
                         <span className="text-[10px] text-gray-800 font-bold text-center truncate w-full" title={product.outerColor}>{product.outerColor || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded p-2 flex flex-col items-center justify-center">
                         <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Inner Color</span>
                         <span className="text-[10px] text-gray-800 font-bold text-center truncate w-full" title={product.innerColor}>{product.innerColor || 'N/A'}</span>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
              <div className="w-full text-center py-32 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                  <h3 className="text-xl font-bold text-black mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search query.</p>
              </div>
          )}
        </main>
      </div>

      {/* Extreme Full-Screen Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setQuickViewProduct(null)}>
          
          <button onClick={() => setQuickViewProduct(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[210]">
             <X size={40} strokeWidth={1.5} />
          </button>

          <div 
            className="bg-transparent w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col lg:flex-row shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: MASSIVE Image Viewer */}
            <div className="flex-1 relative flex items-center justify-center p-8 lg:p-16 h-full">
                {items.some(i => i.id === quickViewProduct.id) && (
                     <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                         <ReservationTimer 
                             item={items.find(i => i.id === quickViewProduct.id)} 
                             onExpire={() => {
                                 useCartStore.getState().removeItem(quickViewProduct.id);
                                 setQuickViewProduct(null);
                             }} 
                         />
                     </div>
                )}
                {quickViewProduct.localImages?.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-6 lg:left-12 p-5 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur transition-all border border-white/20 hover:scale-110 z-10">
                            <ChevronLeft size={36} strokeWidth={1.5} />
                        </button>
                        <button onClick={nextImage} className="absolute right-6 lg:right-12 p-5 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur transition-all border border-white/20 hover:scale-110 z-10">
                            <ChevronRight size={36} strokeWidth={1.5} />
                        </button>
                    </>
                )}
                
                {quickViewProduct.localImages?.[0] ? (
                  <img 
                    src={quickViewProduct.localImages[galleryIndex]} 
                    alt="Massive Preview" 
                    className="w-full h-full max-h-[85vh] object-contain drop-shadow-2xl" 
                  />
                ) : (
                  <div className="text-white/20 flex flex-col items-center">
                      <ImageIcon size={100} strokeWidth={1} className="mb-6" />
                      <span className="text-xl font-medium tracking-widest uppercase">Asset Unavailable</span>
                  </div>
                )}
                
                {quickViewProduct.localImages?.length > 1 && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/50 border border-white/20 text-white px-6 py-2.5 rounded-full font-bold tracking-widest text-sm backdrop-blur">
                        {galleryIndex + 1} / {quickViewProduct.localImages.length}
                    </div>
                )}
            </div>

            {/* Right: Commerce Meta Panel */}
            <div className="w-full lg:w-[450px] bg-white rounded-3xl lg:rounded-r-none m-4 lg:m-0 lg:ml-auto shadow-2xl flex flex-col flex-shrink-0 animate-slide-up lg:animate-slide-left z-20 max-h-[80vh] lg:max-h-full">
               <div className="p-10 flex-1 overflow-y-auto">
                   <button onClick={() => setQuickViewProduct(null)} className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 text-sm font-bold uppercase tracking-widest transition-colors w-max">
                      <ChevronLeft size={16} strokeWidth={3} /> Back to Catalog
                   </button>
                   <br />
                   <div className="inline-block bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 mt-2">
                      {quickViewProduct.type} • Drutex Direct
                   </div>
                   
                   <h2 className="text-4xl font-extrabold text-black uppercase tracking-tight mb-2 leading-none">
                      {quickViewProduct.name}
                   </h2>
                   
                   <div className="text-3xl font-black text-[#eab676] mb-10 pb-10 border-b border-gray-100">
                      {quickViewProduct.price} €
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Technical Dimensions</h4>
                         <div className="flex gap-4">
                            <div className="bg-gray-50 flex-1 rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center">
                               <span className="text-lg font-black text-black">{quickViewProduct.width}</span>
                               <span className="text-xs font-bold text-gray-500">Width (mm)</span>
                            </div>
                            <div className="bg-gray-50 flex-1 rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center">
                               <span className="text-lg font-black text-black">{quickViewProduct.height}</span>
                               <span className="text-xs font-bold text-gray-500">Height (mm)</span>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-4">
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Configuration</h4>
                          <div className="flex justify-between items-center bg-gray-50 px-5 py-3 rounded-lg border border-gray-100">
                              <span className="text-sm font-semibold text-gray-500 uppercase">Material</span>
                              <span className="text-sm font-black text-black uppercase">{quickViewProduct.material}</span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50 px-5 py-3 rounded-lg border border-gray-100">
                              <span className="text-sm font-semibold text-gray-500 uppercase">Kinematics</span>
                              <span className="text-sm font-black text-black uppercase">{quickViewProduct.openability}</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#fcd34d]/10 px-5 py-3 rounded-lg border border-[#fcd34d]/30">
                              <span className="text-sm font-semibold text-[#b48017] uppercase">Outer Finish</span>
                              <span className="text-xs font-black text-black uppercase truncate max-w-[180px] text-right" title={quickViewProduct.outerColor}>{quickViewProduct.outerColor}</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#fcd34d]/10 px-5 py-3 rounded-lg border border-[#fcd34d]/30">
                              <span className="text-sm font-semibold text-[#b48017] uppercase">Inner Finish</span>
                              <span className="text-xs font-black text-black uppercase truncate max-w-[180px] text-right" title={quickViewProduct.innerColor}>{quickViewProduct.innerColor}</span>
                          </div>
                      </div>
                   </div>
               </div>

               <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                  <button 
                     onClick={(e) => handleAddToCart(e, quickViewProduct)}
                     disabled={items.some(i => i.id === quickViewProduct.id)}
                     className="w-full bg-black text-white text-sm font-bold uppercase tracking-widest py-5 rounded-xl transition-all hover:bg-gray-800 hover:-translate-y-1 shadow-2xl shadow-black/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                     <ShoppingCart size={20} /> {items.some(i => i.id === quickViewProduct.id) ? 'Added to Cart' : 'Add to Cart — ' + quickViewProduct.price + ' €'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
