# ДЗ-9 — отчёт для сдачи (Lite)

**Студент:** Игорь Кашинцев  
**Курс:** VibeCoder · Тема 9 — локальная CRM, Supabase, RLS  
**Проект:** DesignStudio CRM — CRM для отдела продаж  
**Папка:** `Projects/ДЗ-9/designstudio-crm/`  
**Запуск:** локально http://localhost:3000 · Studio http://localhost:54323  
**Дата:** 08.06.2026

---

## 1. Цель работы

Развёрнута локальная CRM-система, которая:

1. Работает **на компьютере** через Docker + Supabase CLI (без облака).
2. Имеет двух пользователей с **разными ролями**: менеджер и администратор.
3. Использует **RLS** (Row Level Security) в PostgreSQL: менеджер видит только лидов с `assigned_to = его ID`.
4. Предоставляет веб-интерфейс на **Next.js 14**: вход, dashboard менеджера, admin-панель всех клиентов.
5. Проверена на двух аккаунтах: **2 vs 5** лидов — разграничение доступа работает.

Деплой в интернет **не выполнялся** — по заданию Lite достаточно локального запуска.

---

## 2. Отличие от методички (кратко)

| В методичке | В моей реализации |
|-------------|-------------------|
| Папка trailcamp-crm | **designstudio-crm** (по Lite-заданию) |
| TrailCamp, @trailcamp.ru | **DesignStudio**, @designstudio.ru |
| /admin/leads | **/admin/clients** (то же по смыслу) |
| Промпт Cursor Agent | Каркас собран в Cursor + миграция SQL |

Обоснование: Lite-задание явно указывает `designstudio-crm` и почты `@designstudio.ru`; логика RLS и ролей — как на занятии.

---

## 3. Стек

Docker Desktop · Supabase CLI · PostgreSQL 17 · RLS · Next.js 14 App Router · TypeScript · Tailwind CSS · @supabase/ssr

---

## 4. Скриншоты (вставить в этот документ)

> Ключи в `.env.local` — да. На скринах **замазать** anon/service_role key.

| № | Что снять | Подпись под рисунком |
|---|-----------|----------------------|
| **1** | Менеджер: `/dashboard`, 2 клиента, подпись RLS «(2)» | *Рис. 1. Менеджер — только назначенные лиды* |
| **2** | Админ: `/admin/clients`, 5 клиентов, бейдж АДМИН | *Рис. 2. Админ — все лиды в системе* |
| **3** | Docker Desktop → Containers `supabase_*_designstudio-crm` | *Рис. 3. Локальный Supabase в Docker* |
| **4** | Studio → Table Editor → таблица `leads` (5 строк) | *Рис. 4. База данных leads* |
| **5** | Терминал: `npm run dev`, Ready on localhost:3000 | *Рис. 5. Запуск Next.js* |
| **6** | (опционально) Security Advisor — 0 errors | *Рис. 6. Проверка Advisor* |

**Тестовые аккаунты:**

- Менеджер: manager@designstudio.ru  
- Админ: admin@designstudio.ru  

---

## 5. Пошаговый сценарий проверки

**Подготовка:**

```powershell
# Docker Desktop — Engine running
cd Projects\ДЗ-9\designstudio-crm
npx supabase start
npm run dev
```

**Проверка (выполнено):**

1. Зарегистрировать manager@designstudio.ru и admin@designstudio.ru на `/login`.
2. В Studio → SQL Editor выполнить `supabase/seed_after_signup.sql`.
3. Admin — **выйти и войти снова** (обновление JWT с role admin).
4. Менеджер → http://localhost:3000/dashboard → **2 лида**.
5. Админ → http://localhost:3000/admin/clients → **5 лидов**.
6. Менеджер → попытка открыть `/admin/clients` → редирект на `/dashboard`.

---

## 6. Результат

- [x] Supabase локально (`npx supabase start`, Studio :54323)
- [x] Таблицы profiles, leads + RLS-политики
- [x] Два пользователя зарегистрированы
- [x] Admin назначен (profiles + app_metadata)
- [x] 2 лида привязаны менеджеру (`assigned_to`)
- [x] Менеджер видит только своих (2)
- [x] Админ видит всех (5)
- [x] Next.js приложение с middleware
- [ ] Скрины 1–5 вставлены в документ для сдачи

---

## 7. Ссылки

| Ресурс | URL |
|--------|-----|
| **GitHub** | https://github.com/treshkash323-alt/designstudio-crm |
| CRM (локально) | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |
| Supabase API | http://127.0.0.1:54321 |

Проект на диске: `C:\Users\kash-\Python_kash\Cursor\Projects\ДЗ-9\designstudio-crm\`

---

## 8. Комментарий для преподавателя

Задание Lite выполнено локально: Docker + Supabase CLI + Next.js. Разграничение доступа реализовано через RLS на уровне PostgreSQL и middleware на уровне маршрутов. SQL для назначения admin и привязки лидов — `seed_after_signup.sql` (Studio SQL Editor). Подробное руководство с глоссарием — `DZ-9_РУКОВОДСТВО_И_ПЗ.docx`. Security Advisor: 0 errors, 2 warnings на триггер `handle_new_user()` — типично для локальной разработки.

---

*Отчёт · ДЗ-9 · Игорь Кашинцев · 08.06.2026*
