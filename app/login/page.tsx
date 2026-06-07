'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = supabaseBrowser();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email.split('@')[0] } },
      });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage(
        'Аккаунт создан. Подтвердите email в Inbucket: http://localhost:54324'
      );
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const role = data.user?.app_metadata?.role;
    router.push(role === 'admin' ? '/admin/clients' : '/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">DesignStudio CRM</h1>
        <p className="mt-1 text-sm text-slate-600">Локальная CRM · Supabase + Next.js</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Имя</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Иван Менеджеров"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="manager@designstudio.ru"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Test1234!"
            />
          </div>

          {message && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-indigo-600 hover:underline"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Нет аккаунта — регистрация' : 'Уже есть аккаунт — войти'}
        </button>

        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium">Тестовые аккаунты (ДЗ-9):</p>
          <p>manager@designstudio.ru · admin@designstudio.ru</p>
          <p>Inbucket: http://localhost:54324 · Studio: http://localhost:54323</p>
        </div>
      </div>
    </main>
  );
}
