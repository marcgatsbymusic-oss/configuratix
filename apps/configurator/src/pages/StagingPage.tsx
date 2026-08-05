import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Box, PackagePlus, ChevronLeft, Image as ImageIcon, FileText, Edit2, Lock, Menu, X } from 'lucide-react';
import { useStagingStore } from '../store/useStagingStore';
import { Link, useNavigate } from 'react-router-dom';
import { F252Viewer } from '../components/configurator/F252Viewer';
import { IG5_F104Viewer } from '../components/configurator/IG5_F104Viewer';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import WindowConfigSummaryCard from '../components/WindowConfigSummaryCard';
import * as THREE from 'three';
import { ArViewer } from '../components/configurator/ArViewer';

const getColorHex = (colorName: string | undefined): string => {
  if (!colorName) return '#ffffff';
  const name = colorName.toLowerCase();
  if (name.includes('czarny') || name.includes('black') || name === '9005') return '#111111';
  if (name.includes('antracyt') || name.includes('anthracite') || name === '7016') return '#383e42';
  if (name.includes('braz') || name.includes('brown') || name === '8019') return '#5c4033';
  if (name.includes('f1') || name.includes('silver')) return '#c0c0c0';
  if (name.includes('kremowy') || name.includes('creamy')) return '#f5f5dc';
  if (name.includes('zloto') || name.includes('gold')) return '#b8860b';
  if (name.includes('bialy') || name.includes('white') || name === '9016') return '#ffffff';
  if (name.startsWith('#')) return name;
  return '#ffffff'; // Fallback
};

const formatDimensionBucket = (val: number | undefined) => {
  if (!val) return 'Unknown';
  if (val <= 1000) return '< 1000mm';
  if (val <= 1500) return '< 1500mm';
  if (val <= 2000) return '< 2000mm';
  if (val <= 2500) return '< 2500mm';
  return '> 2500mm';
};

export function StagingPage({ presetSlug }: { presetSlug?: string }) {
  const { t } = useTranslation();
  const { areas, removeWindowFromArea, updateWindowInArea, addArea, renameArea, removeArea, clonedWindow } = useStagingStore();
  const { user, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const handleBackToConfigurator = () => {
    if (clonedWindow?.profile === 'IGLO 5 F104') {
      navigate('/test/ig5-f104');
    } else {
      navigate('/test/f252'); // Default to F252 if no specific clone or profile not recognized
    }
  };

  const [newAreaName, setNewAreaName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveName, setSaveName] = useState('');
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const windowScenes = useRef<Record<string, THREE.Group>>({});
  const [selectedArScene, setSelectedArScene] = useState<{ group: THREE.Group, typology: string } | null>(null);

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
      alert(t('stagingArea.alerts.loggedIn'));
    } catch (err: any) {
      alert(t('stagingArea.alerts.loginError', { message: err.message }));
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      alert(t('stagingArea.alerts.signUpSuccess'));
    } catch (err: any) {
      alert(t('stagingArea.alerts.signUpError', { message: err.message }));
    }
  };

  const handleSaveSession = async () => {
    if (!user) return;
    const nameToUse = saveName.trim() || saveName.trim() || t('stagingArea.title') + ' - ' + new Date().toLocaleDateString();
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
      alert(t('stagingArea.alerts.sessionSaved'));
      setSaveName('');
      loadSavedSessions();
    } catch (err: any) {
      alert(t('stagingArea.alerts.sessionSaveError', { message: err.message }));
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
      alert(t('stagingArea.alerts.sessionLoaded', { name: session.name }));
    } else {
      alert(t('stagingArea.alerts.invalidSession'));
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm(t('stagingArea.alerts.deleteConfirm'))) return;
    try {
      const { error } = await supabase
        .from('configurator_saves')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert(t('stagingArea.alerts.sessionDeleted'));
      loadSavedSessions();
    } catch (err: any) {
      alert(t('stagingArea.alerts.sessionDeleteError', { message: err.message }));
    }
  };

  useEffect(() => {
    if (user) {
      loadSavedSessions();
    } else {
      setSavedSessions([]);
    }
  }, [user]);

  useEffect(() => {
    if (presetSlug && isSupabaseConfigured) {
      const loadPreset = async () => {
        try {
          const { data, error } = await supabase
            .from('configurator_saves')
            .select('*')
            .eq('name', presetSlug)
            .eq('product_line', 'Staging')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          const anyData = data as any;
          if (!error && anyData && anyData.configuration && Array.isArray(anyData.configuration)) {
            useStagingStore.setState({ areas: anyData.configuration });
            alert(t('stagingArea.alerts.sessionLoaded', { name: anyData.name }));
          }
        } catch (err) {
          console.error('Error loading preset session:', err);
        }
      };
      loadPreset();
    }
  }, [presetSlug, isSupabaseConfigured, t]);

  const handleSendToUser = (areaName: string) => {
    alert(t('stagingArea.alerts.listSent', { name: areaName }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <PackagePlus size={32} className="text-mammut-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">{t('stagingArea.title')}</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isMenuOpen && (
              <div className="absolute top-12 right-0 min-w-[200px] flex flex-col p-1.5 rounded-xl bg-white/90 border border-gray-200 backdrop-blur-md shadow-xl z-50">
                <Link 
                  to="/import"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-800 text-xs font-bold transition-colors text-left w-full group"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{t('stagingArea.importPdfQuote')}</span>
                </Link>
                <button 
                  onClick={() => { handleBackToConfigurator(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-800 text-xs font-bold transition-colors text-left w-full group"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                  <span>{t('stagingArea.backToConfigurator')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Staging Area Controls & Cloud Sync Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card A: Staging List Manager */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t('stagingArea.manageLists')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('stagingArea.manageListsDesc')}</p>
            </div>
            <form onSubmit={handleCreateArea} className="flex gap-2 w-full">
              <input 
                type="text" 
                placeholder={t('stagingArea.listNamePlaceholder')}
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-mammut-gold shadow-sm text-gray-900"
                required
              />
              <button 
                type="submit" 
                className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md whitespace-nowrap"
              >{t('stagingArea.createList')}</button>
            </form>
          </div>

          {/* Card B: Cloud Save & Profile Sync */}
          {!isSupabaseConfigured ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center text-center p-8">
              <p className="text-sm text-gray-500 font-medium">
                {t('stagingArea.cloudSyncUnconfigured')}
              </p>
            </div>
          ) : !user ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{t('stagingArea.cloudSyncTitle')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('stagingArea.cloudSyncDesc')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="email" 
                  placeholder={t('stagingArea.emailPlaceholder')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-2 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  required
                />
                <input 
                  type="password" 
                  placeholder={t('stagingArea.passwordPlaceholder')} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-2 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  required
                />
                <button 
                  type="button"
                  onClick={handleSignIn}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                >{t('stagingArea.signIn')}</button>
                <button 
                  type="button"
                  onClick={handleSignUp}
                  className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                >{t('stagingArea.signUp')}</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{t('stagingArea.cloudSyncActive')}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] sm:max-w-xs font-semibold text-gray-700">{t('stagingArea.loggedInAs', { email: user.email })}</p>
                </div>
                <button 
                  onClick={signOut}
                  className="text-xs text-red-500 hover:underline font-bold"
                >{t('stagingArea.signOut')}</button>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder={t('stagingArea.sessionNamePlaceholder')}
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-mammut-gold text-gray-900"
                  />
                  <button 
                    onClick={handleSaveSession}
                    className="bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-2 px-4 rounded-xl text-xs transition-colors shrink-0"
                  >{t('stagingArea.saveSession')}</button>
                </div>

                {savedSessions.length > 0 && (
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto border border-gray-200 rounded-xl p-2 bg-white">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('stagingArea.loadSession')}</span>
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
            <p className="text-xl">{t('stagingArea.emptyArea')}</p>
            <Link 
              to="/debug-pricing"
              className="mt-6 inline-flex items-center gap-2 text-mammut-gold hover:text-black transition-colors font-bold"
            >
              <ChevronLeft size={20} />
              {t('stagingArea.returnToConfigurator')}
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
                          title={t('stagingArea.renameList')}
                        >
                          <Edit2 size={16} />
                        </button>
                        {area.id !== 'pilar_stq' && (
                          <button
                            onClick={() => {
                              if (confirm(t('stagingArea.alerts.deleteListConfirm'))) {
                                removeArea(area.id);
                              }
                            }}
                            className="opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
                            title={t('stagingArea.deleteList')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{t('stagingArea.itemsConfigured_' + (area.windows.length === 1 ? 'one' : 'other'), { count: area.windows.length })}</p>
                  </div>
                  <button
                    onClick={() => handleSendToUser(area.name)}
                    className="flex items-center justify-center gap-2 bg-mammut-gold hover:bg-black hover:text-white text-black font-bold py-3 sm:py-2 px-6 rounded-xl transition-colors shadow-md"
                    disabled={area.windows.length === 0}
                  >
                    <span>{t('stagingArea.sendToUser')}</span>
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  {area.windows.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic py-12">
                      {t('stagingArea.emptyList')}
                    </div>
                  ) : (
                    area.windows.map((window, index) => (
                  <div key={window.id} className="w-full">
                    <WindowConfigSummaryCard
                      roomIndex={index + 1}
                      roomName={window.name}
                      profileCode={window.profile.split(' ')[0] + ' ' + (window.profile.split(' ')[1] || '')}
                      profileType={window.profile.split(' ').slice(2).join(' ')}
                      dimensionsLocked={window.config?.preSales ? true : false}
                      dimensionsNote={t('stagingArea.locked')}
                      dimensionsValue={window.config?.width ? `${window.config.width} x ${window.config.height} mm` : null}
                      glazing={window.glazing}
                      handle={`${window.config?.handleType === 'locked' ? t('stagingArea.handles.keyLocked') : window.config?.handleType === 'premium' ? t('stagingArea.handles.premium') : t('stagingArea.handles.standard')} (${window.config?.handleColor || t('stagingArea.handles.silverF1')})`}
                      treatments={`${window.config?.solarTreatment ? t('stagingArea.solar') : ''} ${window.config?.thermalTreatment ? t('stagingArea.thermal') : ''}`.trim() || t('stagingArea.none')}
                      colors={[
                        ...(window.config?.colorInt ? [{ label: t('stagingArea.frameInt', 'Marco int.'), hex: getColorHex(window.config.colorInt) }] : []),
                        ...(window.config?.colorExt ? [{ label: t('stagingArea.frameExt', 'Marco ext.'), hex: getColorHex(window.config.colorExt) }] : []),
                        ...(window.config?.blindColorInt ? [{ label: t('stagingArea.blindBoxInt', 'Cajón int.'), hex: getColorHex(window.config.blindColorInt) }] : []),
                        ...(window.config?.blindColorExt ? [{ label: t('stagingArea.blindBoxExt', 'Cajón ext.'), hex: getColorHex(window.config.blindColorExt) }] : []),
                        ...(window.config?.blindColorSlats ? [{ label: t('stagingArea.blinds', 'Persiana'), hex: getColorHex(window.config.blindColorSlats) }] : []),
                        ...(window.config?.blindColorGuides ? [{ label: t('stagingArea.blindRails', 'Guías'), hex: getColorHex(window.config.blindColorGuides) }] : []),
                      ]}
                      complements={[
                        ...(window.config?.blindBox ? [{ label: t('stagingArea.blindBox'), included: true, variant: "neutral" }] : []),
                        ...(window.motor ? [{ label: t('stagingArea.motor'), included: true, variant: "neutral" }] : []),
                        ...(window.config?.mosquito ? [{ label: t('stagingArea.mosquitoNet'), included: true, variant: "neutral" }] : []),
                        ...(window.config?.solarTreatment ? [{ label: t('stagingArea.solarTreatment'), included: true, variant: "solar" }] : []),
                        ...(window.config?.thermalTreatment ? [{ label: t('stagingArea.thermalTreatment'), included: true, variant: "thermal" }] : []),
                      ]}
                      efficiencyRating="A++"
                      uwValue={window.uwValue || "0.74"}
                      manufacturingDays={5}
                      deliveryDate={"15 días"}
                      onViewAR={() => {
                        const scene = windowScenes.current[window.id];
                        if (scene) {
                          setSelectedArScene({ group: scene, typology: window.profile.split(' ')[2] || 'F100' });
                        } else {
                          navigate('/ar-preview'); // fallback
                        }
                      }}
                      onDelete={() => removeWindowFromArea(area.id, window.id)}
                      thumbnail={
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
                              isMirrored={window.config.isMirrored}
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
                              blindDeployed={window.config.blindDeployed}
                              mosquitoDeployed={window.config.mosquitoDeployed}
                              blindColorExt={window.config.blindColorExt}
                              blindColorInt={window.config.blindColorInt}
                              blindColorGuides={window.config.blindColorGuides}
                              blindColorSlats={window.config.blindColorSlats}
                              onSceneReady={(group) => { windowScenes.current[window.id] = group; }}
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
                              hasBlind={window.config.blindBox}
                              hasMosquito={window.config.mosquito}
                              blindDeployed={window.config.blindDeployed}
                              mosquitoDeployed={window.config.mosquitoDeployed}
                              colorGuides={window.config.blindColorGuides}
                              colorSlats={window.config.blindColorSlats}
                              onSceneReady={(group) => { windowScenes.current[window.id] = group; }}
                            />
                          ) : window.image ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                              <img src={window.image} alt={window.name} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                              <ImageIcon size={32} />
                              <span className="text-xs">{t('stagingArea.noImage')}</span>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </div>
                ))
              )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* AR Modal Overlay */}
      {selectedArScene && (
        <ArViewer
          sceneGroup={selectedArScene.group}
          placement="wall" // Staging area is mostly windows, so default to wall. Doors might be floor, but we can stick to wall for simplicity.
          typology={selectedArScene.typology}
          onClose={() => setSelectedArScene(null)}
        />
      )}
    </div>
  );
}
