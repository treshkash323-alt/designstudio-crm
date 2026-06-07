# DesignStudio CRM — безопасность и чеклист

**Проект:** ДЗ-9 (Lite) · локальная CRM  
**Аудит:** 08.06.2026 · репозиторий: https://github.com/treshkash323-alt/designstudio-crm  
**Контекст:** учебный локальный стек (Docker + Supabase CLI + Next.js). **Не production.**

---

## 1. Краткий вердикт

| Вопрос | Ответ |
|--------|--------|
| Утечки секретов в GitHub? | **Нет** — `.env.local` в `.gitignore`, в git только `.env.local.example` |
| Менеджер видит чужих лидов через API? | **Нет** — RLS на `leads` |
| Admin назначается сам через UI? | **Нет** — только SQL / service_role |
| `service_role` в браузере? | **Нет** — `admin.ts` не подключён к client components |
| Можно ли атаковать из интернета? | **Нет** (пока localhost) — порты 54321–54323 на 127.0.0.1 |

**Для сдачи ДЗ-9:** достаточно. **Для продакшена / образования:** см. раздел 4.

---

## 2. Как защищены данные

### 2.1. Row Level Security (PostgreSQL)

```
leads: manager  → SELECT WHERE assigned_to = auth.uid()
leads: admin    → ALL WHERE JWT app_metadata.role = 'admin'
profiles: user  → SELECT own row
profiles: admin → SELECT all
```

Файл: `supabase/migrations/20260607180000_initial_crm.sql`

### 2.2. Next.js middleware

- `/dashboard`, `/admin/*` — только с сессией  
- `/admin/*` — только `app_metadata.role === 'admin'`  
- Файл: `middleware.ts`

### 2.3. Ключи API

| Ключ | Где | Правило |
|------|-----|---------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | браузер + сервер | OK с RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | только `.env.local`, сервер | **Never** `NEXT_PUBLIC_*` |

### 2.4. Git

Исключено из коммитов (`.gitignore`):

- `.env.local`
- `node_modules/`, `.next/`
- `supabase/.temp/`, `supabase/.branches/`
- `~$*.docx`

---

## 3. Чеклист перед сдачей / публикацией репо

### Сдача ДЗ-9 (локально)

- [x] `.env.local` не в git (`git ls-files` не показывает `.env.local`)
- [x] RLS включён на `profiles` и `leads`
- [x] Проверка: manager 2 / admin 5 лидов
- [x] Middleware блокирует `/admin` для manager
- [x] GitHub: код без секретов
- [x] Security Advisor: **0 errors** (2 warnings — см. 3.2)
- [ ] Скрины в `DZ-9_отчёт_для_сдачи.docx`

### Перед любым выкладом в интернет (будущее)

- [ ] Отключить open registration или invite-only
- [ ] Уникальные ключи Supabase (не demo local JWT)
- [ ] HTTPS, firewall, не открывать Postgres/Studio наружу
- [ ] Пароль Studio / VPN для админов
- [ ] Rate limit на login
- [ ] Admin role через Server Action, не ручной SQL
- [ ] REVOKE EXECUTE на `handle_new_user()` для public
- [ ] Политика: запрет UPDATE `profiles.role` для authenticated
- [ ] `npm audit`, Dependabot
- [ ] Реальные ПДн — не в публичном git

---

## 3.1. Security Advisor (локально)

| Уровень | Кол-во | Суть |
|---------|--------|------|
| Errors | 0 | OK |
| Warnings | 2 | `handle_new_user()` — SECURITY DEFINER, callable by authenticated/public |

**Для учебного проекта:** допустимо.  
**Для прода:** `REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;` + выдать только нужным ролям.

---

## 3.2. Известные ограничения учебной версии

| Риск | Уровень | Комментарий |
|------|---------|-------------|
| Open signup на `/login` | Низкий (local) | Любой создаёт manager локально |
| Studio без пароля | Средний (local) | Полный доступ к БД с ПК |
| Demo JWT keys локально | Низкий | Стандарт Supabase CLI; не использовать в cloud as-is |
| Fake PII в миграции | Низкий | Учебные ФИО/телефоны в git |
| `minimum_password_length = 6` | Низкий | config.toml |
| Два источника роли (profiles + JWT) | Средний | Синхронизировать при смене роли |

---

## 4. Roadmap усиления (см. TODO_ROADMAP.md)

Кратко:

1. **Образование (AIKIVAVIORA):** роли student / teacher / admin, курсы, записи — на базе этой CRM.  
2. **Tilda:** витрина и маркетинг; CRM/личный кабинет — отдельно (обсудим).  
3. **Prod:** Supabase Cloud или VPS, закрытая регистрация, audit log.

---

## 5. Что делать при инциденте

1. **Случайно закоммитили `.env`:** немедленно rotate keys в Supabase, `git rm --cached`, новый commit, **не** force-push main без понимания.  
2. **Подозрение на утечку service_role:** rotate в Dashboard → обновить `.env.local`.  
3. **Странные лиды в БД:** проверить RLS policies в Studio → Database → Policies.

---

*SECURITY.md · DesignStudio CRM · обновлять при смене архитектуры*
