import { AppHeader } from '@/components/AppHeader';
import { createClient } from '@/lib/supabase/server';
import { STATUS_LABELS, statusBadgeClass, type Lead, type LeadStatus } from '@/lib/types';

type AdminLead = Lead & {
  profiles: { full_name: string | null } | null;
};

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, profiles:assigned_to ( full_name )')
    .order('created_at', { ascending: false });

  return (
    <>
      <AppHeader email={user?.email} role="admin" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Все клиенты · Админ</h1>
        <p className="mt-1 text-slate-600">
          Полный список лидов в системе ({leads?.length ?? 0})
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Ошибка: {error.message}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-700">
                <th className="p-3 font-medium">Клиент</th>
                <th className="p-3 font-medium">Компания</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Менеджер</th>
                <th className="p-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(leads as AdminLead[] | null)?.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.company ?? '—'}</td>
                  <td className="p-3">{lead.email ?? '—'}</td>
                  <td className="p-3">{lead.profiles?.full_name ?? 'Не назначен'}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(lead.status as LeadStatus)}`}
                    >
                      {STATUS_LABELS[lead.status as LeadStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
