# DesignStudio CRM — ДЗ-9 (Lite)

Локальная CRM для отдела продаж: **Next.js 14 + Supabase (Docker) + RLS**.

- Менеджер видит только своих лидов (`/dashboard`)
- Админ видит всех (`/admin/clients`)

**GitHub:** https://github.com/treshkash323-alt/designstudio-crm  
**Статус:** ДЗ-9 выполнено · отчёт Word со скринами готов

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

**Терминал:** один VS Code Terminal; порт из строки `Local:` = порт в браузере.

Подробно: `СТАРТ.md`, `DZ-9_РУКОВОДСТВО_И_ПЗ.md`, `DZ-9_отчёт_для_сдачи.docx`

## Студент

Игорь Кашинцев · VibeCoder · Тема 9
