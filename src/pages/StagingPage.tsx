import { useState, useEffect } from 'react';
import { Send, Trash2, Box, PackagePlus, ChevronLeft, Image as ImageIcon, FileText, Edit2, Lock } from 'lucide-react';
import { useStagingStore } from '../store/useStagingStore';
import { Link } from 'react-router-dom';
import { F252Viewer } from '../components/configurator/F252Viewer';
import { IG5_F104Viewer } from '../components/configurator/IG5_F104Viewer';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const formatDimensionBucket = (val: number | undefined) => {
  if (!val) return 'Unknown';
  if (val <= 1000) return '< 1000mm';
  if (val <= 1500) return '< 1500mm';
  if (val <= 2000) return '< 2000mm';
  if (val <= 2500) return '< 2500mm';
  return '> 2500mm';
};

export function StagingPage() {
  const { areas, removeWindowFromArea, updateWindowInArea, addArea, renameArea, removeArea } = useStagingStore();
  const { user, signIn, signUp, signOut } = useAuth();

  const [newAreaName, setNewAreaName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveName, setSaveName] = useState('');
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    addArea(newAreaName.trim());
    setNewAreaName('');
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      alert('Logged in successfully!');
    } catch (err: any) {
      alert('Login error: ' + err.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      alert('Sign up successful! Please check email to verify or try logging in.');
    } catch (err: any) {
      alert('Sign up error: ' + err.message);
    }
  };

  const handleSaveSession = async () => {
    if (!user) return;
    const nameToUse = saveName.trim() || `Staging Area - ${new Date().toLocaleDateString()}`;
    try {
      const { error } = await supabase
        .from('configurator_saves')
        .insert({
          user_id: user.id,
          name: nameToUse,
          product_line: 'Staging',
          product_type: 'Session',
          material: 'Staging',
          configuration: areas as any
        } as any);
      if (error) throw error;
      alert('Staging session saved to cloud!');
      setSaveName('');
      loadSavedSessions();
    } catch (err: any) {
      alert('Error saving session: ' + err.message);
    }
  };

  const loadSavedSessions = async () => {
    if (!user || !isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('configurator_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_line', 'Staging')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setSavedSessions(data);
      }
    } catch (err) {
      console.error('Error loading saved sessions:', err);
    }
  };

  const handleLoadSession = (session: any) => {
    if (session.configuration && Array.isArray(session.configuration)) {
      useStagingStore.setState({ areas: session.configuration });
      alert(`Loaded staging session: ${session.name}`);
    } else {
      alert('Invalid session configuration payload.');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved session?')) return;
    try {
      const { error } = await supabase
        .from('configurator_saves')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Session deleted.');
      loadSavedSessions();
    } catch (err: any) {
      alert('Error deleting session: ' + err.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadSavedSessions();
    } else {
      setSavedSessions([]);
    }
  }, [user]);

  const handleSendToUser = (areaName: string) => {
    alert(`List "${areaName}" sent to user!`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <PackagePlus size={32} className="text-mammut-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">STAGING AREA</h1>
          </div>
          <Link 
            to="/import"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black border border-gray-200 font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
          >
            <FileText size={18} />
            <span>Import PDF Quote</span>
          </Link>
        </div>

        {/* Staging Area Controls & Cloud Sync Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card A: Staging List Manager */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Manage Staging Lists</h3>
              <p className="text-xs text-gray-500 mt-1">Create multiple list configurations to organize your projects.</p>
            </div>
            <form onSubmit={handleCreateArea} className="flex gap-2 w-full">
              <input 
                type="text" 
                placeholder="e.g. Project North Wing"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-mammut-gold shadow-sm text-gray-900"
                required
              />
              <button 
                type="submit" 
                className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md whitespace-nowrap"
              >
                Create List
              </button>
            </form>
          </div>

          {/* Card B: Cloud Save & Profile Sync */}
          {!isSupabaseConfigured ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center text-center p-8">
              <p className="text-sm text-gray-500 font-medium">
                Cloud database sync is not configured locally. Staging sessions will be saved in your browser local storage.
              </p>
            </div>
          ) : !user ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Cloud Sync & Profile Save</h3>
                <p className="text-xs text-gray-500 mt-1">Log in to save and retrieve your staging sessions from your user profile.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-2 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-2 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  required
                />
                <button 
                  type="button"
                  onClick={handleSignIn}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={handleSignUp}
                  className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Cloud Sync Active</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] sm:max-w-xs font-semibold text-gray-700">Logged in as {user.email}</p>
                </div>
                <button 
                  onClick={signOut}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Sign Out
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Staging Session Name..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  />
                  <button 
                    onClick={handleSaveSession}
                    className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2 px-4 rounded-xl text-xs transition-colors shrink-0"
                  >
                    Save Session
                  </button>
                </div>

                {savedSessions.length > 0 && (
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto border border-gray-200 rounded-xl p-2 bg-white">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Load Staging Session</span>
                    {savedSessions.map(sess => (
                      <div key={sess.id} className="flex items-center justify-between gap-2 text-xs border-b border-gray-50 pb-1.5 mb-1.5 last:border-0 last:pb-0 last:mb-0">
                        <button 
                          onClick={() => handleLoadSession(sess)}
                          className="text-left font-semibold text-gray-800 hover:text-mammut-gold truncate flex-1"
                        >
                          {sess.name}
                        </button>
                        <button 
                          onClick={() => handleDeleteSession(sess.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {areas.length === 0 ? (
          <div className="text-center text-gray-500 py-24 bg-gray-50 rounded-2xl border border-gray-200">
            <Box size={64} className="mx-auto mb-6 opacity-30" />
            <p className="text-xl">Your staging area is empty.</p>
            <Link 
              to="/debug-pricing"
              className="mt-6 inline-flex items-center gap-2 text-mammut-gold hover:text-black transition-colors font-bold"
            >
              <ChevronLeft size={20} />
              Return to Configurator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {areas.map(area => (
              <div key={area.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
                  <div className="flex-1">
                    {editingAreaId === area.id ? (
                      <input
                        type="text"
                        value={editingAreaName}
                        onChange={(e) => setEditingAreaName(e.target.value)}
                        onBlur={() => {
                          if (editingAreaName.trim()) {
                            renameArea(area.id, editingAreaName.trim());
                          }
                          setEditingAreaId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingAreaName.trim()) {
                              renameArea(area.id, editingAreaName.trim());
                            }
                            setEditingAreaId(null);
                          } else if (e.key === 'Escape') {
                            setEditingAreaId(null);
                          }
                        }}
                        className="font-bold text-xl sm:text-2xl text-gray-900 border border-mammut-gold rounded-lg px-2 py-0.5 outline-none bg-white w-full max-w-xs"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-3 group/title">
                        <h2 className="font-bold text-xl sm:text-2xl text-gray-900 capitalize">{area.name}</h2>
                        <button
                          onClick={() => {
                            setEditingAreaId(area.id);
                            setEditingAreaName(area.name);
                          }}
                          className="opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100 transition-opacity text-gray-400 hover:text-mammut-gold p-1"
                          title="Rename list"
                        >
                          <Edit2 size={16} />
                        </button>
                        {area.id !== 'pilar_stq' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this list?')) {
                                removeArea(area.id);
                              }
                            }}
                            className="opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
                            title="Delete list"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{area.windows.length} items configured</p>
                  </div>
                  <button
                    onClick={() => handleSendToUser(area.name)}
                    className="flex items-center justify-center gap-2 bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-3 sm:py-2 px-6 rounded-xl transition-colors shadow-md"
                    disabled={area.windows.length === 0}
                  >
                    <span>Send to User</span>
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  {area.windows.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic py-12">
                      No windows in this list yet.
                    </div>
                  ) : (
                    area.windows.map((window, index) => (
                      <div key={window.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden relative group hover:border-gray-300 transition-colors flex flex-col shadow-sm">
                        
                        {/* 3D Viewer / Image Section (Top) */}
                        <div 
                          className="w-full bg-gray-50 border-b border-gray-200 relative" 
                          style={{ 
                            aspectRatio: (window.config?.width && window.config?.height) 
                              ? `${window.config.width} / ${window.config.height}` 
                              : '16 / 9',
                            minHeight: '250px',
                            maxHeight: '70vh'
                          }}
                        >
                          {window.profile === 'IGLO 5 F252' && window.config ? (
                            <F252Viewer 
                              width={window.config.width}
                              height={window.config.height}
                              bottomHeight={window.config.bottomHeight}
                              colorExt={window.config.colorExt}
                              colorInt={window.config.colorInt}
                              colorExtTexture={window.config.colorExtTexture}
                              colorIntTexture={window.config.colorIntTexture}
                              isThumbnail={true}
                              solarTreatment={window.config.solarTreatment}
                              thermalTreatment={window.config.thermalTreatment}
                              handleColor={
                                window.config.handleColor === 'czarny' ? '#111111' :
                                window.config.handleColor === 'antracyt' ? '#383e42' :
                                window.config.handleColor === 'braz' ? '#5c4033' :
                                window.config.handleColor === 'F1' ? '#c0c0c0' :
                                window.config.handleColor === 'F9' ? '#8a9597' :
                                window.config.handleColor === 'kremowy' ? '#f5f5dc' :
                                window.config.handleColor === 'st_zloto' ? '#b8860b' : 
                                window.config.handleColor === 'bialy' ? '#ffffff' : '#ffffff'
                              }
                              blindBox={window.config.blindBox}
                              mosquito={window.config.mosquito}
                              blindColorExt={window.config.blindColorExt}
                              blindColorInt={window.config.blindColorInt}
                              blindColorGuides={window.config.blindColorGuides}
                              blindColorSlats={window.config.blindColorSlats}
                            />
                          ) : window.profile === 'IGLO 5 F104' && window.config ? (
                            <IG5_F104Viewer 
                              width={window.config.width}
                              height={window.config.height}
                              colorExt={window.config.colorExt}
                              colorInt={window.config.colorInt}
                              colorExtTexture={window.config.colorExtTexture}
                              colorIntTexture={window.config.colorIntTexture}
                              isThumbnail={true}
                              solarTreatment={window.config.solarTreatment}
                              thermalTreatment={window.config.thermalTreatment}
                            />
                          ) : window.image ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                              <img src={window.image} alt={window.name} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                              <ImageIcon size={32} />
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Details Section (Bottom) */}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-gray-900 pr-8">{index + 1}. {window.name}</h4>
                            <button 
                              onClick={() => removeWindowFromArea(area.id, window.id)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 bg-gray-100 md:bg-transparent rounded-full z-10"
                              title="Remove window"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="block text-gray-400 mb-1 uppercase tracking-wider text-xs font-bold">Profile</span> 
                              <span className="text-mammut-gold font-medium">{window.profile}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 mb-1 uppercase tracking-wider text-xs font-bold">
                                Dimensions
                              </span> 
                              {window.config?.preSales ? (
                                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 font-bold" title="Measurements Locked">
                                  <Lock size={20} className="shrink-0" />
                                  <span className="text-xs uppercase tracking-wider">Locked</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs italic block mt-1.5">Unlocked</span>
                              )}
                            </div>
                            <div>
                              <span className="block text-gray-400 mb-1 uppercase tracking-wider text-xs font-bold">Glazing</span> 
                              <span className="text-gray-800 font-medium block">{window.glazing}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 mb-1 uppercase tracking-wider text-xs font-bold">Handle</span> 
                              <span className="text-gray-800 font-medium block capitalize">
                                {window.config?.handleType === 'locked' ? 'Key-Locked' : window.config?.handleType === 'premium' ? 'Premium' : 'Standard'} ({window.config?.handleColor === 'st_zloto' ? 'Old Gold' : window.config?.handleColor === 'kremowy' ? 'Creamy' : window.config?.handleColor === 'braz' ? 'Brown' : window.config?.handleColor === 'czarny' ? 'Black' : window.config?.handleColor === 'antracyt' ? 'Anthracite' : window.config?.handleColor === 'bialy' ? 'White' : window.config?.handleColor || 'Silver F1'})
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 mb-1 uppercase tracking-wider text-xs font-bold">Treatments</span> 
                              <span className="text-gray-800 font-medium block">
                                {window.config?.solarTreatment ? 'Solar' : ''}
                                {window.config?.solarTreatment && window.config?.thermalTreatment ? ' & ' : ''}
                                {window.config?.thermalTreatment ? 'Thermal' : ''}
                                {!window.config?.solarTreatment && !window.config?.thermalTreatment ? 'None' : ''}
                              </span>
                            </div>
                            
                            {(window.blindBox || window.motor || window.mosquito || window.config?.solarTreatment || window.config?.thermalTreatment) && (
                              <div className="col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-gray-100">
                                <span className="block text-gray-400 mb-2 uppercase tracking-wider text-xs font-bold">Add-ons & Treatments</span>
                                <div className="flex flex-wrap gap-2">
                                  {window.blindBox && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">Blind Box</span>}
                                  {window.motor && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">Motor</span>}
                                  {window.mosquito && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">Mosquito Net</span>}
                                  {window.config?.solarTreatment && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-medium">Solar Treatment</span>}
                                  {window.config?.thermalTreatment && <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-medium">Thermal Treatment</span>}
                                </div>
                              </div>
                            )}

                            {/* Uw Input & AR Button Row */}
                            <div className="col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                              <div className="w-full sm:max-w-xs">
                                <span className="block text-gray-400 mb-1.5 uppercase tracking-wider text-xs font-bold">Uw Value</span> 
                                <input 
                                  type="text" 
                                  value={window.uwValue || ''} 
                                  onChange={(e) => updateWindowInArea(area.id, window.id, { uwValue: e.target.value })}
                                  placeholder="e.g. 0.85 W/m²K"
                                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold text-gray-900 shadow-sm"
                                />
                              </div>
                              <div className="flex justify-end shrink-0">
                                <Link 
                                  to="/ar-preview" 
                                  className="inline-flex items-center gap-2 bg-mammut-gold hover:bg-mammut-gold/80 text-black font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                  <Box size={16} />
                                  <span>View in AR</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
