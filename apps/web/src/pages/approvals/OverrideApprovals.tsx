import React, { useState } from 'react';

// Shell components to mock the layout until UI library is integrated
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`border rounded-lg shadow p-4 bg-white ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'danger' | 'secondary' }) => {
  const baseStyle = 'px-4 py-2 rounded font-semibold text-white';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    secondary: 'bg-gray-500 hover:bg-gray-600'
  };
  return <button className={`${baseStyle} ${variants[variant]}`} onClick={onClick}>{children}</button>;
};

// DTO representation
interface OverrideRequestDTO {
  id: string;
  stepInstanceId: string;
  requestedBy: { id: string; name: string };
  proposedMethod: string;
  reason: string;
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

/**
 * Back office approval UI showing the request context and photos. (Prompt 8)
 * Accessible only to SUPERVISOR roles.
 */
export const OverrideApprovals: React.FC = () => {
  // In a real implementation, this would fetch from tRPC / REST
  const [requests, setRequests] = useState<OverrideRequestDTO[]>([
    {
      id: 'req-001',
      stepInstanceId: 'inst-789',
      requestedBy: { id: 'usr-1', name: 'Jan Kowalski' },
      proposedMethod: 'Use chemical anchors instead of standard frame screws',
      reason: 'Substrate is hollow brick, standard 6mm concrete bit shattered the internal webbing.',
      photos: ['/uploads/hollow-brick.jpg'],
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ]);

  const [decisionNotes, setDecisionNotes] = useState('');

  const handleDecision = async (id: string, isApproved: boolean) => {
    // API Call goes here (e.g., api.overrides.approve.mutate({ requestId: id, decisionNotes }))
    console.log(`Decision for ${id}: ${isApproved ? 'APPROVED' : 'REJECTED'}. Notes: ${decisionNotes}`);
    
    // Optimistic UI update
    setRequests(prev => prev.filter(r => r.id !== id));
    setDecisionNotes('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending Override Requests</h1>
      
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending overrides to review.</p>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <Card key={req.id} className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Request {req.id}</h2>
                    <p className="text-sm text-gray-500">Requested by {req.requestedBy.name} on {new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                    {req.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Proposed Method</h3>
                  <p className="bg-gray-50 p-3 rounded">{req.proposedMethod}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Reason</h3>
                  <p className="bg-gray-50 p-3 rounded">{req.reason}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Decision Notes</h3>
                  <textarea 
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Enter notes (required for rejection)"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="primary" onClick={() => handleDecision(req.id, true)}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleDecision(req.id, false)}>
                    Reject
                  </Button>
                </div>
              </div>

              {/* Photos Panel */}
              <div className="w-full md:w-1/3 space-y-2">
                <h3 className="font-semibold text-gray-700">Attached Evidence</h3>
                {req.photos.length > 0 ? (
                  req.photos.map((photo, idx) => (
                    <div key={idx} className="aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm overflow-hidden border">
                      {/* Placeholder for actual image rendering */}
                      <span className="italic">Image: {photo}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No photos provided.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
