import React, { useState } from 'react';
import { 
  Users, TrendingUp, BarChart3, ArrowUpRight, 
  Shield, Award, DollarSign, Target, Activity
} from 'lucide-react';

// --- Dummy Data ---
const PARTNERS = [
  { id: 'P-1001', name: 'Build-IT Supplies', type: 'Distributor', region: 'Germany', tier: 'Silver', discount: 15, mtdSales: 45200 },
  { id: 'P-1002', name: 'City-GLZ', type: 'Installer', region: 'France', tier: 'Gold', discount: 20, mtdSales: 89000 },
  { id: 'P-1003', name: 'Ferreteria 88', type: 'Retailer', region: 'Spain', tier: 'Bronze', discount: 10, mtdSales: 12400 },
  { id: 'P-1004', name: 'Oceanic Windows', type: 'Architectural', region: 'UK', tier: 'Gold', discount: 20, mtdSales: 112000 },
  { id: 'P-1005', name: 'Sky-High Facades', type: 'Contractor', region: 'Netherlands', tier: 'Silver', discount: 15, mtdSales: 58000 },
];

const ROI_DATA = [
  { channel: 'Direct Sales', revenue: 450000, spend: 45000, spendType: 'Ad Spend', roi: 900, color: 'bg-emerald-500' },
  { channel: 'Partner Network', revenue: 820000, spend: 123000, spendType: 'Commissions', roi: 566, color: 'bg-blue-500' },
  { channel: 'External Agents', revenue: 210000, spend: 26000, spendType: 'Comm + Travel', roi: 707, color: 'bg-purple-500' },
];

const MARKETING_DATA = [
  { platform: 'Google Ads (Search)', conversion: 8.5, leads: 420, color: 'bg-blue-400' },
  { platform: 'Meta (FB/IG)', conversion: 4.3, leads: 850, color: 'bg-pink-500' },
  { platform: 'LinkedIn B2B', conversion: 12.4, leads: 115, color: 'bg-blue-600' },
  { platform: 'Trade Shows', conversion: 18.2, leads: 85, color: 'bg-mammut-gold' },
  { platform: 'Direct Traffic / SEO', conversion: 6.1, leads: 640, color: 'bg-emerald-400' },
];

// --- Components ---

const TierBadge = ({ tier }: { tier: string }) => {
  let styles = '';
  switch (tier) {
    case 'Gold': styles = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'; break;
    case 'Silver': styles = 'bg-slate-400/10 text-slate-400 border-slate-400/20'; break;
    case 'Bronze': styles = 'bg-orange-700/10 text-orange-500 border-orange-700/20'; break;
    default: styles = 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
  return (
    <span className={`px-2 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {tier}
    </span>
  );
};

export function SalesNetwork() {
  const [activeTab, setActiveTab] = useState<'network' | 'analytics'>('network');

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-mammut-white">Network & Analytics</h2>
          <p className="text-mammut-grey-light text-sm mt-1">
            Manage partner tiers, commission logic, and global marketing ROI.
          </p>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex bg-mammut-dark p-1 rounded-xl border border-mammut-border">
          <button 
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'network' ? 'bg-mammut-gold text-mammut-black' : 'text-mammut-grey-light hover:text-mammut-white'
            }`}
          >
            <Users size={16} /> Partner Network
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-mammut-gold text-mammut-black' : 'text-mammut-grey-light hover:text-mammut-white'
            }`}
          >
            <BarChart3 size={16} /> Marketing ROI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        
        {activeTab === 'network' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-mammut-dark border border-mammut-border p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-mammut-grey-light text-xs font-bold uppercase tracking-widest">
                  <Shield size={16} className="text-mammut-gold" /> Total Partners
                </div>
                <div className="text-3xl font-black text-mammut-white">48</div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> +3 this month</div>
              </div>
              <div className="bg-mammut-dark border border-mammut-border p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-mammut-grey-light text-xs font-bold uppercase tracking-widest">
                  <DollarSign size={16} className="text-blue-400" /> Network Revenue (YTD)
                </div>
                <div className="text-3xl font-black text-mammut-white">€820k</div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><ArrowUpRight size={12}/> +14% vs last year</div>
              </div>
              <div className="bg-mammut-dark border border-mammut-border p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-mammut-grey-light text-xs font-bold uppercase tracking-widest">
                  <Award size={16} className="text-purple-400" /> Avg Discount Tier
                </div>
                <div className="text-3xl font-black text-mammut-white">16.5%</div>
                <div className="text-xs text-mammut-grey-light mt-2">Weighted by sales volume</div>
              </div>
            </div>

            {/* Partner Management Table */}
            <div className="bg-mammut-dark border border-mammut-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-mammut-border flex justify-between items-center bg-mammut-darker/50">
                <h3 className="text-lg font-bold text-mammut-white flex items-center gap-2">
                  <Users size={18} className="text-mammut-gold" /> Partner Discount Tiers
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-mammut-grey-light">
                  <thead className="bg-mammut-darker/80 text-xs uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Partner Name</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Tier</th>
                      <th className="px-5 py-4">Global Discount</th>
                      <th className="px-5 py-4 text-right">MTD Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mammut-border">
                    {PARTNERS.map((p) => (
                      <tr key={p.id} className="hover:bg-mammut-darker/30 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs">{p.id}</td>
                        <td className="px-5 py-4 font-semibold text-mammut-white">{p.name}</td>
                        <td className="px-5 py-4">{p.type}</td>
                        <td className="px-5 py-4"><TierBadge tier={p.tier} /></td>
                        <td className="px-5 py-4 text-emerald-400 font-bold">{p.discount}%</td>
                        <td className="px-5 py-4 text-right font-mono">€{p.mtdSales.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* ROI Comparison */}
            <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-mammut-white flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-emerald-400" /> Sales Channel ROI
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {ROI_DATA.map(roi => (
                  <div key={roi.channel} className="bg-mammut-darker rounded-xl p-5 border border-mammut-border/50">
                    <h4 className="font-bold text-mammut-white mb-4 flex items-center justify-between">
                      {roi.channel}
                      <span className={`w-3 h-3 rounded-full ${roi.color}`}></span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-mammut-grey-light">Revenue</span>
                        <span className="font-bold text-mammut-white">€{(roi.revenue/1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mammut-grey-light">{roi.spendType}</span>
                        <span className="text-orange-400">€{(roi.spend/1000).toFixed(0)}k</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-mammut-border flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest font-bold text-mammut-grey-light">Net ROI</span>
                        <span className="text-xl font-black text-emerald-400">{roi.roi}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Native Tailwind Chart: Lead Conversion */}
            <div className="bg-mammut-dark border border-mammut-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-mammut-white flex items-center gap-2 mb-2">
                <Target size={18} className="text-blue-400" /> Marketing Platform Conversion Rates
              </h3>
              <p className="text-sm text-mammut-grey-light mb-8">Lead-to-Order Conversion (%) across acquisition channels.</p>
              
              <div className="space-y-6">
                {MARKETING_DATA.sort((a, b) => b.conversion - a.conversion).map(data => (
                  <div key={data.platform} className="relative">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="text-mammut-white">{data.platform}</span>
                      <div className="flex gap-4">
                        <span className="text-mammut-grey-light">{data.leads} Leads</span>
                        <span className="text-mammut-gold">{data.conversion}%</span>
                      </div>
                    </div>
                    {/* Background track */}
                    <div className="w-full bg-mammut-darker rounded-full h-2.5 overflow-hidden border border-mammut-border/50">
                      {/* Animated Fill Bar */}
                      <div 
                        className={`h-full rounded-full ${data.color} shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                        style={{ width: `${Math.min(data.conversion * 4, 100)}%` }} 
                        // Note: Multiplied by 4 just to make the bars visually longer for the demo (max ~80%)
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
