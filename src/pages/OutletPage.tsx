import { useState, useMemo, useEffect } from 'react';
import rawOutletData from '../data/outlet_products.json';
import { CalendarClock, X, ChevronDown, Image as ImageIcon, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const parsedData = (rawOutletData as any).default || rawOutletData;
const safeProducts = Array.isArray(parsedData) ? parsedData : (Array.isArray(parsedData?.products) ? parsedData.products : []);

export function OutletPage() {
  const [expandedProduct, setExpandedProduct] = useState<any | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleOpenGallery = (product: any) => {
    setExpandedProduct(product);
    setGalleryIndex(0);
  };

  const nextImage = () => {
      if (expandedProduct?.localImages) {
          setGalleryIndex(prev => (prev + 1) % expandedProduct.localImages.length);
      }
  };

  const prevImage = () => {
      if (expandedProduct?.localImages) {
          setGalleryIndex(prev => (prev - 1 + expandedProduct.localImages.length) % expandedProduct.localImages.length);
      }
  };
  
  // Filters State
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterOpenability, setFilterOpenability] = useState('');
  const [filterOuter, setFilterOuter] = useState('');
  const [filterInner, setFilterInner] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');

  // Sorting & Pagination State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterType, filterOpenability, filterOuter, filterInner, filterMaterial, sortConfig]);

  // Extract unique options dynamically from the loaded JSON catalog
  const optType = [...new Set(safeProducts.map((p: any) => p.type))].filter(Boolean) as string[];
  const optOpen = [...new Set(safeProducts.map((p: any) => p.openability))].filter(Boolean) as string[];
  const optOuter = [...new Set(safeProducts.map((p: any) => p.outerColor))].filter(Boolean) as string[];
  const optInner = [...new Set(safeProducts.map((p: any) => p.innerColor))].filter(Boolean) as string[];
  const optMat = [...new Set(safeProducts.map((p: any) => p.material))].filter(Boolean) as string[];

  // 1. Filter Sequence
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p: any) => {
      if (filterName && !p.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterType && p.type !== filterType) return false;
      if (filterOpenability && p.openability !== filterOpenability) return false;
      if (filterOuter && p.outerColor !== filterOuter) return false;
      if (filterInner && p.innerColor !== filterInner) return false;
      if (filterMaterial && p.material !== filterMaterial) return false;
      return true;
    });
  }, [filterName, filterType, filterOpenability, filterOuter, filterInner, filterMaterial]);

  // 2. Sort Sequence
  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Ensure numerics sort properly
        if (['width', 'height', 'netPrice'].includes(sortConfig.key)) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else {
          aValue = aValue?.toString().toLowerCase() || '';
          bValue = bValue?.toString().toLowerCase() || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  // 3. Pagination Sequence
  const totalPages = Math.ceil(sortedProducts.length / recordsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return sortedProducts.slice(startIndex, startIndex + recordsPerPage);
  }, [sortedProducts, currentPage]);

  const clearFilters = () => {
    setFilterName('');
    setFilterType('');
    setFilterOpenability('');
    setFilterOuter('');
    setFilterInner('');
    setFilterMaterial('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown size={14} className="opacity-0 group-hover:opacity-40 transition-opacity ml-1" />;
    return sortConfig.direction === 'asc' ? <ChevronDown size={14} className="text-[#fcd34d] ml-1" /> : <ChevronUp size={14} className="text-[#fcd34d] ml-1" />;
  };

  return (
    <div className="min-h-screen bg-white text-[#333] pt-32 pb-32 font-sans selection:bg-[#fcd34d] selection:text-black">
      <div className="max-w-screen-xl mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6">
          <div className="flex items-stretch shadow-sm">
            <div className="bg-[#fcd34d] p-5 rounded-tl-lg rounded-bl-lg flex items-center justify-center">
              <CalendarClock size={32} className="text-black" />
            </div>
            <div className="bg-white border-y border-r border-gray-200 py-5 px-8 rounded-tr-lg rounded-br-lg flex items-center">
              <h1 className="text-2xl font-bold text-black tracking-tight">Product List</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-sm font-medium text-gray-800">
              The purchased products are not covered by any warranty or statutory guarantee.
            </span>
            <button className="border border-gray-300 px-8 py-3 rounded text-xs font-bold text-black hover:bg-gray-50 transition-colors uppercase tracking-wider shadow-sm">
              Add to cart
            </button>
          </div>
        </div>

        {/* Dynamic Filters UI */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Product name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Search..."
                  className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none transition-colors text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Product type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none bg-transparent cursor-pointer text-sm font-medium appearance-none">
                <option value="">All Types</option>
                {optType.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Openability</label>
              <select value={filterOpenability} onChange={(e) => setFilterOpenability(e.target.value)} className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none bg-transparent cursor-pointer text-sm font-medium appearance-none">
                <option value="">All</option>
                {optOpen.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Material</label>
              <select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none bg-transparent cursor-pointer text-sm font-medium appearance-none">
                <option value="">All Materials</option>
                {optMat.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Outer Color</label>
              <select value={filterOuter} onChange={(e) => setFilterOuter(e.target.value)} className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none bg-transparent cursor-pointer text-sm font-medium appearance-none">
                <option value="">All Colors</option>
                {optOuter.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider truncate">Inner Color</label>
              <select value={filterInner} onChange={(e) => setFilterInner(e.target.value)} className="w-full border-b border-gray-300 pb-2 focus:border-black outline-none bg-transparent cursor-pointer text-sm font-medium appearance-none">
                <option value="">All Colors</option>
                {optInner.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-10 border-t border-gray-100 pt-8">
            <button className="bg-[#fcd34d] text-black px-10 py-3 rounded text-xs font-bold shadow-sm hover:bg-[#fbbf24] transition-colors uppercase tracking-wider">
              Apply ({filteredProducts.length})
            </button>
            <button onClick={clearFilters} className="bg-white border border-gray-200 text-gray-600 px-8 py-3 rounded text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider">
              Clear form
            </button>
          </div>
        </div>

        {/* Table & Pagination wrapper */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/30">
                  <th className="p-5 w-14"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></th>
                  <th className="w-16 px-2 py-4 text-[11px] font-bold text-black uppercase">Preview</th>
                  <th onClick={() => handleSort('name')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Product name {getSortIcon('name')}</div></th>
                  <th onClick={() => handleSort('type')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Product type {getSortIcon('type')}</div></th>
                  <th onClick={() => handleSort('openability')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Openability {getSortIcon('openability')}</div></th>
                  <th onClick={() => handleSort('outerColor')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Outer Color {getSortIcon('outerColor')}</div></th>
                  <th onClick={() => handleSort('innerColor')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Inner Color {getSortIcon('innerColor')}</div></th>
                  <th onClick={() => handleSort('width')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Width (mm) {getSortIcon('width')}</div></th>
                  <th onClick={() => handleSort('height')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Height (mm) {getSortIcon('height')}</div></th>
                  <th onClick={() => handleSort('material')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Material {getSortIcon('material')}</div></th>
                  <th onClick={() => handleSort('netPrice')} className="cursor-pointer group py-4 px-3 text-[11px] font-bold text-black uppercase tracking-wider select-none hover:bg-gray-50"><div className="flex items-center">Net Price ({paginatedProducts.length > 0 ? paginatedProducts[0].currency : 'EUR'}) {getSortIcon('netPrice')}</div></th>
                  <th className="py-4 px-5 text-[11px] font-bold text-black uppercase tracking-wider text-center border-l border-gray-100">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product: any, idx: number) => (
                  <tr key={product.id || idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5"><input type="checkbox" className="w-4 h-4 rounded border-gray-300" /></td>
                    <td className="p-2 cursor-pointer" onClick={() => handleOpenGallery(product)}>
                       {product.localImages?.[0] ? (
                         <img src={product.localImages[0]} className="w-12 h-12 object-contain rounded bg-white shadow-sm hover:scale-110 transition-transform" alt={product.name} />
                       ) : <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center"><ImageIcon size={16} className="text-gray-300"/></div>}
                    </td>
                    <td className="py-4 px-3 text-sm text-gray-900 font-bold whitespace-nowrap">{product.name}</td>
                    <td className="py-4 px-3 text-sm text-gray-600 font-medium">{product.type}</td>
                    <td className="py-4 px-3 text-sm text-gray-600">{product.openability}</td>
                    <td className="py-4 px-3 text-sm text-gray-600 max-w-[120px] truncate" title={product.outerColor}>{product.outerColor}</td>
                    <td className="py-4 px-3 text-sm text-gray-600 max-w-[120px] truncate" title={product.innerColor}>{product.innerColor}</td>
                    <td className="py-4 px-3 text-sm text-gray-600">{product.width}</td>
                    <td className="py-4 px-3 text-sm text-gray-600">{product.height}</td>
                    <td className="py-4 px-3 text-sm text-gray-600 font-extrabold text-[#eab676]">{product.material}</td>
                    <td className="py-4 px-3 text-sm font-black text-gray-900">{product.netPrice}</td>
                    <td className="py-4 px-5 text-center border-l border-gray-100">
                      <button 
                        onClick={() => handleOpenGallery(product)}
                        className="bg-white border border-gray-200 text-gray-800 px-6 py-2 rounded text-[10px] font-bold hover:border-gray-300 shadow hover:shadow-md hover:bg-gray-50 transition-all uppercase tracking-widest w-full"
                      >
                        SHOW
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr><td colSpan={12} className="py-12 text-center text-gray-500 text-sm">No products match the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Clean Pagination Bar */}
          {totalPages > 1 && (
            <div className="bg-gray-50 flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Showing <span className="font-semibold text-black">{(currentPage - 1) * recordsPerPage + 1}</span> to <span className="font-semibold text-black">{Math.min(currentPage * recordsPerPage, sortedProducts.length)}</span> of <span className="font-semibold text-black">{sortedProducts.length}</span> results
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-white border border-gray-300 p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white border border-gray-300 p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal for Multiple Images */}
      {expandedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setExpandedProduct(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-extrabold text-xl text-black tracking-tight">{expandedProduct.name}</h3>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">{expandedProduct.type} <span className="mx-2">•</span> {expandedProduct.width} x {expandedProduct.height} mm</p>
              </div>
              <button 
                onClick={() => setExpandedProduct(null)} 
                className="bg-white border border-gray-200 p-2.5 rounded-full text-gray-400 hover:text-black hover:shadow-md transition-all"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-100/50">
              {expandedProduct.localImages && expandedProduct.localImages.length > 0 ? (
                <div className="relative flex items-center justify-center w-full h-[50vh] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                   {expandedProduct.localImages.length > 1 && (
                       <>
                         <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-6 p-4 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-800 z-10 transition-colors border border-gray-100">
                            <ChevronLeft size={28} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-6 p-4 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-800 z-10 transition-colors border border-gray-100">
                            <ChevronRight size={28} />
                         </button>
                       </>
                   )}
                   <img src={expandedProduct.localImages[galleryIndex]} alt={`${expandedProduct.name} View ${galleryIndex + 1}`} className="w-full h-full object-contain pointer-events-none" />
                   {expandedProduct.localImages.length > 1 && (
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-5 py-2 rounded-full backdrop-blur-sm shadow-xl">
                        <span className="text-white text-xs font-bold tracking-widest">{galleryIndex + 1} / {expandedProduct.localImages.length}</span>
                     </div>
                   )}
                </div>
              ) : (expandedProduct.localImage ? (
                <div className="flex flex-col items-center group w-full">
                  <img src={expandedProduct.localImage} alt={expandedProduct.name} className="w-full max-w-lg h-auto rounded-xl border border-gray-200 bg-white object-contain shadow-sm group-hover:shadow-lg transition-all" />
                </div>
              ) : (
                <div className="w-full max-w-lg aspect-square bg-gray-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                    <ImageIcon size={64} className="mb-4 opacity-20" />
                    <span className="text-sm font-medium">No images dynamically extracted</span>
                </div>
              ))}
            </div>
            <div className="bg-white px-8 py-5 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-800">
                <span className="opacity-50 uppercase tracking-widest">DRUTEX OUTLET DIRECT</span>
                <span className="text-2xl text-[#eab676]">{expandedProduct.netPrice} {expandedProduct.currency}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
