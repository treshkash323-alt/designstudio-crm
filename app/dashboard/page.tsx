import { AppHeader } from '@/components/AppHeader';
import { LeadCard } from '@/components/LeadCard';
import { createClient } from '@/lib/supabase/server';
import type { Lead } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  const role =
    (user?.app_metadata?.role as string | undefined) ??
    (user?.user_metadata?.role as string | undefined) ??
    'manager';

  return (
    <>
      <AppHeader email={user?.email} role={role} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Мои клиенты</h1>
        <p className="mt-1 text-slate-600">
          RLS показывает только лидов, назначенных на вас ({leads?.length ?? 0})
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Ошибка: {error.message}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {(leads as Lead[] | null)?.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {!error && (leads?.length ?? 0) === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Нет назначенных клиентов. Админ привяжет лидов через SQL (assigned_to).
            </p>
          )}
        </div>
      </main>
    </>
  );
}
