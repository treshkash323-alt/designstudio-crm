'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type AppHeaderProps = {
  email?: string | null;
  role?: string;
};

export function AppHeader({ email, role }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === 'admin';

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={isAdmin ? '/admin/clients' : '/dashboard'} className="font-semibold text-slate-900">
            DesignStudio CRM
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link
              href="/dashboard"
              className={pathname === '/dashboard' ? 'font-medium text-indigo-600' : 'text-slate-600 hover:text-slate-900'}
            >
              Мои клиенты
            </Link>
            {isAdmin && (
              <Link
                href="/admin/clients"
                className={pathname.startsWith('/admin') ? 'font-medium text-indigo-600' : 'text-slate-600 hover:text-slate-900'}
              >
                Все клиенты (админ)
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{email}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase">
            {role === 'admin' ? 'Админ' : 'Менеджер'}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
