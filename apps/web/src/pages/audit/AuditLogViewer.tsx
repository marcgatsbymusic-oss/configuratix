import React, { useState } from 'react';

// Mock Data
const MOCK_AUDIT_LOGS = [
  {
    id: 'AL_001',
    timestamp: new Date().toISOString(),
    actorId: 'INSTALLER_BOB',
    actionType: 'UPDATE',
    entityType: 'InstallationItem',
    entityId: 'ITEM_123',
    afterValue: { barcodeStatus: 'DAMAGED', notes: 'Scratched during transit' }
  },
  {
    id: 'AL_002',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actorId: 'SUP_99',
    actionType: 'UPDATE',
    entityType: 'OverrideRequest',
    entityId: 'OR_456',
    afterValue: { status: 'APPROVED', reason: 'Substrate crumbled' }
  }
];

export const AuditLogViewer: React.FC = () => {
  const [logs] = useState(MOCK_AUDIT_LOGS);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">System Audit Log</h1>
        <p className="text-slate-500 mt-2">Immutable record of critical domain mutations (FR-7.2)</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Timestamp</th>
              <th className="p-4 font-bold">Actor</th>
              <th className="p-4 font-bold">Action</th>
              <th className="p-4 font-bold">Entity</th>
              <th className="p-4 font-bold">Entity ID</th>
              <th className="p-4 font-bold w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{log.actorId}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{log.entityType}</td>
                  <td className="p-4 font-mono text-sm text-slate-500">{log.entityId}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleExpand(log.id)}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      {expandedLogId === log.id ? '▼' : '▶'}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded details row */}
                {expandedLogId === log.id && (
                  <tr className="bg-slate-900 text-slate-300">
                    <td colSpan={6} className="p-4 border-l-4 border-blue-500">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Mutation Snapshot (afterValue)
                      </div>
                      <pre className="font-mono text-sm bg-black p-4 rounded overflow-x-auto text-green-400">
                        {JSON.stringify(log.afterValue, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No audit records found.
          </div>
        )}
      </div>
    </div>
  );
};
