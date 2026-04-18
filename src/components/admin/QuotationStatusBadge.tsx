import type { QuotationStatus } from '../../store/useQuotationsStore';

const STATUS_CONFIG: Record<QuotationStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:    { label: 'Draft',    bg: 'bg-zinc-800',       text: 'text-zinc-400',   dot: 'bg-zinc-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-500/15',   text: 'text-amber-400',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', bg: 'bg-blue-500/15',    text: 'text-blue-400',   dot: 'bg-blue-400' },
  factory:  { label: 'Factory',  bg: 'bg-emerald-500/15', text: 'text-emerald-400',dot: 'bg-emerald-400' },
  exported: { label: 'Exported', bg: 'bg-zinc-700/40',    text: 'text-zinc-400',   dot: 'bg-zinc-500' },
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
