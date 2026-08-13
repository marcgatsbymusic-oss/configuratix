import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, CheckCircle2, Camera, Edit3, 
  ChevronRight, Calendar, AlertTriangle, Truck, Layers
} from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { OpeningWorkflow } from './OpeningWorkflow';
import { CrewSetup } from './CrewSetup';


// --- Dummy Data ---
const TODAY_SCHEDULE = [
  { id: 'W-9006', customer: 'Green Tech HQ', time: '08:00 AM', address: '123 Tech Park, Berlin', system: 'Schüco AWS 75', items: 12, status: 'In Progress' },
  { id: 'W-9013', customer: 'Michael Ross', time: '01:00 PM', address: '45 Lake View, Munich', system: 'Reynaers CF 77', items: 4, status: 'Pending' },
  { id: 'W-9020', customer: 'Bella Vista', time: '03:30 PM', address: '88 Vista Dr, Hamburg', system: 'Reynaers CP 155', items: 2, status: 'Pending' }
];

const CHECKLIST_ITEMS = [
  'Scaffolding & access routes cleared',
  'Apertures measured and match specifications',
  'All frames accounted for and undamaged',
  'Customer or site manager is present',
  'Safety briefing completed'
];

export function InstallerDashboard() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(CHECKLIST_ITEMS.length).fill(false));
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [jobComplete, setJobComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'openings'>('schedule');
  const [openings, setOpenings] = useState<any[]>([]);
  const [crewRoster, setCrewRoster] = useState<string[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [selectedOpening, setSelectedOpening] = useState<any | null>(null);
  const [showCrewSetup, setShowCrewSetup] = useState(false);


  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const loadData = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const installerEmail = queryParams.get('email') || 'marc.truekalia+installer@gmail.com';

        const usersRes = await fetch(`${API_BASE_URL}/api/identity/users`, {
          headers: { 'x-mock-role': 'INSTALLER' }
        });

        let currentUserId = '';
        if (usersRes.ok) {
          const userData = await usersRes.json();
          const matched = userData.users?.find((u: any) => u.email?.toLowerCase() === installerEmail.toLowerCase());
          if (matched) {
            currentUserId = matched.id;
          }
        }

        const listsRes = await fetch(`${API_BASE_URL}/api/orders/lists`, {
          headers: { 'x-mock-role': 'INSTALLER' }
        });

        if (listsRes.ok) {
          const listsData = await listsRes.json();
          const assignedLists = listsData.lists?.filter((list: any) => 
            list.assignedInstallerId === currentUserId || 
            list.assignedLeadId === currentUserId
          ) || [];

          if (assignedLists.length > 0) {
            const mappedSchedule = assignedLists.map((list: any, index: number) => {
              const orderNum = list.order?.orderNumber || list.orderId;
              const hours = 8 + (index * 3) % 12;
              const timeString = `${hours < 10 ? '0' + hours : hours}:00 ${hours >= 12 ? 'PM' : 'AM'}`;
              return {
                id: list.id,
                orderNumber: orderNum,
                customer: list.order?.customerName || `Order #${orderNum}`,
                time: timeString,
                address: list.order?.sourceData?.project || 'Site Address',
                system: list.items?.[0]?.system || 'Veka/Iglo5 System',
                items: list.items?.length || 0,
                status: list.status === 'DRAFT' || list.status === 'READY' ? 'Pending' : (list.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed')
              };
            });
            setSchedule(mappedSchedule);
            setSelectedJob(mappedSchedule[0]);

            // Load openings for the first list
            const firstList = assignedLists[0];
            setActiveListId(firstList.id);
            try {
              const [openingsRes, crewRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/orders/lists/${firstList.id}/openings`, { headers: { 'x-mock-role': 'INSTALLER' } }),
                fetch(`${API_BASE_URL}/api/orders/lists/${firstList.id}/crew`, { headers: { 'x-mock-role': 'INSTALLER' } })
              ]);
              if (openingsRes.ok) { const d = await openingsRes.json(); setOpenings(d.openings || []); }
              if (crewRes.ok) { const d = await crewRes.json(); setCrewRoster(d.crew?.map((c: any) => c.name) || []); }
            } catch { /* offline */ }

            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to load backend schedule, using mock schedule:", err);
      }

      setSchedule(TODAY_SCHEDULE);
      setSelectedJob(TODAY_SCHEDULE[0]);
      setLoading(false);
    };

    loadData();
  }, []);


  // Canvas Signature State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Handle canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set proper canvas resolution for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c88a3e'; // Mammut Gold
  }, [selectedJob]); // Re-init when switching jobs

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleToggleChecklist = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  const allChecked = checklist.every(Boolean);

  const handleSubmit = () => {
    if (allChecked && photoUploaded && hasSignature) {
      setJobComplete(true);
    }
  };

  if (jobComplete) {
    return (
      <div className="min-h-screen bg-mammut-darker flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-mammut-white mb-2">Job Completed!</h2>
        <p className="text-mammut-grey-light mb-8 max-w-xs">
          Installation for {selectedJob.customer} has been successfully synced to the admin backend.
        </p>
        <button 
          onClick={() => {
            setJobComplete(false);
            setChecklist(new Array(CHECKLIST_ITEMS.length).fill(false));
            setPhotoUploaded(false);
            setHasSignature(false);
          }}
          className="bg-mammut-gold text-mammut-black font-bold uppercase tracking-widest px-8 py-3 rounded-xl w-full max-w-xs"
        >
          Return to Schedule
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mammut-darker flex flex-col items-center justify-center text-mammut-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mammut-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-sm uppercase tracking-widest text-mammut-grey-light animate-pulse">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  if (!selectedJob && openings.length === 0) {
    return (
      <div className="min-h-screen bg-mammut-darker flex flex-col items-center justify-center text-mammut-white p-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-mammut-grey-light">No assigned installation routes found for today.</p>
        </div>
      </div>
    );
  }

  // --- Full-screen sub-views ---
  if (showCrewSetup && activeListId) {
    return (
      <CrewSetup
        listId={activeListId}
        onBack={() => setShowCrewSetup(false)}
        onSaved={(names) => { setCrewRoster(names); setShowCrewSetup(false); }}
      />
    );
  }

  if (selectedOpening) {
    return (
      <OpeningWorkflow
        opening={selectedOpening}
        crewRoster={crewRoster.length > 0 ? crewRoster : ['Marc', 'Garida', 'Joan', 'Luis']}
        listId={activeListId || ''}
        onBack={() => setSelectedOpening(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-mammut-darker text-mammut-white font-sans flex flex-col pb-20 md:pb-0">
      {/* App Bar */}
      <header className="bg-mammut-dark border-b border-mammut-border p-4 sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-mammut-gold text-mammut-black p-1.5 rounded-lg">
              <Truck size={18} />
            </div>
            <h1 className="font-black tracking-widest uppercase text-sm">Field Ops</h1>
          </div>
          <div className="flex items-center gap-2">
            {activeListId && (
              <button
                onClick={() => setShowCrewSetup(true)}
                className="text-xs text-mammut-grey-light hover:text-mammut-gold transition-colors px-2 py-1 rounded-lg hover:bg-mammut-border"
              >
                👷 Crew
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex gap-1 mt-3 bg-mammut-border/40 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'schedule' ? 'bg-mammut-dark text-mammut-white' : 'text-mammut-grey-light'
            }`}
          >
            <Calendar size={12} /> Schedule
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'openings' ? 'bg-mammut-dark text-mammut-white' : 'text-mammut-grey-light'
            }`}
          >
            <Layers size={12} /> Openings
            {openings.length > 0 && (
              <span className="bg-mammut-gold text-mammut-black text-[9px] font-black px-1.5 py-0.5 rounded-full">{openings.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-6">
        
        {/* Daily Schedule Widget */}
        {activeTab === 'schedule' && (
          <React.Fragment>
          <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-mammut-gold">
              <Calendar size={18} /> Today's Route
            </h2>
            <span className="text-xs text-mammut-grey-light font-bold">{schedule.length} {schedule.length === 1 ? 'Job' : 'Jobs'}</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
            {schedule.map((job) => (
              <div 
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setChecklist(new Array(CHECKLIST_ITEMS.length).fill(false));
                  setPhotoUploaded(false);
                  setHasSignature(false);
                }}
                className={`snap-center shrink-0 w-64 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  selectedJob?.id === job.id 
                    ? 'bg-mammut-gold/10 border-mammut-gold/50' 
                    : 'bg-mammut-dark border-mammut-border hover:border-mammut-grey-light/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-mammut-gold">{job.time}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{job.customer}</h3>
                <p className="text-xs text-mammut-grey-light flex items-center gap-1 mb-2 truncate">
                  <MapPin size={12} /> {job.address}
                </p>
                <div className="text-[10px] text-mammut-grey-light font-medium bg-mammut-darker px-2 py-1 rounded-md inline-block">
                  {job.items} frames • {job.system}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-mammut-border" />

        {/* Active Job Details */}
        {selectedJob && (
        <section className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle size={20} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-1">Active Job: {selectedJob.customer}</h3>
              <p className="text-xs text-mammut-grey-light">Complete the site readiness checklist before unloading frames.</p>
            </div>
          </div>

          {/* Site Readiness Checklist */}
          <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mammut-gold" /> Site Readiness
            </h3>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={checklist[idx]}
                      onChange={() => handleToggleChecklist(idx)}
                      className="peer sr-only" 
                    />
                    <div className="w-5 h-5 border-2 border-mammut-grey-light rounded-md peer-checked:bg-mammut-gold peer-checked:border-mammut-gold transition-colors flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-mammut-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className={`text-sm select-none transition-colors ${checklist[idx] ? 'text-mammut-grey-light line-through' : 'text-mammut-white group-hover:text-mammut-gold'}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Camera size={18} className="text-mammut-gold" /> Completion Photo
            </h3>
            
            {!photoUploaded ? (
              <button 
                onClick={() => setPhotoUploaded(true)}
                className="w-full border-2 border-dashed border-mammut-border hover:border-mammut-gold/50 bg-mammut-darker hover:bg-mammut-dark transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-mammut-grey-light"
              >
                <div className="w-12 h-12 bg-mammut-dark rounded-full flex items-center justify-center shadow-inner">
                  <Camera size={24} className="text-mammut-white" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-sm text-mammut-white block mb-1">Tap to Open Camera</span>
                  <span className="text-xs">Take a wide shot of the installed units</span>
                </div>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500/50">
                <div className="absolute top-2 right-2 bg-emerald-500 text-mammut-black text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Uploaded
                </div>
                <img src="/assets/hero-bg.webp" alt="Installed Window" className="w-full h-40 object-cover opacity-80" />
                <button 
                  onClick={() => setPhotoUploaded(false)}
                  className="absolute bottom-2 right-2 bg-mammut-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg hover:bg-mammut-black transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            )}
          </div>

          {/* Digital Signature Pad */}
          <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-5 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Edit3 size={18} className="text-mammut-gold" /> Customer Sign-Off
              </h3>
              {hasSignature && (
                <button onClick={clearSignature} className="text-xs text-red-400 hover:text-red-300 font-bold">
                  Clear
                </button>
              )}
            </div>
            
            <div className="bg-mammut-darker border border-mammut-border rounded-xl overflow-hidden touch-none relative">
              {!hasSignature && !isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <span className="text-2xl font-black uppercase tracking-widest text-mammut-white">Sign Here</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="w-full h-48 cursor-crosshair"
              />
            </div>
            <p className="text-[10px] text-mammut-grey-light mt-3 text-center uppercase tracking-widest">
              I confirm the installation has been completed to my satisfaction.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            disabled={!allChecked || !photoUploaded || !hasSignature}
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-mammut-gold/20 flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none bg-mammut-gold text-mammut-black hover:bg-mammut-gold-light"
          >
            Submit Field Report <ChevronRight size={18} />
          </button>
          
          <div className="h-6"></div> {/* Bottom Spacer for mobile */}
        </section>
        )} {/* end selectedJob */}
        </React.Fragment>
        )} {/* end activeTab === 'schedule' */}

        {/* Openings Tab */}
        {activeTab === 'openings' && (
          <section>
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-mammut-gold">
                <Layers size={18} /> Window Openings
              </h2>
              <span className="text-xs text-mammut-grey-light font-bold">{openings.length} openings</span>
            </div>

            {openings.length === 0 ? (
              <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-8 text-center">
                <p className="text-mammut-grey-light text-sm">No openings loaded yet.</p>
                <p className="text-xs text-mammut-grey-light/60 mt-1">Openings are seeded from the admin backend for order 369264.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openings.map((op: any) => {
                  const completedTasks = op.taskInstances?.filter((t: any) => t.status === 'complete').length || 0;
                  const totalTasks = op.taskInstances?.length || 0;
                  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  const hasOutstanding = op.taskInstances?.some((t: any) => t.status === 'outstanding');
                  const isUnconfirmed = !op.locationConfirmed || op.matchConfidence === 'low';

                  return (
                    <button
                      key={op.id}
                      onClick={() => setSelectedOpening(op)}
                      className={`w-full text-left bg-mammut-dark rounded-2xl border overflow-hidden transition-colors ${
                        hasOutstanding ? 'border-amber-500/40' : 'border-mammut-border hover:border-mammut-grey-light/50'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-mammut-gold font-mono">{op.openingId}</span>
                              {isUnconfirmed && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">⚠ UNCONFIRMED</span>
                              )}
                              {hasOutstanding && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">OUTSTANDING</span>
                              )}
                            </div>
                            <p className="font-bold text-sm truncate">{op.location}</p>
                            <p className="text-xs text-mammut-grey-light truncate">{op.productType}</p>
                            <p className="text-xs text-mammut-grey-light">{op.widthMm}×{op.heightMm}mm · {op.weightKg}kg</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <ChevronRight size={16} className="text-mammut-grey-light" />
                            <span className="text-xs font-bold text-mammut-gold">{completedTasks}/{totalTasks}</span>
                          </div>
                        </div>

                        {/* Task progress bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-mammut-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : hasOutstanding ? 'bg-amber-500' : 'bg-mammut-gold'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Per-person time summary */}
                        {op.taskInstances?.some((t: any) => t.timeLogs?.length > 0) && (
                          <div className="mt-2 flex gap-3 flex-wrap">
                            {(() => {
                              const personTimes: Record<string, number> = {};
                              op.taskInstances.forEach((t: any) => {
                                t.timeLogs?.forEach((log: any) => {
                                  personTimes[log.personName] = (personTimes[log.personName] || 0) + log.minutes;
                                });
                              });
                              return Object.entries(personTimes).map(([name, mins]) => (
                                <span key={name} className="text-[10px] text-mammut-grey-light">
                                  <span className="font-bold text-mammut-white">{name}</span> {mins}m
                                </span>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

