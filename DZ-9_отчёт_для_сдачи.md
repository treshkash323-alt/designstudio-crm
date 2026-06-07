# ДЗ-9 — отчёт для сдачи (Lite)

**Студент:** Игорь Кашинцев  
**Курс:** VibeCoder · Тема 9 — локальная CRM, Supabase, RLS  
**Проект:** DesignStudio CRM — CRM для отдела продаж  
**Папка:** `Projects/ДЗ-9/designstudio-crm/`  
**GitHub:** https://github.com/treshkash323-alt/designstudio-crm  
**Запуск:** локально http://localhost:3000 · Studio http://localhost:54323  
**Дата:** 08.06.2026 · **статус: готово к сдаче**

---

## 1. Цель работы

Развёрнута локальная CRM-система, которая:

1. Работает **на компьютере** через Docker + Supabase CLI (без облака).
2. Имеет двух пользователей с **разными ролями**: менеджер и администратор.
3. Использует **RLS** (Row Level Security) в PostgreSQL: менеджер видит только лидов с `assigned_to = его ID`.
4. Предоставляет веб-интерфейс на **Next.js 14**: вход, dashboard менеджера, admin-панель всех клиентов.
5. Проверена на двух аккаунтах: **2 vs 5** лидов — разграничение доступа работает.
6. Исходный код и документация выложены на **GitHub** (без секретов).

Деплой в интернет **не выполнялся** — по заданию Lite достаточно локального запуска.

---

## 2. Отличие от методички (кратко)

| В методичке | В моей реализации |
|-------------|-------------------|
| Папка trailcamp-crm | **designstudio-crm** (по Lite-заданию) |
| TrailCamp, @trailcamp.ru | **DesignStudio**, @designstudio.ru |
| /admin/leads | **/admin/clients** (то же по смыслу) |
| Промпт Cursor Agent | Каркас в Cursor + SQL-миграция |

---

## 3. Стек

Docker Desktop · Supabase CLI · PostgreSQL 17 · RLS · Next.js 14 App Router · TypeScript · Tailwind CSS · @supabase/ssr

---

## 4. Безопасность (кратко)

> Подробно: `SECURITY.md` в репозитории.

| Проверка | Результат |
|----------|-----------|
| `.env.local` в git | **Нет** — только `.env.local.example` |
| RLS на `leads`, `profiles` | **Да** — manager 2 / admin 5 подтверждено |
| Middleware `/admin` | **Да** — manager редиректится |
| `service_role` в браузере | **Нет** — `admin.ts` не подключён к UI |
| Security Advisor | **0 errors**, 2 warnings (триггер `handle_new_user`) |
| Доступ из интернета | **Нет** — localhost + 127.0.0.1 |

**Вывод для ДЗ:** утечек секретов в GitHub нет; модель доступа работает. Это **учебный локальный** проект, не hardened production.

---

## 5. Скриншоты (вставить в этот документ)

> Ключи в `.env.local` — да. На скринах **замазать** anon/service_role key.

| № | Что снять | Подпись под рисунком |
|---|-----------|----------------------|
| **1** | Менеджер: `/dashboard`, 2 клиента, RLS «(2)» | *Рис. 1. Менеджер — только назначенные лиды* |
| **2** | Админ: `/admin/clients`, 5 клиентов, АДМИН | *Рис. 2. Админ — все лиды* |
| **3** | Docker → Containers `supabase_*_designstudio-crm` | *Рис. 3. Supabase в Docker* |
| **4** | Studio → Table Editor → `leads` | *Рис. 4. База данных* |
| **5** | Терминал `npm run dev` | *Рис. 5. Запуск Next.js* |
| **6** | (опц.) Security Advisor — 0 errors | *Рис. 6. Advisor* |

**Тестовые аккаунты:** manager@designstudio.ru · admin@designstudio.ru

---

## 6. Пошаговый сценарий проверки

```powershell
cd Projects\ДЗ-9\designstudio-crm
npx supabase start
npm run dev
```

1. Регистрация manager@ и admin@designstudio.ru на `/login`.
2. SQL Editor → `supabase/seed_after_signup.sql` → Run.
3. Admin: выход / вход → `/admin/clients` → **5 лидов**.
4. Manager: `/dashboard` → **2 лида**.
5. Manager → `/admin/clients` → редирект на `/dashboard`.

---

## 7. Результат

- [x] Supabase локально, RLS, middleware
- [x] Admin (profiles + app_metadata), 2 лида менеджеру
- [x] Проверка 2 vs 5 лидов
- [x] GitHub без секретов
- [x] SECURITY.md, TODO_ROADMAP.md, отчёт/ПЗ
- [ ] Скрины 1–5 в Word для загрузки в школу

---

## 8. Ссылки

| Ресурс | URL |
|--------|-----|
| **GitHub (код)** | https://github.com/treshkash323-alt/designstudio-crm |
| CRM (локально) | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |

**Документы в репо:** `DZ-9_отчёт_для_сдачи.docx` · `DZ-9_РУКОВОДСТВО_И_ПЗ.docx` · `SECURITY.md`

---

## 9. Комментарий для преподавателя

Lite выполнено локально: Docker + Supabase + Next.js, RLS + middleware. GitHub — публичный репозиторий без `.env.local`. Проведён аудит безопасности (SECURITY.md). Advisor: 0 errors. План развития — образовательная ветка (admin/student/teacher) и интеграция с Tilda — в TODO_ROADMAP.md, после сдачи.

---

## 10. Развитие после ДЗ (не входит в Lite)

См. `TODO_ROADMAP.md`: EDU-платформа AIKIVAVIORA, роли пользователей, Tilda — отдельный трек.

---

*Отчёт · ДЗ-9 · Игорь Кашинцев · 08.06.2026*
