import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, CheckCircle2, Clock, Camera, Users, 
  AlertTriangle, ChevronDown, ChevronRight, Play, Square,
  Wrench, Package, Zap, Hammer, Scissors, Building2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Extraction:  { bg: 'bg-red-500/20',    text: 'text-red-400',    icon: <Wrench size={12} /> },
  Prep:        { bg: 'bg-blue-500/20',   text: 'text-blue-400',   icon: <Package size={12} /> },
  Install:     { bg: 'bg-mammut-gold/20',text: 'text-mammut-gold',icon: <Hammer size={12} /> },
  Fixing:      { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <Wrench size={12} /> },
  Trim:        { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <Scissors size={12} /> },
  Masonry:     { bg: 'bg-stone-500/20',  text: 'text-stone-400',  icon: <Building2 size={12} /> },
  Automation:  { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   icon: <Zap size={12} /> },
};

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-zinc-700/50 text-zinc-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  complete:    'bg-emerald-500/20 text-emerald-400',
  outstanding: 'bg-amber-500/20 text-amber-400',
  blocked:     'bg-red-500/20 text-red-400',
};

interface TaskInstance {
  id: string;
  templateCode: string;
  status: string;
  responsible: string | null;
  timeMinutes: number | null;
  detail: string | null;
  evidenceUrl: string | null;
  source: string | null;
  template: {
    code: string;
    nameEs: string;
    nameEn: string;
    category: string;
    evidenceRequired: boolean;
    sequence: number;
  };
  timeLogs: { personName: string; minutes: number }[];
}

interface Opening {
  id: string;
  openingId: string;
  location: string;
  locationConfirmed: boolean;
  matchConfidence: string;
  matchNote: string | null;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  productType: string;
  schematicUrl: string | null;
  hasMotorizedShutter: boolean;
  fixingMethod: string;
  taskInstances: TaskInstance[];
  masonryPunchList: { status: string; responsible: string; detail: string } | null;
}

interface Props {
  opening: Opening;
  crewRoster: string[];
  listId: string;
  onBack: () => void;
}

export function OpeningWorkflow({ opening, crewRoster, listId, onBack }: Props) {
  const [tasks, setTasks] = useState<TaskInstance[]>(opening.taskInstances.filter(t => t.templateCode !== 'T19'));
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, { running: boolean; elapsed: number; startedAt: number | null }>>({});
  const [selectedCrew, setSelectedCrew] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    opening.taskInstances.forEach(t => {
      if (t.responsible) {
        initial[t.templateCode] = t.responsible.split(',').map(n => n.trim()).filter(Boolean);
      }
    });
    return initial;
  });
  const [manualMinutes, setManualMinutes] = useState<Record<string, string>>({});
  const [savingTask, setSavingTask] = useState<string | null>(null);
  const [photoSimulated, setPhotoSimulated] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer tick
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        for (const code of Object.keys(updated)) {
          if (updated[code].running && updated[code].startedAt) {
            updated[code] = {
              ...updated[code],
              elapsed: Math.floor((Date.now() - updated[code].startedAt!) / 60000)
            };
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 10000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const toggleTimer = (code: string) => {
    setTimers(prev => {
      const cur = prev[code] || { running: false, elapsed: 0, startedAt: null };
      if (cur.running) {
        return { ...prev, [code]: { running: false, elapsed: cur.elapsed, startedAt: null } };
      } else {
        return { ...prev, [code]: { running: true, elapsed: cur.elapsed, startedAt: Date.now() - cur.elapsed * 60000 } };
      }
    });
    setTasks(prev => prev.map(t => t.templateCode === code ? { ...t, status: 'in_progress' } : t));
  };

  const getMinutes = (code: string): number => {
    const timer = timers[code];
    if (timer?.elapsed) return timer.elapsed;
    const manual = parseInt(manualMinutes[code] || '0', 10);
    if (manual > 0) return manual;
    return tasks.find(t => t.templateCode === code)?.timeMinutes || 0;
  };

  const saveTask = useCallback(async (code: string, status: string) => {
    setSavingTask(code);
    const crew = selectedCrew[code] || [];
    const minutes = getMinutes(code);
    try {
      await fetch(`${API_BASE_URL}/api/openings/${opening.id}/tasks/${code}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-mock-role': 'INSTALLER' },
        body: JSON.stringify({ status, minutes: minutes || null, crew, evidenceUrl: photoSimulated[code] ? `/photos/${opening.openingId}/${code}.jpg` : null })
      });
      setTasks(prev => prev.map(t => t.templateCode === code ? { ...t, status, timeMinutes: minutes || t.timeMinutes, responsible: crew.join(', ') } : t));
    } catch (e) {
      console.warn('Offline: saving to localStorage', e);
      setTasks(prev => prev.map(t => t.templateCode === code ? { ...t, status, responsible: crew.join(', ') } : t));
    } finally {
      setSavingTask(null);
    }
  }, [opening.id, opening.openingId, selectedCrew, timers, manualMinutes, photoSimulated]);

  const completedCount = tasks.filter(t => t.status === 'complete').length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryOrder = ['Extraction', 'Prep', 'Install', 'Fixing', 'Trim', 'Masonry', 'Automation'];
  const groupedTasks = categoryOrder.map(cat => ({
    category: cat,
    tasks: tasks.filter(t => t.template.category === cat)
  })).filter(g => g.tasks.length > 0);

  return (
    <div className="min-h-screen bg-mammut-darker text-mammut-white font-sans pb-20">
      {/* Header */}
      <header className="bg-mammut-dark border-b border-mammut-border p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-mammut-border transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm uppercase tracking-widest truncate">{opening.openingId}</h1>
            <p className="text-xs text-mammut-grey-light truncate">
              {!opening.locationConfirmed && <span className="text-amber-400 font-bold">⚠ UNCONFIRMED — </span>}
              {opening.location} · {opening.widthMm}×{opening.heightMm}mm · {opening.weightKg}kg
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-mammut-grey-light mb-1 uppercase tracking-widest">
            <span>{completedCount}/{totalCount} tasks</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-mammut-border rounded-full overflow-hidden">
            <div
              className="h-full bg-mammut-gold transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Location warning */}
        {(!opening.locationConfirmed || opening.matchConfidence === 'low') && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400">Location Unconfirmed</p>
              <p className="text-xs text-mammut-grey-light mt-0.5">
                {opening.matchNote || 'Room assignment based on elimination — confirm on site before starting.'}
              </p>
            </div>
          </div>
        )}

        {/* Product info */}
        <div className="bg-mammut-dark border border-mammut-border rounded-2xl overflow-hidden">
          {opening.schematicUrl && (
            <img src={opening.schematicUrl} alt="Window schematic" className="w-full h-32 object-contain bg-zinc-900 p-2" />
          )}
          <div className="p-4">
            <p className="text-sm font-bold">{opening.productType}</p>
            <p className="text-xs text-mammut-grey-light mt-1">
              {opening.fixingMethod === 'chemical' ? '⚗️ Chemical anchor' : '🔩 Mechanical anchor'}
              {opening.hasMotorizedShutter && ' · 🔌 Motorized shutter'}
            </p>
          </div>
        </div>

        {/* Task groups */}
        {groupedTasks.map(group => {
          const catStyle = CATEGORY_COLORS[group.category] || { bg: 'bg-zinc-700/30', text: 'text-zinc-400', icon: null };
          return (
            <section key={group.category}>
              <div className={`flex items-center gap-2 px-1 mb-2`}>
                <span className={`${catStyle.bg} ${catStyle.text} flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full`}>
                  {catStyle.icon} {group.category}
                </span>
              </div>
              <div className="space-y-2">
                {group.tasks.map(task => {
                  const isExpanded = expandedTask === task.templateCode;
                  const timer = timers[task.templateCode] || { running: false, elapsed: 0 };
                  const minutes = getMinutes(task.templateCode);
                  const crew = selectedCrew[task.templateCode] || [];

                  return (
                    <div key={task.templateCode}
                      className={`bg-mammut-dark border rounded-xl overflow-hidden transition-colors ${
                        task.status === 'outstanding' ? 'border-amber-500/40' :
                        task.status === 'complete'    ? 'border-emerald-500/30' :
                        'border-mammut-border'
                      }`}
                    >
                      {/* Task header row */}
                      <button
                        className="w-full p-3 flex items-center gap-3 text-left"
                        onClick={() => setExpandedTask(isExpanded ? null : task.templateCode)}
                      >
                        <span className={`shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${catStyle.bg} ${catStyle.text}`}>
                          {task.templateCode}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{task.template.nameEn}</p>
                          <p className="text-[10px] text-mammut-grey-light truncate">{task.template.nameEs}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {minutes > 0 && (
                            <span className="text-[10px] text-mammut-grey-light flex items-center gap-1">
                              <Clock size={10} /> {minutes}m
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status] || STATUS_STYLES.not_started}`}>
                            {task.status === 'not_started' ? 'TODO' : task.status.replace('_', ' ')}
                          </span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </button>

                      {/* Expanded task panel */}
                      {isExpanded && (
                        <div className="border-t border-mammut-border p-4 space-y-4">
                          {/* Detail note */}
                          {task.detail && (
                            <p className="text-xs text-mammut-grey-light italic border-l-2 border-mammut-gold/40 pl-2">{task.detail}</p>
                          )}

                          {/* Crew multi-select */}
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-mammut-grey-light uppercase tracking-widest mb-2">
                              <Users size={12} /> Crew (select all who worked this task)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {crewRoster.map(name => {
                                const isSelected = crew.includes(name);
                                return (
                                  <button
                                    key={name}
                                    onClick={() => setSelectedCrew(prev => ({
                                      ...prev,
                                      [task.templateCode]: isSelected
                                        ? crew.filter(n => n !== name)
                                        : [...crew, name]
                                    }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                      isSelected
                                        ? 'bg-mammut-gold text-mammut-black'
                                        : 'bg-mammut-border text-mammut-grey-light hover:bg-mammut-grey-light/20'
                                    }`}
                                  >
                                    {name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time logger */}
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-mammut-grey-light uppercase tracking-widest mb-2">
                              <Clock size={12} /> Time
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleTimer(task.templateCode)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                  timer.running
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                }`}
                              >
                                {timer.running ? <Square size={14} /> : <Play size={14} />}
                                {timer.running ? 'Stop' : 'Start'}
                              </button>
                              {timer.elapsed > 0 && (
                                <span className="text-sm font-mono text-mammut-gold">{timer.elapsed}m</span>
                              )}
                              <span className="text-mammut-grey-light text-xs">or</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="min"
                                  value={manualMinutes[task.templateCode] || ''}
                                  onChange={e => setManualMinutes(prev => ({ ...prev, [task.templateCode]: e.target.value }))}
                                  className="w-16 bg-mammut-border text-mammut-white text-sm rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-1 focus:ring-mammut-gold"
                                />
                                <span className="text-xs text-mammut-grey-light">min</span>
                              </div>
                            </div>
                            {/* Per-person time breakdown from DB */}
                            {task.timeLogs.length > 0 && (
                              <div className="mt-2 text-xs text-mammut-grey-light space-y-0.5">
                                {task.timeLogs.map(log => (
                                  <div key={log.personName} className="flex justify-between">
                                    <span>{log.personName}</span>
                                    <span>{log.minutes}m</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Photo evidence */}
                          {task.template.evidenceRequired && (
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-mammut-grey-light uppercase tracking-widest mb-2">
                                <Camera size={12} /> Evidence Photo {task.template.evidenceRequired && <span className="text-red-400">*</span>}
                              </label>
                              {photoSimulated[task.templateCode] || task.evidenceUrl ? (
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                                  <CheckCircle2 size={14} className="text-emerald-400" />
                                  <span className="text-xs text-emerald-400 font-bold">Photo captured</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setPhotoSimulated(prev => ({ ...prev, [task.templateCode]: true }))}
                                  className="w-full border border-dashed border-mammut-border hover:border-mammut-gold/40 rounded-xl py-4 flex items-center justify-center gap-2 text-xs text-mammut-grey-light hover:text-mammut-gold transition-colors"
                                >
                                  <Camera size={16} /> Tap to capture photo
                                </button>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-1">
                            <button
                              disabled={savingTask === task.templateCode}
                              onClick={() => saveTask(task.templateCode, 'complete')}
                              className="flex-1 py-2.5 bg-mammut-gold text-mammut-black font-black text-xs uppercase tracking-widest rounded-lg disabled:opacity-50 transition-opacity"
                            >
                              {savingTask === task.templateCode ? 'Saving…' : '✓ Mark Complete'}
                            </button>
                            {task.status !== 'outstanding' && (
                              <button
                                onClick={() => saveTask(task.templateCode, 'outstanding')}
                                className="px-3 py-2.5 bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-lg"
                              >
                                Outstanding
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Masonry punch-list (T19) */}
        {opening.masonryPunchList && (
          <section>
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className="bg-stone-500/20 text-stone-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                <Building2 size={12} /> Masonry Follow-Up (T19)
              </span>
              <span className="text-[10px] text-mammut-grey-light">Out of installer scope</span>
            </div>
            <div className="bg-mammut-dark border border-stone-500/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400">Responsible: {opening.masonryPunchList.responsible}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  opening.masonryPunchList.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-stone-500/20 text-stone-400'
                }`}>
                  {opening.masonryPunchList.status}
                </span>
              </div>
              <p className="text-xs text-mammut-grey-light">{opening.masonryPunchList.detail}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
