# ДЗ-9 — руководство по эксплуатации и пояснительная записка

**Студент:** Игорь Кашинцев  
**Курс:** VibeCoder · Тема 9 — локальная CRM, Supabase, разграничение доступа (RLS)  
**Проект:** DesignStudio CRM  
**Папка:** `C:\Users\kash-\Python_kash\Cursor\Projects\ДЗ-9\designstudio-crm\`  
**GitHub:** https://github.com/treshkash323-alt/designstudio-crm  
**Дата:** 08.06.2026  
**Статус:** ДЗ-9 закрыто · отчёт со скринами в Word · код на GitHub

> Этот файл — и **отчёт/ПЗ для сдачи**, и **учебное руководство**. Читайте по порядку; разделы с пометкой «Учиться» можно вернуться позже.

---

## Содержание

1. [Зачем этот проект](#1-зачем-этот-проект)  
2. [Глоссарий — словарь терминов](#2-глоссарий--словарь-терминов)  
3. [Архитектура — как всё связано](#3-архитектура--как-всё-сязано)  
4. [Первый запуск с нуля](#4-первый-запуск-с-нуля)  
5. [Ежедневная эксплуатация](#5-ежедневная-эксплуатация)  
6. [Пользователи, роли, сценарии](#6-пользователи-роли-сценарии)  
7. [SQL — что мы делали и зачем](#7-sql--что-мы-делали-и-зачем)  
8. [Supabase Studio — куда нажимать](#8-supabase-studio--куда-нажимать)  
9. [Security Advisor — 2 предупреждения](#9-security-advisor--2-предупреждения)  
10. [Docker — что вы видите в Desktop](#10-docker--что-вы-видите-в-desktop)  
11. [Структура файлов проекта](#11-структура-файлов-проекта)  
12. [Частые ошибки и решения](#12-частые-ошибки-и-решения)  
13. [Сдача домашки — чеклист](#13-сдача-домашки--чеклист)  
14. [Безопасность — аудит и чеклист](#14-безопасность--аудит-и-чеклист)  
15. [Развитие проекта (TODO)](#15-развитие-проекта-todo)  
16. [Вывод](#16-вывод)

---

## 1. Зачем этот проект

### 1.1. Задание курса (Lite)

Развернуть **локальную** CRM:

- база данных на вашем компьютере (не в облаке);
- два пользователя с **разными ролями**;
- менеджер видит **только своих** клиентов (лидов);
- админ видит **всех**.

### 1.2. Что вы научились делать на практике

| Навык | Где проявился |
|-------|----------------|
| Docker | Контейнеры Supabase в Docker Desktop |
| Supabase CLI | `npx supabase start` / `status` / `stop` |
| PostgreSQL RLS | Таблица `leads` — фильтр по `assigned_to` |
| Next.js + Auth | Вход, cookies, middleware |
| Разграничение доступа | 2 vs 5 клиентов на скринах |

### 1.3. Почему «DesignStudio», а не TrailCamp

В методичке встречается вымышленный магазин TrailCamp. В задании Lite указана папка **designstudio-crm** и почты `@designstudio.ru`. Логика та же, бренд другой — для сдачи это нормально.

---

## 2. Глоссарий — словарь терминов

> **Учиться:** возвращайтесь сюда, когда в лекции или Studio встретите незнакомое слово.

| Термин | Объяснение простыми словами | Пример из проекта |
|--------|----------------------------|-------------------|
| **Docker** | Программа, которая запускает изолированные «контейнеры» — как мини-серверы на вашем ПК | Контейнеры `supabase_db_designstudio-crm`, `supabase_studio_...` |
| **Supabase CLI** | Утилита командной строки: одной командой поднимает БД + Auth + Studio | `npx supabase start` |
| **Supabase Studio** | Веб-интерфейс для таблиц, SQL, пользователей | http://localhost:54323 |
| **PostgreSQL** | Реляционная база данных | Таблицы `profiles`, `leads` |
| **CRM** | Система учёта клиентов и лидов | Наш дашборд с карточками клиентов |
| **Лид (Lead)** | Потенциальный клиент, сделка ещё не закрыта | Алексей Петров, ООО Вертикаль |
| **RLS** (Row Level Security) | Правила «какие **строки** таблицы видит этот пользователь» | Менеджер: `assigned_to = его id` |
| **Policy (политика)** | Одно конкретное RLS-правило | `leads: manager sees own` |
| **JWT** | Токен после входа; браузер отправляет его с каждым запросом | После login на `/dashboard` |
| **app_metadata** | Поле в JWT с ролью; пользователь сам его не меняет | `"role": "admin"` |
| **auth.uid()** | Функция в SQL: ID текущего залогиненного пользователя | В политике RLS для менеджера |
| **anon key** | Публичный ключ API Supabase для приложения | В `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role key** | Секретный ключ с полным доступом, **обходит RLS** | Только на сервере, не в браузере |
| **Middleware** | Код Next.js, проверяющий вход **до** открытия страницы | Файл `middleware.ts` |
| **@supabase/ssr** | Библиотека: Supabase + Next.js через cookies | `lib/supabase/server.ts` |
| **assigned_to** | Колонка в `leads`: UUID менеджера, которому назначен лид | Два лида → manager, три → NULL |
| **Inbucket / Mailpit** | Локальный «почтовый ящик» для писем подтверждения | http://localhost:54324 (у нас confirm выключен) |
| **Миграция** | SQL-файл, который создаёт таблицы при первом `supabase start` | `supabase/migrations/20260607180000_initial_crm.sql` |

---

## 3. Архитектура — как всё связано

### 3.1. Схема «кто с кем говорит»

```
┌─────────────────┐     http://localhost:3000      ┌──────────────────┐
│  Браузер        │ ◄────────────────────────────► │  Next.js         │
│  (вы)           │         cookies + JWT          │  middleware.ts   │
└─────────────────┘                                └────────┬─────────┘
                                                              │
                              anon key + JWT                  │
                                                              ▼
┌─────────────────┐     http://127.0.0.1:54321     ┌──────────────────┐
│  Supabase Studio│ ◄── admin SQL, просмотр таблиц │  Supabase API    │
│  :54323         │                                │  (Kong)          │
└─────────────────┘                                └────────┬─────────┘
                                                              │
                                                              ▼
                                                   ┌──────────────────┐
                                                   │  PostgreSQL      │
                                                   │  + RLS policies  │
                                                   │  profiles, leads │
                                                   └──────────────────┘
         ▲
         │ Docker Desktop
         └─ контейнеры supabase_*_designstudio-crm
```

### 3.2. Два уровня защиты (defence in depth)

| Уровень | Что делает | Файл / место |
|---------|------------|--------------|
| **Next.js middleware** | Нет сессии → на `/login`; не admin → нельзя `/admin/*` | `middleware.ts` |
| **PostgreSQL RLS** | Даже если в коде ошибка, БД не отдаст чужие строки | политики на `leads` |

**Пример:** менеджер открывает `/dashboard`. Код делает `SELECT * FROM leads`. RLS **автоматически** добавляет условие «где `assigned_to` = мой id». Поэтому на экране **2**, а не 5.

### 3.3. Таблицы

**profiles** — профиль пользователя (связан с `auth.users`):

| Поле | Назначение |
|------|------------|
| id | = id из auth.users |
| email | для удобства и SQL `WHERE email = '...'` |
| full_name | имя в интерфейсе |
| role | `manager` или `admin` |

**leads** — клиенты/лиды:

| Поле | Назначение |
|------|------------|
| name, company, phone, email | контакты |
| status | new / contacted / won / lost |
| assigned_to | UUID менеджера или NULL |

---

## 4. Первый запуск с нуля

> Если проект уже работает — переходите к [разделу 5](#5-ежедневная-эксплуатация).

### Шаг 1. Docker Desktop

1. Запустите **Docker Desktop** из меню Пуск.
2. Дождитесь **Engine running** (кит в трее без ошибки).
3. При первом входе можно авторизоваться через Google — это **не обязательно** для локальной работы, но иногда упрощает загрузку образов.

**Проверка в PowerShell:**

```powershell
docker info
```

Должна быть строка `Server Version:` без ошибки про `dockerDesktopLinuxEngine`.

### Шаг 2. Supabase

```powershell
cd C:\Users\kash-\Python_kash\Cursor\Projects\ДЗ-9\designstudio-crm
npx supabase start
```

- Первый раз: скачивает образы (~3–5 мин).
- Потом: ~30–60 сек.

**Сохраните ключи:**

```powershell
npx supabase status -o env
```

### Шаг 3. Файл `.env.local`

Скопируйте `.env.local.example` → `.env.local` и вставьте:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY из status>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY из status>
```

> **Важно:** `SERVICE_ROLE` **без** префикса `NEXT_PUBLIC_` — он не должен попасть в браузер.

### Шаг 4. Next.js

```powershell
npm install
npm run dev
```

Откройте: http://localhost:3000

### Шаг 5. Регистрация пользователей

На `/login` → «Нет аккаунта — регистрация»:

| Email | Пароль (пример) | Имя (любое) |
|-------|-----------------|-------------|
| manager@designstudio.ru | Test1234! | Иван Менеджеров |
| admin@designstudio.ru | Admin1234! | Иван Администраторов |

Локально подтверждение email **отключено** в `supabase/config.toml` (`enable_confirmations = false`).

### Шаг 6. SQL — назначить admin и лидов

**Не так:** `designstudio-crm\supabase\seed_after_signup.sql` в PowerShell — это **не команда**.

**Так — вариант А (Studio):**

1. http://localhost:54323  
2. Слева **SQL Editor** (иконка `>_`)  
3. **New query**  
4. Открыть в блокноте файл `supabase\seed_after_signup.sql`, скопировать **весь текст**, вставить в редактор  
5. **Run** (Ctrl+Enter)

**Так — вариант Б (PowerShell, если умеете):**

```powershell
Get-Content supabase\seed_after_signup.sql -Raw | docker exec -i supabase_db_designstudio-crm psql -U postgres
```

### Шаг 7. Admin — выйти и войти снова

После SQL с `app_metadata` JWT обновится только после **повторного входа** admin@designstudio.ru.

### Шаг 8. Проверка

| Кто | URL | Ожидание |
|-----|-----|----------|
| manager | /dashboard | 2 клиента |
| admin | /admin/clients | 5 клиентов в таблице |

---

## 5. Ежедневная эксплуатация

### 5.1. Начало работы (типичный день)

```powershell
# 1. Docker Desktop — уже запущен
cd C:\Users\kash-\Python_kash\Cursor\Projects\ДЗ-9\designstudio-crm

# 2. Supabase (если после перезагрузки ПК)
npx supabase start

# 3. Приложение
npm run dev
```

| Сервис | URL |
|--------|-----|
| CRM | http://localhost:3000 |
| Studio | http://localhost:54323 |
| API | http://127.0.0.1:54321 |

### 5.2. Конец работы

```powershell
# Остановить только Supabase (данные сохранятся)
npx supabase stop

# Ctrl+C в терминале с npm run dev
```

Docker Desktop можно не закрывать.

### 5.3. Полный сброс базы (осторожно!)

```powershell
npx supabase db reset
```

Удалит пользователей и данные, заново применит миграции и 5 демо-лидов. После reset снова: регистрация → `seed_after_signup.sql`.

---

## 6. Пользователи, роли, сценарии

### 6.1. Менеджер (`manager@designstudio.ru`)

- Страница: **/dashboard** («Мои клиенты»).
- Видит только лиды, где `assigned_to` = его UUID.
- У вас: **Алексей Петров**, **Мария Смирнова**.
- Подпись на странице: *«RLS показывает только лидов, назначенных на вас (2)»* — это подтверждение, что политика работает.

**Попробуйте сами (учебный эксперiment):**  
В Studio → Table Editor → `leads` → у «Анны Новиковой» вручную поставьте `assigned_to` = UUID менеджера → обновите dashboard → станет 3 клиента. Потом верните NULL.

### 6.2. Админ (`admin@designstudio.ru`)

- Страница: **/admin/clients** («Все клиенты · Админ»).
- Видит **все 5** лидов.
- В колонке «Менеджер»: у двух — «Иван Менеджеров», у трёх — «Не назначен».
- Бейдж в шапке: **АДМИН**.

**Почему admin не должен смотреть только /dashboard:**  
На `/dashboard` RLS для admin в нашей схеме тоже фильтрует «своих» (если admin не назначен на лиды — будет 0). Для админа задумана отдельная страница `/admin/clients` с политикой «admin read all».

### 6.3. Что будет, если менеджер откроет /admin/clients

Middleware перенаправит на `/dashboard` — доступ запрещён.

---

## 7. SQL — что мы делали и зачем

Файл: `supabase/seed_after_signup.sql`

### 7.1. Назначить роль admin в profiles

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@designstudio.ru';
```

Нужно для отображения роли в UI (бейдж «АДМИН»).

### 7.2. Записать role в JWT (app_metadata)

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@designstudio.ru';
```

**Зачем два UPDATE:** RLS-политика для админа смотрит **JWT** (`auth.jwt() -> app_metadata -> role`), а не только таблицу `profiles`. Без этого admin видел бы только «своих» лидов.

### 7.3. Привязать лидов менеджеру

```sql
UPDATE public.leads
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'manager@designstudio.ru')
WHERE name IN ('Алексей Петров', 'Мария Смирнова');
```

**Пример результата:**

| name | assigned_to |
|------|-------------|
| Алексей Петров | UUID менеджера |
| Мария Смирнова | UUID менеджера |
| Остальные 3 | NULL |

### 7.4. Миграция (создано один раз)

Файл `supabase/migrations/20260607180000_initial_crm.sql` создаёт таблицы, RLS, триггер `handle_new_user` и **5 демо-лидов**. Применяется автоматически при `supabase start`.

---

## 8. Supabase Studio — куда нажимать

| Задача | Куда в Studio |
|--------|----------------|
| Выполнить SQL | **SQL Editor** (`>_` слева) → New query → Run |
| Посмотреть таблицу leads | **Table Editor** → public → leads |
| Список пользователей | **Authentication** → Users |
| Проверка безопасности | **Advisors** → Security Advisor |
| Главная «Get connected» | Можно игнорировать — для подключения нового проекта |

**Templates / Examples** в SQL Editor — готовые заготовки Supabase (Todo, Slack clone). Для ДЗ-9 **не нужны** — схема уже в миграции.

---

## 9. Security Advisor — 2 предупреждения

Вы видели в **Advisors → Security Advisor → Warnings (2)**:

1. *Public Can Execute SECURITY DEFINER Function*  
2. *Signed-In Users Can Execute SECURITY DEFINER*  

**Сущность:** функция `public.handle_new_user()` — триггер при регистрации (создаёт строку в `profiles`). Она помечена `SECURITY DEFINER`, чтобы иметь право писать в `profiles` от имени системы.

**Для учебного локального ДЗ:** это **типично** и **не ломает** вашу сдачу. Errors = 0 — главное.

**Если интересно «как в проде»:** ограничивают `EXECUTE` на функцию только ролью `service_role` / postgres. Для курса Lite не требуется.

---

## 10. Docker — что вы видите в Desktop

### Вкладка Containers

- **`supabase_*_designstudio-crm`** — ваш CRM-проект (много контейнеров: db, studio, auth, …).
- **`dzenneuro`** — **другой** проект (Дзен/RAG), к ДЗ-9 не относится. Можно не трогать.

### Вкладка Images

- Много образов `public.ecr.aws/supabase/...` — скачанные слои Supabase (~6+ GB). Это норма после первого `supabase start`.
- **`dzenn:latest`** — образ другого вашего проекта.

**Не удаляйте** образы Supabase, пока пользуетесь CRM — иначе следующий `supabase start` снова всё скачает.

---

## 11. Структура файлов проекта

```
designstudio-crm/
├── app/
│   ├── login/page.tsx          # вход и регистрация
│   ├── dashboard/page.tsx      # лиды менеджера
│   └── admin/clients/page.tsx  # все лиды (admin)
├── components/
│   ├── AppHeader.tsx           # шапка, роль, выход
│   └── LeadCard.tsx            # карточка клиента
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # браузер (anon key)
│   │   ├── server.ts           # сервер + RLS
│   │   └── admin.ts            # service_role (на будущее)
│   └── types.ts
├── middleware.ts               # защита /dashboard и /admin
├── supabase/
│   ├── migrations/             # схема БД + RLS
│   ├── seed_after_signup.sql   # после регистрации пользователей
│   └── config.toml             # порты, auth
├── .env.local                  # ключи (не в git!)
├── .env.local.example
├── SECURITY.md                 # аудит и чеклист безопасности
├── TODO_ROADMAP.md             # развитие: EDU, Tilda, prod
├── DZ-9_отчёт_для_сдачи.md     # отчёт для школы
├── DZ-9_РУКОВОДСТВО_И_ПЗ.md   # этот файл
└── build_docx_dz9.py           # сборка Word
```

### Ключевой фрагмент middleware (идея)

```typescript
// Не залогинен → /login
if (isProtected && !user) redirect('/login');

// Не admin → нельзя /admin/*
if (path.startsWith('/admin') && user.app_metadata?.role !== 'admin')
  redirect('/dashboard');
```

### Ключевой фрагмент dashboard (идея)

```typescript
// Без WHERE assigned_to — RLS фильтрует сам!
const { data: leads } = await supabase.from('leads').select('*');
```

---

## 12. Частые ошибки и решения

| Симптом | Причина | Решение |
|---------|---------|---------|
| `dockerDesktopLinuxEngine: file not found` | Docker не запущен | Открыть Docker Desktop, подождать Engine running |
| 0 клиентов у менеджера | Не выполнен seed SQL | `seed_after_signup.sql` в SQL Editor |
| Admin показывает «МЕНЕДЖЕР», 0 лидов | Не обновлён JWT | SQL для admin → **Выйти** → войти снова |
| Admin на /dashboard — мало лидов | Это страница менеджера | Открыть **/admin/clients** |
| Запуск `.sql` в PowerShell | Путь — не команда | Studio SQL Editor или `docker exec ... psql` |
| `supabase start` долго | Первый раз качает образы | Подождать 3–5 мин |
| Порт 54321 занят | Другой Supabase-проект | `npx supabase stop` в том проекте |

---

## 13. Сдача домашки — чеклист

### 13.1. Обязательные скрины

- [x] **Менеджер:** `/dashboard`, 2 клиента, подпись RLS «(2)»
- [x] **Админ:** `/admin/clients`, 5 строк, бейдж АДМИН

### 13.2. Желательно (для отчёта)

- [x] Docker Containers — контейнеры `designstudio-crm`
- [x] Studio → Table Editor → `leads` (5 записей)
- [x] Security Advisor — 0 errors (2 warnings — упомянуто в тексте)
- [x] VS Code Terminal — `npm run dev`, `localhost:3000`

### 13.3. Безопасность (перед сдачей)

- [x] `.env.local` **не** в git (`git ls-files` — пусто)
- [x] RLS на `profiles` и `leads` — manager 2 / admin 5
- [x] Middleware — manager не попадает на `/admin/clients`
- [x] `service_role` не в client components
- [x] GitHub без секретов — только `.env.local.example`
- [x] На скринах нет anon/service keys (`supabase status` не в отчёт)

### 13.4. Документы

| Файл | Назначение |
|------|------------|
| `DZ-9_отчёт_для_сдачи.docx` | **Сдача в школу** (скрины + ссылка GitHub) |
| `DZ-9_РУКОВОДСТВО_И_ПЗ.docx` | Пояснительная записка + руководство |
| `SECURITY.md` | Безопасность и чеклист |
| `TODO_ROADMAP.md` | План развития (EDU, Tilda) |
| `СТАРТ.md` | Шпаргалка запуска |

### 13.5. GitHub

**https://github.com/treshkash323-alt/designstudio-crm** — код без `.env.local`. Для преподавателя: репозиторий + локальный запуск по `СТАРТ.md`.

### 13.6. Терминал (типичные ошибки)

- **Один** VS Code Terminal — `npm run dev`; порт из `Local:` = порт в браузере.
- `Port 3000 is in use` → лишний `npm run dev` в другом окне; `Ctrl+C` везде, один перезапуск.
- `designstudio-crm` в PowerShell — **не команда**, это имя папки.
- 404 на `:3000` при сервере на `:3001` — открыть тот же порт, что в терминале.

---

## 14. Безопасность — аудит и чеклист

> Полная версия: **`SECURITY.md`**. Ниже — суть для пояснительной записки.

### 14.1. Вердикт (08.06.2026)

| Вопрос | Ответ |
|--------|--------|
| Утечки в GitHub? | **Нет** — проверено `git ls-files` |
| RLS работает? | **Да** — 2 vs 5 лидов |
| service_role в браузере? | **Нет** |
| Атака из интернета? | **Нет** — только localhost |

### 14.2. Как защищено

1. **RLS** — PostgreSQL фильтрует строки `leads` по `assigned_to` и роли admin в JWT.  
2. **Middleware** — `/admin/*` только для `app_metadata.role === 'admin'`.  
3. **Ключи** — anon в клиенте (с RLS); service_role только в `.env.local`.  
4. **Git** — `.gitignore`: `.env.local`, `node_modules`, `.next`.

### 14.3. Ограничения учебной версии

- Открытая регистрация на `/login`.  
- Studio `:54323` без пароля (локальный Supabase).  
- Demo JWT keys — стандарт CLI, не для облака as-is.  
- Advisor: **2 warnings** на `handle_new_user()` — типично для триггера регистрации.

### 14.4. Что усилить в prod (кратко)

Закрытая регистрация · уникальные ключи · HTTPS · admin через Server Action · REVOKE на SECURITY DEFINER · audit log · не публиковать реальные ПДн.

---

## 15. Развитие проекта (TODO)

> Детали: **`TODO_ROADMAP.md`**. ДЗ-9 **не блокирует** эти пункты — делаем **после сдачи**.

### 15.1. Образование (AIKIVAVIORA / EDU)

Переиспользовать CRM-каркас:

- роли **student / teacher / admin**;
- таблицы курсов, записей, прогресса;
- RLS: студент видит только своё, учитель — свои группы;
- связь с **dzen-rag** и каталогом материалов.

### 15.2. Tilda

**Отдельное обсуждение.** План:

- Tilda — витрина, лендинг, оплата (опыт ДЗ-8);
- CRM / личный кабинет — Next.js или Members;
- прототип визуала — `tilda-site-migration`.

### 15.3. Безопасность prod

Supabase Cloud или VPS, invite-only, CI, secret scan — см. SECURITY.md §4.

---

## 16. Вывод

Развёрнут локальный стек Docker → Supabase → RLS → Next.js с разграничением **manager / admin**. Код и документация на GitHub без секретов. Проведён аудит безопасности (`SECURITY.md`). ДЗ-9 готово к сдаче; развитие в образование и Tilda — в `TODO_ROADMAP.md`.

**Главная мысль:** один SQL-запрос `SELECT * FROM leads` возвращает **разное число строк** для manager и admin — это RLS, а не фильтр в React.

---

*ДЗ-9 · DesignStudio CRM · Игорь Кашинцев · 08.06.2026*
