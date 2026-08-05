import React, { useState } from 'react';
import { Package, Search, CheckCircle2, AlertTriangle, FileWarning, Camera } from 'lucide-react';

interface InstallationItem {
  id: string;
  category: string;
  description: string;
  barcodeStatus: 'PENDING' | 'CONFIRMED' | 'DISCREPANCY';
}

interface DiscrepancyForm {
  type: 'MISSING' | 'DAMAGED' | 'UNEXPECTED';
  reason: string;
}

export const DeliveryReconciliation: React.FC = () => {
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [listData, setListData] = useState<{ id: string; items: InstallationItem[] } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');

  // Discrepancy modal state
  const [activeItem, setActiveItem] = useState<InstallationItem | null>(null);
  const [discrepancyForm, setDiscrepancyForm] = useState<DiscrepancyForm>({ type: 'DAMAGED', reason: '' });

  const loadShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/orders/by-shipment/${shipmentNumber}`, {
        headers: { 'x-mock-role': 'DISPATCHER' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setListData(data.list);
    } catch (err: any) {
      setError(err.message);
      setListData(null);
    }
  };

  const simulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listData) return;
    setError('');
    
    // Simulate finding the item by barcode (in this naive mock, we assume the barcode IS the item ID)
    const item = listData.items.find(i => i.id === scannedBarcode || i.category === 'WINDOW' && i.barcodeStatus === 'PENDING');
    if (!item) {
      setError('Barcode not recognised in this shipment.');
      return;
    }

    try {
      const res = await fetch(`/api/delivery/reconcile-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-mock-role': 'DISPATCHER' },
        body: JSON.stringify({ itemId: item.id, scannedBarcode, status: 'CONFIRMED' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(`Confirmed item: ${item.description}`);
      setListData({
        ...listData,
        items: listData.items.map(i => i.id === item.id ? { ...i, barcodeStatus: 'CONFIRMED' } : i)
      });
      setScannedBarcode('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const reportDiscrepancy = async () => {
    if (!activeItem) return;
    try {
      const res = await fetch(`/api/delivery/discrepancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-mock-role': 'DISPATCHER' },
        body: JSON.stringify({
          itemId: activeItem.id,
          type: discrepancyForm.type,
          reason: discrepancyForm.reason,
          photoUrl: 'mock-photo-url.jpg'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Discrepancy logged for ${activeItem.description}`);
      setListData({
        ...listData!,
        items: listData!.items.map(i => i.id === activeItem.id ? { ...i, barcodeStatus: 'DISCREPANCY' } : i)
      });
      setActiveItem(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          Delivery Reconciliation
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={loadShipment} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Order Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. SHIP-001"
                value={shipmentNumber}
                onChange={e => setShipmentNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Load Shipment
            </button>
          </div>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{success}</div>}

      {listData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Checklist */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Shipment Checklist</h2>
            
            <form onSubmit={simulateScan} className="mb-6 bg-gray-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-blue-900 mb-1">Simulate Barcode Scanner</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Scan or type barcode..."
                  value={scannedBarcode}
                  onChange={e => setScannedBarcode(e.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium">
                  Scan
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {listData.items.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  item.barcodeStatus === 'CONFIRMED' ? 'bg-green-50 border-green-200' :
                  item.barcodeStatus === 'DISCREPANCY' ? 'bg-red-50 border-red-200' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-4">
                    {item.barcodeStatus === 'CONFIRMED' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : item.barcodeStatus === 'DISCREPANCY' ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="font-semibold">{item.description}</p>
                      <p className="text-sm text-gray-500">Category: {item.category}</p>
                    </div>
                  </div>
                  {item.barcodeStatus === 'PENDING' && (
                    <button 
                      onClick={() => setActiveItem(item)}
                      className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Report Discrepancy
                    </button>
                  )}
                  {item.barcodeStatus === 'DISCREPANCY' && (
                    <span className="px-3 py-1 text-xs font-bold text-red-800 bg-red-200 rounded-full uppercase tracking-wide">
                      Blocked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-4">Reconciliation Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Items</span>
                <span className="font-bold text-xl">{listData.items.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-green-600">Confirmed</span>
                <span className="font-bold text-xl text-green-600">
                  {listData.items.filter(i => i.barcodeStatus === 'CONFIRMED').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-red-600">Discrepancies</span>
                <span className="font-bold text-xl text-red-600">
                  {listData.items.filter(i => i.barcodeStatus === 'DISCREPANCY').length}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Discrepancy Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileWarning className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold">Report Discrepancy</h2>
            </div>
            <p className="mb-6 text-gray-600">Reporting an issue for: <span className="font-semibold text-gray-900">{activeItem.description}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  value={discrepancyForm.type}
                  onChange={e => setDiscrepancyForm({ ...discrepancyForm, type: e.target.value as any })}
                >
                  <option value="DAMAGED">Damaged</option>
                  <option value="MISSING">Missing</option>
                  <option value="UNEXPECTED">Unexpected Item</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 h-24"
                  placeholder="Describe the issue..."
                  value={discrepancyForm.reason}
                  onChange={e => setDiscrepancyForm({ ...discrepancyForm, reason: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 cursor-not-allowed">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Camera simulation...</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={reportDiscrepancy}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Submit & Block Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
