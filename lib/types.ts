export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'manager' | 'admin';
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Новый',
  contacted: 'Контакт',
  won: 'Закрыт',
  lost: 'Потерян',
};

export function statusBadgeClass(status: LeadStatus): string {
  switch (status) {
    case 'won':
      return 'bg-green-100 text-green-800';
    case 'lost':
      return 'bg-red-100 text-red-800';
    case 'contacted':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
