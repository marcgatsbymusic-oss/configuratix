import React, { useEffect, useState } from 'react';

export const PerformanceConsole = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const handleCsgPerformance = (e: any) => {
      setLogs(prev => [...prev, e.detail]);
    };
    window.addEventListener('csg-performance', handleCsgPerformance);
    return () => window.removeEventListener('csg-performance', handleCsgPerformance);
  }, []);

  if (logs.length === 0) return null;

  const totalTime = logs.reduce((acc, log) => acc + log.duration, 0);

  return (
    <div className="pricing-ledger-card p-6 rounded-xl font-mono text-xs border shadow-lg text-slate-100 transition-all border-zinc-800 mt-4 w-full h-auto" style={{ backgroundColor: 'rgba(20, 20, 23, 0.95)' }}>
      <div className="border-b-2 pb-2 mb-4 sticky top-0 z-10 border-zinc-800 flex justify-between items-center" style={{ backgroundColor: 'rgba(20, 20, 23, 0.95)' }}>
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tighter text-slate-100">Performance Console</h2>
          <div className="text-slate-400 mt-1 text-[10px]">Real-time CSG processing telemetry</div>
        </div>
        <button onClick={() => setLogs([])} className="px-3 py-1 bg-zinc-800 text-slate-300 rounded hover:bg-zinc-700 transition-colors uppercase tracking-widest text-[10px] font-bold">Clear</button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-zinc-800 text-slate-300">
            <th className="py-1 pr-2">Layer</th>
            <th className="py-1 pr-2">Length</th>
            <th className="py-1 pr-2">Vertices</th>
            <th className="py-1 text-right">Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i} className="border-b border-zinc-800/40 text-slate-100">
              <td className="py-1 pr-2">{l.layerName || l.matType || 'unknown'}</td>
              <td className="py-1 pr-2">{l.length}mm</td>
              <td className="py-1 pr-2 text-yellow-400 font-bold">{l.vertices}</td>
              <td className={`py-1 text-right font-bold ${l.duration > 100 ? 'text-red-400' : 'text-green-400'}`}>{l.duration.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-zinc-800 text-slate-100 font-black">
            <td colSpan={3} className="py-2">Total Frame Time</td>
            <td className="py-2 text-right">{totalTime.toFixed(2)}ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
