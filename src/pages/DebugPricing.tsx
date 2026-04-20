import { useEffect, useState } from 'react';
import { fetchPrice, type PricingApiResponse } from '../utils/cantorPricing/pricingApi';
import type { ConfiguratorInput } from '../utils/cantorPricing/input';

export function DebugPricing() {
  const [typology, setTypology] = useState<string>('F100');
  const [opening, setOpening] = useState<string>('UR');
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [profilsatz, setProfilsatz] = useState('IG5');
  const [colorType, setColorType] = useState('DEK-DEK');
  const [colorCode, setColorCode] = useState('0006');

  // Glazing Options
  const [glazingCode, setGlazingCode] = useState('2-24');
  const [pane1, setPane1] = useState('FL4');
  const [pane2, setPane2] = useState('T4');
  const [pane3, setPane3] = useState('');
  
  // Hardware Options
  const [safetyClass, setSafetyClass] = useState('');
  const [handleType, setHandleType] = useState('');
  const [handleColor, setHandleColor] = useState('');
  const [coverColor, setCoverColor] = useState('');

  const [result, setResult] = useState<PricingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce input changes so we don't spam the API on every keypress.
  useEffect(() => {
    const input: ConfiguratorInput = {
      article: typology,
      profilsatz,
      materialart: 2,
      beschvar: opening === 'UR' ? 'UR-P' : 'FIX',
      width_mm: width,
      height_mm: height,
      sashCount: 1,
      openings: [opening as "F" | "UR" | "U" | "D"],
      color: { type: colorType, code: colorCode },
      frameProfile: '50001',
      sashProfile: '50011',
      glazing: { code: glazingCode, panes: [pane1, pane2, pane3].filter(Boolean), spacer: 'S16' },
      hardware: {
        safetyClass: safetyClass || undefined,
        handleType: handleType || undefined,
        handleColor: handleColor || undefined,
        coverColor: coverColor || undefined
      },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchPrice({ input })
        .then(r => { setResult(r); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }, 200);
    return () => clearTimeout(t);
  }, [typology, width, height, profilsatz, colorCode, glazingCode, pane1, pane2, pane3, safetyClass, handleType, handleColor, coverColor]);

  return (
    <div className="min-h-screen bg-black text-white p-10 pt-32">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

        <div className="bg-[#111] p-8 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#eab676]">Cantor Pricing Engine</h1>
            <p className="text-xs text-gray-500 mt-1">Reads PREISE formulas from local Cantor mirror; evaluates via <code>src/utils/cantorFormula</code>.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Typology</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={typology} onChange={e => setTypology(e.target.value)}>
                <option value="F104">F104 (single-sash window)</option>
                <option value="F100">F100 (single-sash window)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Opening Type</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={opening} onChange={e => setOpening(e.target.value)}>
                <option value="F">FIX (Fixed glazing)</option>
                <option value="UR">UR-P (Tilt & Turn)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Profile System</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={profilsatz} onChange={e => setProfilsatz(e.target.value)}>
                <option value="IG5">IG5</option>
                <option value="IGECL">IGECL (Iglo Energy)</option>
                <option value="IGE">IGE</option>
                <option value="IGL">IGL</option>
                <option value="IGEDGE">IGEDGE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Width (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={width} onChange={e => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Height (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Color Scheme</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={colorType} onChange={e => setColorType(e.target.value)}>
                <option value="W-W">W-W (White / White)</option>
                <option value="DEK-DEK">DEK-DEK (Decor / Decor)</option>
                <option value="W-DEK">W-DEK (White / Decor)</option>
                <option value="DEK-W">DEK-W (Decor / White)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Color code (e.g. 0006)</label>
              <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={colorCode} onChange={e => setColorCode(e.target.value)} />
              <div className="text-xs text-gray-500 mt-1">Leave empty or "W-W" for defaults.</div>
            </div>

            <div className="col-span-2 border-t border-gray-800 pt-4 mt-2">
              <h3 className="text-[#eab676] font-bold mb-4">Glazing Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Package Code (e.g. 2-24, 3-40)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={glazingCode} onChange={e => setGlazingCode(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Pane 1 (Outside) (e.g. T4)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={pane1} onChange={e => setPane1(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Pane 2 (Middle) (e.g. FL6)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={pane2} onChange={e => setPane2(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Pane 3 (Inside) (e.g. ADB6H)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={pane3} onChange={e => setPane3(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="col-span-2 border-t border-gray-800 pt-4 mt-2 mb-2">
              <h3 className="text-[#eab676] font-bold mb-4">Hardware Options</h3>
              <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Safety Class (e.g. 4ZA, RC2)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={safetyClass} onChange={e => setSafetyClass(e.target.value)} placeholder="STD" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Handle Type (e.g. KwadratK)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={handleType} onChange={e => setHandleType(e.target.value)} placeholder="STD" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Handle Color (e.g. bialy, braz)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={handleColor} onChange={e => setHandleColor(e.target.value)} placeholder="bialy" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Cover Color (e.g. bialy)</label>
                  <input className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={coverColor} onChange={e => setCoverColor(e.target.value)} placeholder="bialy" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-[#eab676]/30 font-mono shadow-lg mt-auto">
            {loading && <div className="text-gray-500 text-sm">Evaluating formulas...</div>}
            {error && <div className="text-red-400 text-sm">Error: {error}</div>}
            {result && !error && (
              <>
                <div className="flex justify-between items-baseline pb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">SCHEMA 41 base (EK)</span>
                  <span className="text-lg text-gray-300">{result.ek_pln.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-baseline pb-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">PREISZYK × FAKTOR {result.faktor}</span>
                  <span className="text-lg text-gray-300">{result.vk_pln.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-white font-bold tracking-widest uppercase">Dealer price ({result.currency}):</span>
                  <span className="text-3xl text-emerald-400 font-black">{result.vk_local.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white text-black p-8 rounded-xl shadow-2xl font-mono text-xs overflow-y-auto max-h-[85vh]">
          <div className="border-b-2 border-black pb-2 mb-4">
            <h2 className="text-xl font-bold uppercase tracking-tighter">SCHEMA 41 ledger</h2>
            <div className="text-gray-500 mt-1">One row per PREISE formula, in declared order. GRPRS accumulates.</div>
          </div>

          {result && !error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 pr-2">Gruppe</th>
                  <th className="py-1 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((l, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${l.value !== 0 ? 'font-bold' : 'text-gray-400'}`}>
                    <td className="py-1 pr-2">{i + 1}</td>
                    <td className="py-1 pr-2">{l.formelText ?? '(no label)'}</td>
                    <td className="py-1 pr-2">{l.preisgruppe ?? '—'}</td>
                    <td className="py-1 text-right">{l.value.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black font-black">
                  <td colSpan={3} className="py-2">GRPRS total (EK PLN)</td>
                  <td className="py-2 text-right">{result.ek_pln.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {!result && !error && <div className="text-gray-500">Waiting for first response...</div>}
          {error && <div className="text-red-600">API error: {error}</div>}
        </div>

      </div>
    </div>
  );
}
