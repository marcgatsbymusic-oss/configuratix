import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuotationsStore } from '../../store/useQuotationsStore'
import { useAuth } from '../../hooks/useAuth'
import { QuotationStatusBadge } from '../../components/admin/QuotationStatusBadge'
import {
  ArrowLeft, User, Building2, Mail, Phone, MapPin, Globe,
  CheckCircle, Factory, MessageSquare, Save, Layers, Ruler, Palette, Package
} from 'lucide-react'
import type { Quotation } from '../../store/useQuotationsStore'
import { WindowTypeGraphic } from '../../components/SlateConfigurator/WindowTypeGraphic'

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { quotations, fetchQuotations, updateStatus, addNote } = useQuotationsStore()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (quotations.length === 0) fetchQuotations()
  }, [])

  useEffect(() => {
    const q = quotations.find((q) => q.id === id)
    if (q) {
      setQuotation(q)
      setNoteText(q.notes || '')
    }
  }, [quotations, id])

  const handleApprove = async () => {
    if (!quotation) return
    setUpdatingStatus(true)
    await updateStatus(quotation.id, 'approved', user?.email || 'Admin')
    setUpdatingStatus(false)
  }

  const handleSendToFactory = async () => {
    if (!quotation) return
    setUpdatingStatus(true)
    await updateStatus(quotation.id, 'factory')
    setUpdatingStatus(false)
  }

  const handleSaveNote = async () => {
    if (!quotation) return
    await addNote(quotation.id, noteText)
    setEditingNote(false)
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mammut-gold" />
      </div>
    )
  }

  const items = Array.isArray(quotation.items) ? quotation.items : []
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
  const vat = subtotal * 0.21
  const total = subtotal + vat

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px]">
      {/* Back Navigation */}
      <button onClick={() => navigate('/admin/quotations')}
        className="flex items-center gap-2 text-zinc-400 hover:text-mammut-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Quotations
      </button>

      {/* === CANTOR-STYLE HEADER BAND === */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-mammut-gold tracking-wider">{quotation.quotation_number}</h1>
            <QuotationStatusBadge status={quotation.status} />
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {quotation.status === 'pending' && (
              <button onClick={handleApprove} disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-mammut-white text-sm font-bold transition-colors disabled:opacity-50">
                <CheckCircle size={16} /> Approve & Sign Off
              </button>
            )}
            {quotation.status === 'approved' && (
              <button onClick={handleSendToFactory} disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-mammut-white text-sm font-bold transition-colors disabled:opacity-50">
                <Factory size={16} /> Send to Factory
              </button>
            )}
          </div>
        </div>

        {/* Header Fields Grid — mirrors Cantor header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-zinc-800">
          {[
            { label: 'Quotation #', value: quotation.quotation_number },
            { label: 'Customer', value: quotation.customer_name },
            { label: 'Requested Date', value: new Date(quotation.requested_date || quotation.created_at).toLocaleDateString('en-GB') },
            { label: 'Order Type', value: 'Normalne' },
            { label: 'Entry Date', value: new Date(quotation.created_at).toLocaleDateString('en-GB') },
            { label: 'Company', value: quotation.company_name || '—' },
            { label: 'Valid Until', value: quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('en-GB') : '—' },
            { label: 'Approved By', value: quotation.approved_by || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-sm font-semibold text-mammut-white truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === MAIN CONTENT: THREE COLUMN LAYOUT === */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* LEFT: Items + Customer */}
        <div className="space-y-6">

          {/* Items Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Layers size={16} className="text-mammut-gold" />
              <h2 className="font-bold text-mammut-white text-sm uppercase tracking-wider">Items</h2>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full ml-auto">{items.length} units</span>
            </div>

            {/* Items Header */}
            <div className="grid grid-cols-[30px_1fr_120px_80px_100px] gap-3 px-6 py-2.5 bg-zinc-950 border-b border-zinc-800 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              <span>#</span><span>Description</span><span>Dimensions</span><span>Qty</span><span className="text-right">Price</span>
            </div>

            {items.length === 0 ? (
              <p className="text-zinc-600 text-sm p-6">No items in this quotation.</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {items.map((item, idx) => (
                  <div key={String(item.id)} className="grid grid-cols-[30px_1fr_120px_80px_100px] gap-3 px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                    <div className="text-mammut-gold font-black text-sm self-start pt-0.5">{idx + 1}</div>
                    <div>
                      <p className="text-mammut-white font-semibold text-sm">{item.name}</p>
                      <div className="mt-2 space-y-1">
                        {(item.details || []).map((d: string, di: number) => (
                          <p key={di} className="text-zinc-500 text-xs flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                            {d}
                          </p>
                        ))}
                        {item.config?.profile && (
                          <p className="text-zinc-500 text-xs flex items-center gap-1.5">
                            <Package size={10} className="text-zinc-600" /> Profile: {item.config.profile}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="self-start pt-0.5 flex items-center gap-1 text-sm text-zinc-300">
                      <Ruler size={12} className="text-zinc-600" />
                      {item.width && item.height ? `${item.width} × ${item.height} mm` : '—'}
                    </div>
                    <div className="self-start pt-0.5 text-sm text-zinc-300">{item.quantity || 1}</div>
                    <div className="self-start pt-0.5 text-right font-bold text-mammut-white text-sm">€{(item.price * (item.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals — Cantor-style bottom panel */}
            <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-4">
              <div className="max-w-xs ml-auto space-y-2">
                {[
                  { label: 'Subtotal', value: subtotal, muted: false },
                  { label: 'VAT (21%)', value: vat, muted: true },
                ].map(({ label, value, muted }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className={muted ? 'text-zinc-500' : 'text-zinc-300'}>{label}</span>
                    <span className={muted ? 'text-zinc-500' : 'text-zinc-200'}>€{value.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-zinc-700 pt-2">
                  <span className="font-black text-mammut-gold text-base">TOTAL</span>
                  <span className="font-black text-mammut-gold text-base">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-mammut-gold" />
                <h2 className="font-bold text-mammut-white text-sm uppercase tracking-wider">Internal Notes</h2>
              </div>
              <button onClick={() => setEditingNote(!editingNote)}
                className="text-xs text-zinc-400 hover:text-mammut-white transition-colors">
                {editingNote ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {editingNote ? (
                <div className="space-y-3">
                  <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-mammut-white text-sm resize-none focus:outline-none focus:border-mammut-gold/50" />
                  <button onClick={handleSaveNote}
                    className="flex items-center gap-2 px-4 py-2 bg-mammut-gold text-zinc-900 rounded-lg text-sm font-bold hover:bg-[#ffc882] transition-colors">
                    <Save size={14} /> Save Note
                  </button>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm whitespace-pre-wrap">
                  {quotation.notes || 'No notes yet. Click Edit to add an internal note.'}
                </p>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Customer + Window Preview (mirrors Cantor right side) */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
              <User size={15} className="text-mammut-gold" />
              <h2 className="font-bold text-mammut-white text-sm uppercase tracking-wider">Customer</h2>
            </div>
            <div className="p-5 space-y-3">
              {[
                { icon: User, label: 'Name', value: quotation.customer_name },
                { icon: Building2, label: 'Company', value: quotation.company_name },
                { icon: Mail, label: 'Email', value: quotation.customer_email },
                { icon: Phone, label: 'Phone', value: quotation.customer_phone },
                { icon: MapPin, label: 'Address', value: quotation.delivery_address },
                { icon: Globe, label: 'Country', value: quotation.country },
              ].filter(row => row.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3 items-start">
                  <Icon size={13} className="text-zinc-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{label}</p>
                    <p className="text-sm text-zinc-200 break-all">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Window Preview Cards — one per item */}
          {items.slice(0, 3).map((item, idx) => (
            <div key={String(item.id)} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Unit {idx + 1}</p>
              </div>
              {/* SVG Preview */}
              <div className="bg-zinc-950 p-4 flex items-center justify-center border-b border-zinc-800" style={{ minHeight: 160 }}>
                {item.config?.windowTypeId ? (
                  <div className="w-32 h-32 flex items-center justify-center text-zinc-400">
                    <WindowTypeGraphic 
                      id={item.config.windowTypeId} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-zinc-700 text-xs italic">No preview</div>
                )}
              </div>
              {/* Spec Table */}
              <div className="p-4 space-y-2 text-xs">
                {[
                  { icon: Package, label: 'Product Code', value: item.config?.windowTypeId || '—' },
                  { icon: Layers, label: 'Profile', value: item.config?.profile || item.name || '—' },
                  { icon: Ruler, label: 'Dimensions', value: item.width && item.height ? `${item.width} × ${item.height} mm` : '—' },
                  { icon: Palette, label: 'Color (IN/OUT)', value: item.config?.interiorColor && item.config?.exteriorColor ? `${item.config.interiorColor} / ${item.config.exteriorColor}` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={11} className="text-zinc-600 shrink-0" />
                    <span className="text-zinc-600 w-24 shrink-0">{label}</span>
                    <span className="text-zinc-300 font-medium truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-zinc-600 text-xs text-center">+{items.length - 3} more units — see Items table</p>
          )}
        </div>
      </div>
    </div>
  )
}
