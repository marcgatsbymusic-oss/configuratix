import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, PackageCheck, Factory, CheckCircle2, 
  MapPin, Clock, AlertTriangle, MoreHorizontal,
  ChevronRight, Calendar
} from 'lucide-react';
import dummyOrders from '../../data/dummy_orders.json';

// --- Types & Constants ---
type Order = typeof dummyOrders[0];

const COLUMNS = [
  { id: 'Order Placed', title: 'Order Placed', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'Manufacturing', title: 'Manufacturing', icon: Factory, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 'Quality Control', title: 'Quality Control', icon: PackageCheck, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { id: 'Loading', title: 'Loading', icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 'Transit', title: 'Transit', icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { id: 'Delivered', title: 'Delivered', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' }
];

// Map raw dummy data status to exact columns
const mapStatusToColumn = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('placed') || s.includes('deposit')) return 'Order Placed';
  if (s.includes('manufacturing')) return 'Manufacturing';
  if (s.includes('quality')) return 'Quality Control';
  if (s.includes('loading') || s.includes('warehouse')) return 'Loading';
  if (s.includes('transit')) return 'Transit';
  return 'Delivered'; // Default for Site Delivery, Installation, Delivered, Final Payment
};

// Map payment progress
const getPaymentProgress = (colId: string) => {
  switch (colId) {
    case 'Order Placed': return 30; // Deposit paid
    case 'Manufacturing': return 50;
    case 'Quality Control': return 75;
    case 'Loading': return 90;
    case 'Transit': return 90;
    case 'Delivered': return 100;
    default: return 0;
  }
};

// --- Components ---

const OrderCard = ({ order, columnId }: { order: Order; columnId: string }) => {
  const paymentProgress = getPaymentProgress(columnId);
  const isAlert = order.value > 50000; // Fake alert condition for high value orders

  return (
    <div className="bg-mammut-dark border border-mammut-border rounded-xl p-4 shadow-lg hover:border-mammut-gold/50 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-mammut-gold px-2 py-1 bg-mammut-gold/10 rounded-md">
            {order.id}
          </span>
          <h4 className="text-mammut-white font-semibold mt-2 truncate max-w-[160px]">{order.customer}</h4>
        </div>
        <button className="text-mammut-grey-light hover:text-mammut-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-mammut-grey-light">
          <span>System:</span>
          <span className="text-mammut-white font-medium truncate max-w-[100px]">{order.system}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-mammut-grey-light">
          <span>Channel:</span>
          <span className="text-mammut-white truncate max-w-[100px]">{order.channel}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-mammut-grey-light">
          <span>Value:</span>
          <span className="text-emerald-400 font-bold">€{order.value.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="mt-3 pt-3 border-t border-mammut-border/50">
        <div className="flex justify-between text-[10px] text-mammut-grey-light mb-1.5 uppercase font-bold tracking-wider">
          <span>Payment Status</span>
          <span>{paymentProgress}%</span>
        </div>
        <div className="w-full bg-mammut-darker rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              paymentProgress === 100 ? 'bg-emerald-500' : 'bg-mammut-gold'
            }`} 
            style={{ width: `${paymentProgress}%` }}
          />
        </div>
      </div>

      {isAlert && columnId !== 'Delivered' && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-400/10 px-2 py-1.5 rounded-md font-medium">
          <AlertTriangle size={12} />
          High-Value Order - Priority Route
        </div>
      )}
    </div>
  );
};

export function LogisticsPipeline() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  // Group orders into columns
  const ordersByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = dummyOrders.filter(
      o => mapStatusToColumn(o.status) === col.id && 
           (o.id.toLowerCase().includes(search.toLowerCase()) || 
            o.customer.toLowerCase().includes(search.toLowerCase()))
    );
    return acc;
  }, {} as Record<string, Order[]>);

  const totalActive = dummyOrders.filter(o => mapStatusToColumn(o.status) !== 'Delivered').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-mammut-white">Logistics & Fulfillment</h2>
          <p className="text-mammut-grey-light text-sm mt-1">
            Tracking {totalActive} active orders across the delivery pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-mammut-dark border border-mammut-border text-mammut-white text-sm rounded-lg pl-4 pr-10 py-2 w-64 focus:outline-none focus:border-mammut-gold transition-colors"
            />
          </div>
          <button className="bg-mammut-gold hover:bg-mammut-gold-light text-mammut-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <Calendar size={16} />
            Schedule Run
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max px-1">
          {COLUMNS.map((col) => {
            const columnOrders = ordersByColumn[col.id] || [];
            
            return (
              <div key={col.id} className="w-[320px] flex flex-col shrink-0 h-full">
                {/* Column Header */}
                <div className={`flex items-center justify-between p-3 rounded-t-xl border-t border-x ${col.border} ${col.bg} mb-3`}>
                  <div className="flex items-center gap-2">
                    <col.icon className={`w-5 h-5 ${col.color}`} />
                    <h3 className={`font-bold ${col.color}`}>{col.title}</h3>
                  </div>
                  <span className="bg-mammut-black/40 text-mammut-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Column Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {columnOrders.map(order => (
                    <OrderCard key={order.id} order={order} columnId={col.id} />
                  ))}
                  
                  {columnOrders.length === 0 && (
                    <div className="border-2 border-dashed border-mammut-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-mammut-dark flex items-center justify-center mb-3">
                        <col.icon className="w-5 h-5 text-mammut-grey-light opacity-50" />
                      </div>
                      <p className="text-mammut-grey-light text-sm">No orders in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
