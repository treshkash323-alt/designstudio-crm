# DesignStudio CRM — ДЗ-9 (Lite)

Локальная CRM для отдела продаж: **Next.js 14 + Supabase (Docker) + RLS**.

- Менеджер видит только своих лидов (`/dashboard`)
- Админ видит всех (`/admin/clients`)

## Быстрый старт

```powershell
cd designstudio-crm
npx supabase start
copy .env.local.example .env.local
# вставить ключи из: npx supabase status -o env
npm install
npm run dev
```

http://localhost:3000 · Studio http://localhost:54323

Подробно: `СТАРТ.md`, `DZ-9_РУКОВОДСТВО_И_ПЗ.md`

## Студент

Игорь Кашинцев · VibeCoder · Тема 9
