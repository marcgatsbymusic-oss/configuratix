import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface Opening {
  id: string;
  room: string;
  elevation: string;
  reference: string;
  items: Array<{
    description: string;
    width: number;
    height: number;
    system: string;
  }>;
}

export const LabelsPrint: React.FC = () => {
  const [openings, setOpenings] = useState<Opening[]>([]);

  useEffect(() => {
    // In a real app, this should fetch filtered openings, e.g. for a specific project or list.
    fetch('/api/openings', {
      headers: { 'x-mock-role': 'DISPATCHER' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.openings) setOpenings(data.openings);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen text-black print:bg-white">
      {/* Hide controls when printing */}
      <div className="p-4 print:hidden bg-white shadow mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Opening Labels (QR)</h1>
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Print A4 Labels
        </button>
      </div>

      <div className="print:p-0 p-8 flex flex-col items-center gap-8">
        {openings.map(opening => (
          <div 
            key={opening.id} 
            className="w-[210mm] h-[297mm] bg-white shadow-xl print:shadow-none p-12 flex flex-col break-after-page box-border border print:border-none"
          >
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="border-b pb-8 mb-8 text-center">
                <h1 className="text-5xl font-bold mb-4">{opening.reference}</h1>
                <h2 className="text-3xl text-gray-600">{opening.room} &mdash; {opening.elevation}</h2>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 gap-12">
                {/* QR Code Column */}
                <div className="w-1/3 flex flex-col items-center border-r pr-12">
                  <div className="p-4 border-4 border-black mb-4">
                    <QRCode value={opening.id} size={200} level="H" />
                  </div>
                  <p className="text-sm font-mono text-center text-gray-500 break-all">{opening.id}</p>
                  <p className="mt-8 text-xl text-center font-semibold uppercase tracking-wider text-gray-600">Scan via Installer App</p>
                </div>

                {/* Details Column */}
                <div className="w-2/3 flex flex-col gap-6">
                  <h3 className="text-2xl font-bold border-b pb-2">Assigned Components</h3>
                  {opening.items.length === 0 ? (
                    <p className="text-gray-500 italic text-xl">No components assigned yet.</p>
                  ) : (
                    opening.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 border p-6 rounded-lg">
                        <p className="text-2xl font-bold mb-2">{item.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xl">
                          <div><span className="text-gray-500">System:</span> {item.system || 'N/A'}</div>
                          <div>
                            <span className="text-gray-500">Size:</span> {item.width || 0} &times; {item.height || 0} mm
                          </div>
                        </div>
                        {/* Fallback diagram for Windows if no schematicUrl */}
                        <div className="mt-6 border-2 border-dashed border-gray-300 w-full h-48 flex items-center justify-center bg-white rounded">
                           {/* Simplified wireframe representation */}
                           <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                             <rect x="20" y="10" width="160" height="80" fill="none" stroke="#ccc" strokeWidth="4" />
                             <rect x="25" y="15" width="70" height="70" fill="#f9f9f9" stroke="#ddd" strokeWidth="2" />
                             <rect x="105" y="15" width="70" height="70" fill="#f9f9f9" stroke="#ddd" strokeWidth="2" />
                             <line x1="25" y1="15" x2="95" y2="85" stroke="#eee" strokeWidth="1" />
                             <line x1="105" y1="15" x2="175" y2="85" stroke="#eee" strokeWidth="1" />
                           </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-8 border-t text-center text-gray-400 font-mono text-sm">
                Configurator Platform &bull; Installation Module
              </div>
            </div>
          </div>
        ))}
        {openings.length === 0 && (
          <div className="text-center p-12 text-gray-500 text-xl print:hidden">
            No openings found to print.
          </div>
        )}
      </div>
    </div>
  );
};
