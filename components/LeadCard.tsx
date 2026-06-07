import type { Lead } from '@/lib/types';
import { STATUS_LABELS, statusBadgeClass } from '@/lib/types';

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">{lead.name}</h2>
          <p className="text-sm text-slate-600">{lead.company ?? '—'}</p>
          <p className="text-sm text-slate-500">{lead.email ?? '—'}</p>
          {lead.phone && <p className="text-sm text-slate-500">{lead.phone}</p>}
        </div>
        <span className={`rounded px-2 py-1 text-xs font-medium ${statusBadgeClass(lead.status)}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>
      {lead.notes && <p className="mt-3 text-sm text-slate-600">{lead.notes}</p>}
    </div>
  );
}
