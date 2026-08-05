import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ChevronRight, CheckCircle, AlertCircle, Plus, Box, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { extractTextFromPdf, parseDrutexItems } from '../utils/pdfParser';
import type { ParsedWindowItem } from '../utils/pdfParser';
import { useStagingStore } from '../store/useStagingStore';

// Dummy options for profile systems and window types
const PROFILE_OPTIONS = ['IGLO 5', 'IGLO 5 Classic', 'IGLO Energy', 'IGLO Energy Classic'];
const WINDOW_TYPES = ['Fixed Window (F1T0)', 'Single Sash Tilt & Turn (F1XXX)', 'Double Sash (F202)', 'Double Sash Movable Post (F2MPX)'];
const GLAZING_OPTIONS = ['Double Glazing 24mm', 'Triple Glazing 48mm'];

interface ConfiguredItem extends ParsedWindowItem {
  selectedProfile: string;
  selectedType: string;
  selectedGlazing: string;
  error?: string;
}

export function PdfImportPage() {
  const navigate = useNavigate();
  const { areas, addArea, addWindowToArea } = useStagingStore();
  
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [configuredItems, setConfiguredItems] = useState<ConfiguredItem[]>([]);
  
  // Staging area selection
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas.length > 0 ? areas[0].id : '');
  const [newAreaName, setNewAreaName] = useState<string>('');
  const [isCreatingNewArea, setIsCreatingNewArea] = useState(areas.length === 0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setParseError('Please upload a valid PDF file.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const text = await extractTextFromPdf(file);
      const parsed = parseDrutexItems(text);
      
      if (parsed.length === 0) {
        setParseError('Could not find any window items in this PDF. The format might not be supported.');
      } else {
        setConfiguredItems(parsed.map(item => ({
          ...item,
          selectedProfile: PROFILE_OPTIONS[0],
          selectedType: WINDOW_TYPES[0],
          selectedGlazing: GLAZING_OPTIONS[0]
        })));
      }
    } catch (err: any) {
      console.error(err);
      setParseError('Error parsing PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsParsing(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateItem = (id: string, updates: Partial<ConfiguredItem>) => {
    setConfiguredItems(items => items.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  const removeItem = (id: string) => {
    setConfiguredItems(items => items.filter(it => it.id !== id));
  };

  const handleSendToStaging = () => {
    if (configuredItems.length === 0) return;

    let targetAreaId = selectedAreaId;

    if (isCreatingNewArea && newAreaName.trim()) {
      // addArea function in store just pushes a new area, doesn't return the ID immediately
      // but we can generate an ID or just know that the last one is it...
      // Wait, the store's addArea generates a random ID. To ensure we have the ID, we can just do this manually if needed.
      // Let's call addArea, then find the newly created area by name.
      addArea(newAreaName.trim());
      // Hack: wait a tick or just rely on zustand synchronous update
      const state = useStagingStore.getState();
      const newArea = state.areas.find(a => a.name === newAreaName.trim());
      if (newArea) {
        targetAreaId = newArea.id;
      } else {
        // Fallback to random ID generation similar to store
        targetAreaId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
    }

    if (!targetAreaId) {
      alert("Please select or create a staging area.");
      return;
    }

    // Add each configured item to the staging area
    configuredItems.forEach(item => {
      // Add quantity copies if quantity > 1
      for (let i = 0; i < item.quantity; i++) {
        addWindowToArea(targetAreaId, {
          name: `${item.reference} ${i > 0 ? '(' + (i + 1) + ')' : ''}`.trim(),
          profile: item.selectedProfile,
          glazing: item.selectedGlazing,
          blindBox: false,
          motor: false,
          mosquito: false,
          config: {
            width: item.width || 1000,
            height: item.height || 1000,
            colorExt: 'White',
            colorInt: 'White'
          }
        });
      }
    });

    // Navigate to staging area
    navigate('/staging');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <FileText size={32} className="text-mammut-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase">PDF Import</h1>
          </div>
          <Link to="/staging" className="text-sm font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-widest flex items-center gap-2">
            Back to Staging
          </Link>
        </div>

        {/* Step 1: Upload */}
        {configuredItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-gray-50 w-24 h-24 mx-auto rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <UploadCloud size={40} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Upload Drutex PDF</h2>
                <p className="text-gray-500 text-sm">Upload a quote or order PDF. We will attempt to automatically extract the window dimensions and quantities.</p>
              </div>
              
              {parseError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm text-left">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}

              <div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  className="w-full bg-mammut-gold hover:bg-black text-black hover:text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParsing ? 'Parsing PDF...' : 'Select PDF File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Configure */}
        {configuredItems.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Configure Extracted Items</h2>
                  <p className="text-sm text-gray-500">We found {configuredItems.length} items in the PDF.</p>
                </div>
                <button 
                  onClick={() => setConfiguredItems([])}
                  className="text-sm text-red-500 font-bold hover:text-red-700 uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                {configuredItems.map((item, index) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left: Extracted Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">{item.reference || `Item ${index + 1}`}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                            <X size={18} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Width (mm)</label>
                            <input 
                              type="number" 
                              value={item.width || ''} 
                              onChange={(e) => updateItem(item.id, { width: parseInt(e.target.value) || undefined })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                              placeholder="e.g. 1500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Height (mm)</label>
                            <input 
                              type="number" 
                              value={item.height || ''} 
                              onChange={(e) => updateItem(item.id, { height: parseInt(e.target.value) || undefined })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                              placeholder="e.g. 1500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</label>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              min={1}
                              onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                            />
                          </div>
                        </div>

                        <div className="bg-gray-100 rounded p-3 text-xs text-gray-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                          {item.rawText}
                        </div>
                      </div>

                      {/* Right: Configuration */}
                      <div className="flex-1 space-y-4 lg:border-l lg:border-gray-200 lg:pl-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Profile System</label>
                          <select 
                            value={item.selectedProfile}
                            onChange={(e) => updateItem(item.id, { selectedProfile: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                          >
                            {PROFILE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Window Type</label>
                          <select 
                            value={item.selectedType}
                            onChange={(e) => updateItem(item.id, { selectedType: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                          >
                            {WINDOW_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Glazing</label>
                          <select 
                            value={item.selectedGlazing}
                            onChange={(e) => updateItem(item.id, { selectedGlazing: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                          >
                            {GLAZING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Send to Staging Area */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex-1 w-full space-y-4">
                  <h2 className="text-lg font-bold">Send to Staging Area</h2>
                  
                  <div className="flex items-center gap-4 border border-gray-200 rounded-xl p-1 bg-gray-50">
                    <button 
                      onClick={() => setIsCreatingNewArea(false)}
                      disabled={areas.length === 0}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isCreatingNewArea && areas.length > 0 ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-800 disabled:opacity-50'}`}
                    >
                      Existing Area
                    </button>
                    <button 
                      onClick={() => setIsCreatingNewArea(true)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isCreatingNewArea ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Create New
                    </button>
                  </div>

                  {!isCreatingNewArea ? (
                    <select 
                      value={selectedAreaId}
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                    >
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name} ({area.windows.length} items)</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      placeholder="e.g. Project Kowalski"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold outline-none"
                    />
                  )}
                </div>

                <div className="w-full md:w-auto flex flex-col justify-end h-full">
                  <button 
                    onClick={handleSendToStaging}
                    disabled={configuredItems.length === 0 || (isCreatingNewArea && !newAreaName.trim())}
                    className="w-full md:w-auto bg-mammut-gold hover:bg-black text-black hover:text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Send Items to Staging</span>
                    <ArrowRight size={20} />
                  </button>
                </div>

              </div>
            </div>
            
          </div>
        )}
        
      </div>
    </div>
  );
}
