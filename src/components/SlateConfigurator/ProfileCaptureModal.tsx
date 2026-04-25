import React, { useState } from 'react';
import { X, User, Building2, Phone, Mail, MapPin, Globe, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useQuotationsStore } from '../../store/useQuotationsStore';
import { useCartStore } from '../../store/useCartStore';

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

const COUNTRIES = [
  'Austria', 'Belgium', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy',
  'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
  'Switzerland', 'Ukraine', 'United Kingdom', 'United States', 'Other'
];

export function ProfileCaptureModal({ onClose, onComplete }: Props) {
  const session = useSessionStore();
  const { submitQuotation, submitting } = useQuotationsStore();
  const { items, getCartTotal, clearCart } = useCartStore();

  const [form, setForm] = useState({
    name: session.name || '',
    email: session.email || '',
    phone: session.phone || '',
    company: session.company || '',
    address: session.address || '',
    country: session.country || '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [error, setError] = useState('');

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Save to session store for future visits
    session.setSession({
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      address: form.address,
      country: form.country,
    });

    const result = await submitQuotation({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      company_name: form.company,
      delivery_address: form.address,
      country: form.country,
      notes: form.notes,
      items,
      total_price: getCartTotal(),
    });

    if (result.success) {
      setQuotationNumber(result.quotationNumber || '');
      setSubmitted(true);
      clearCart();
    } else {
      setError(result.error || 'Failed to submit quotation. Please try again.');
    }
  };

  const inputClass = 'w-full bg-mammut-darker border border-mammut-border rounded-xl px-4 py-3 text-mammut-white placeholder-white/20 focus:outline-none focus:border-mammut-gold/60 transition-colors text-sm';
  const labelClass = 'block text-[10px] font-bold text-mammut-white/40 uppercase tracking-widest mb-2';

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mammut-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-mammut-dark border border-mammut-gold/30 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(234,182,118,0.1)] overflow-hidden">
          <div className="p-10 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={40} className="text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-mammut-white mb-2">Quotation Submitted!</h2>
              <p className="text-mammut-white/50 text-sm leading-relaxed">
                Your quotation has been received. We will review it and get back to you shortly.
              </p>
            </div>
            {quotationNumber && (
              <div className="bg-mammut-darker border border-mammut-border rounded-2xl px-8 py-4 text-center">
                <p className="text-[10px] font-bold text-mammut-white/30 uppercase tracking-widest mb-1">Quotation Reference</p>
                <p className="text-3xl font-black text-mammut-gold tracking-wider">{quotationNumber}</p>
              </div>
            )}
            <p className="text-xs text-mammut-white/30">A confirmation will be sent to <span className="text-mammut-white/60">{form.email}</span></p>
            <button
              onClick={() => { onComplete(); onClose(); }}
              className="w-full bg-mammut-gold !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mammut-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-mammut-dark border border-mammut-gold/20 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(234,182,118,0.08)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-5 top-5 p-2 rounded-full hover:bg-white/10 text-mammut-white/40 hover:text-mammut-white transition-colors z-10">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-mammut-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-mammut-gold/15 rounded-2xl flex items-center justify-center">
              <Send size={22} className="text-mammut-gold" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-mammut-white">Request a Quotation</h2>
              <p className="text-sm text-mammut-white/40">Fill in your details and we'll prepare a formal quote for {items.length} window{items.length !== 1 ? 's' : ''}.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* Row 1: Name + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><User size={10} className="inline mr-1" />Full Name *</label>
              <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)}
                className={inputClass} placeholder="Jan Kowalski" />
            </div>
            <div>
              <label className={labelClass}><Building2 size={10} className="inline mr-1" />Company</label>
              <input type="text" value={form.company} onChange={(e) => update('company', e.target.value)}
                className={inputClass} placeholder="Acme Windows s.r.o." />
            </div>
          </div>

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Mail size={10} className="inline mr-1" />Email Address *</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                className={inputClass} placeholder="jan@example.com" />
            </div>
            <div>
              <label className={labelClass}><Phone size={10} className="inline mr-1" />Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className={inputClass} placeholder="+48 123 456 789" />
            </div>
          </div>

          {/* Row 3: Address + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><MapPin size={10} className="inline mr-1" />Delivery Address</label>
              <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)}
                className={inputClass} placeholder="ul. Przykładowa 1, 00-001 Warsaw" />
            </div>
            <div>
              <label className={labelClass}><Globe size={10} className="inline mr-1" />Country</label>
              <select value={form.country} onChange={(e) => update('country', e.target.value)}
                className={`${inputClass} cursor-pointer`}>
                <option value="" className="bg-mammut-darker">Select country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-mammut-darker text-mammut-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}><MessageSquare size={10} className="inline mr-1" />Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Any special requirements, installation timeline, or questions..." />
          </div>

          {/* Order Summary */}
          <div className="bg-mammut-darker border border-mammut-border rounded-2xl p-4">
            <p className="text-[10px] font-bold text-mammut-white/30 uppercase tracking-widest mb-3">Order Summary</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-mammut-white/60">{i + 1}. {item.name} {item.width && item.height ? `· ${item.width}×${item.height}mm` : ''}</span>
                  <span className="text-mammut-white font-bold">€{item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-mammut-border pt-2 mt-2 flex justify-between font-black text-mammut-white">
                <span>Total</span>
                <span className="text-mammut-gold">€{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full bg-mammut-gold !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors shadow-[0_0_20px_rgba(234,182,118,0.2)] disabled:opacity-60 flex items-center justify-center gap-3">
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Quotation Request'}
          </button>

          <p className="text-center text-[10px] text-mammut-white/20">
            Valid for 30 days. No payment required at this stage.
          </p>
        </form>
      </div>
    </div>
  );
}
