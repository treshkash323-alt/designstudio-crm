# DesignStudio CRM → развитие (TODO)

**Статус:** ДЗ-9 закрыто · отчёт Word со скринами · код на GitHub  
**Не смешивать с:** развитием после сдачи — пункты ниже **после** загрузки в LMS.

---

## Фаза 0 — закрыть ДЗ-9 ✅

- [x] Локальный Supabase + RLS
- [x] manager / admin, 2 vs 5 лидов
- [x] GitHub: https://github.com/treshkash323-alt/designstudio-crm
- [x] Отчёт, ПЗ, SECURITY.md
- [x] Скрины 1–6 (+ login) в `DZ-9_отчёт_для_сдачи.docx`
- [ ] Загрузка Word в LMS школы

---

## Фаза 1 — образование (AIKIVAVIORA / EDU)

> Переиспользовать каркас CRM: **админ + пользователи + разграничение данных**.

| TODO | Описание |
|------|----------|
| [ ] Роли | `student`, `teacher`, `admin` вместо manager/admin |
| [ ] Таблицы | `courses`, `enrollments`, `lessons`, `progress` |
| [ ] RLS | студент — только свои курсы/прогресс; учитель — свои группы |
| [ ] Admin UI | назначение ролей через Server Action + `supabaseAdmin` |
| [ ] Invite-only | регистрация по ссылке / код курса |
| [ ] Связь с RAG | модуль `dzen-rag` / каталог — чат по материалам курса |
| [ ] Документация | обновить SECURITY.md под EDU |

**Репозиторий:** можно форкнуть `designstudio-crm` → `aikivaviora-edu-crm` (отдельно от ДЗ-9).

---

## Фаза 2 — сайт на Tilda

> **Отдельное обсуждение с пользователем.** Здесь только якорь.

| TODO | Описание |
|------|----------|
| [ ] Tilda | лендинг, витрина курсов, оплата (ЮKassa — опыт ДЗ-8) |
| [ ] Интеграция | Tilda → webhook / форма → лид в CRM или Supabase |
| [ ] Не дублировать | Tilda = маркетинг; личный кабинет = Next.js или Tilda Members |
| [ ] Дизайн | токены AIKIVAVIORA, прототип `tilda-site-migration` |

**Пока:** не блокирует сдачу ДЗ-9.

---

## Фаза 3 — безопасность и prod

См. полный список в `SECURITY.md` §4.

| Приоритет | Задача |
|-----------|--------|
| P0 | Закрытая регистрация |
| P0 | Уникальные prod keys, secrets не в git |
| P1 | Admin role только через server |
| P1 | REVOKE на SECURITY DEFINER functions |
| P1 | Индексы `leads(assigned_to)` |
| P2 | Audit log (кто менял assigned_to) |
| P2 | CI: build + lint + secret scan |
| P3 | Deploy: Vercel (Next) + Supabase Cloud |

---

## Фаза 4 — оптимизация кода

- [ ] Supabase generated types (`database.types.ts`)
- [ ] Пагинация admin-таблицы
- [ ] zod-валидация форм
- [ ] E2E тест RLS (Playwright + два контекста)
- [ ] Удалить неиспользуемый `admin.ts` или подключить в actions

---

## Связь с другими проектами

| Проект | Связь |
|--------|--------|
| Aviora Garden AI | другой продукт (B2C сад), не CRM |
| dzen-rag | контент для EDU-ветки |
| kp-generator (ДЗ-8) | монетизация PDF — паттерн для Tilda |
| AIKIVAVIORA Tilda | витрина, см. Фаза 2 |

---

*Обновлять по мере решений. Tilda — обсудить отдельно.*
