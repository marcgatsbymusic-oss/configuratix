import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props {
  listId: string;
  onBack: () => void;
  onSaved: (names: string[]) => void;
}

const DEFAULT_CREW = ['Marc', 'Garida', 'Joan', 'Luis'];

export function CrewSetup({ listId, onBack, onSaved }: Props) {
  const [names, setNames] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from backend first, then localStorage fallback
    const loadCrew = async () => {
      try {
        const token = localStorage.getItem('auth_token') || 'INSTALLER';
        const res = await fetch(`${API_BASE_URL}/api/orders/lists/${listId}/crew`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.crew && data.crew.length > 0) {
          setNames(data.crew.map((c: any) => c.name));
          return;
        }
      } catch { /* offline */ }
      const stored = localStorage.getItem(`crew_${listId}`);
      if (stored) {
        setNames(JSON.parse(stored));
      } else {
        setNames([...DEFAULT_CREW]);
      }
    };
    loadCrew();
  }, [listId]);

  const addName = () => {
    const trimmed = input.trim();
    if (!trimmed || names.includes(trimmed)) return;
    setNames(prev => [...prev, trimmed]);
    setInput('');
  };

  const removeName = (name: string) => setNames(prev => prev.filter(n => n !== name));

  const saveCrew = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || 'INSTALLER';
      await fetch(`${API_BASE_URL}/api/orders/lists/${listId}/crew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ names })
      });
    } catch { /* offline — save locally */ }
    localStorage.setItem(`crew_${listId}`, JSON.stringify(names));
    setSaved(true);
    setSaving(false);
    setTimeout(() => { onSaved(names); }, 600);
  };

  return (
    <div className="min-h-screen bg-mammut-darker text-mammut-white font-sans">
      <header className="bg-mammut-dark border-b border-mammut-border p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-mammut-border transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-black text-sm uppercase tracking-widest">Crew Roster</h1>
            <p className="text-xs text-mammut-grey-light">Select who's on site — reusable for all tasks</p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Info */}
        <div className="bg-mammut-gold/10 border border-mammut-gold/30 rounded-xl p-4 text-xs text-mammut-grey-light">
          Add all crew members on site. Their names will appear as selectable options on every task,
          so you don't have to retype them. Multiple people can be attributed to the same task.
        </div>

        {/* Name list */}
        <div className="space-y-2">
          {names.map(name => (
            <div key={name} className="flex items-center justify-between bg-mammut-dark border border-mammut-border rounded-xl px-4 py-3">
              <span className="font-bold text-sm">{name}</span>
              <button onClick={() => removeName(name)} className="p-1 text-mammut-grey-light hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {names.length === 0 && (
            <p className="text-center text-mammut-grey-light text-xs py-8">No crew members yet. Add names below.</p>
          )}
        </div>

        {/* Add input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addName()}
            placeholder="Enter name…"
            className="flex-1 bg-mammut-dark border border-mammut-border text-mammut-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-mammut-gold"
          />
          <button
            onClick={addName}
            className="flex items-center gap-2 px-4 py-3 bg-mammut-border hover:bg-mammut-grey-light/20 rounded-xl text-sm font-bold transition-colors"
          >
            <UserPlus size={16} />
          </button>
        </div>

        {/* Quick-add defaults */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-mammut-grey-light mb-2">Quick add from last job</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CREW.filter(n => !names.includes(n)).map(name => (
              <button
                key={name}
                onClick={() => setNames(prev => [...prev, name])}
                className="px-3 py-1.5 bg-mammut-border hover:bg-mammut-grey-light/20 rounded-lg text-xs font-bold transition-colors"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveCrew}
          disabled={names.length === 0 || saving || saved}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-mammut-gold text-mammut-black disabled:opacity-50'
          }`}
        >
          {saved ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Saved!</span>
                 : saving ? 'Saving…' : 'Save Crew Roster'}
        </button>
      </div>
    </div>
  );
}
