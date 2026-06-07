# -*- coding: utf-8 -*-
"""Сборка DZ-9 docx из DZ-9_РУКОВОДСТВО_И_ПЗ.md (упрощённая версия для Word)."""
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm

ROOT = Path(__file__).resolve().parent


def setup_doc(title: str) -> Document:
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Cm(2)
    sec.bottom_margin = Cm(2)
    sec.left_margin = Cm(2.5)
    sec.right_margin = Cm(2)
    h = doc.add_heading(title, level=0)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return doc


def meta_lines(doc: Document, rows: list[tuple[str, str]]) -> None:
    for label, val in rows:
        p = doc.add_paragraph()
        p.add_run(label + " ").bold = True
        p.add_run(val)
    doc.add_paragraph()


def add_table(doc: Document, headers: list[str], rows: list[tuple]) -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for p in cell.paragraphs:
            for r in p.runs:
                r.bold = True
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            table.rows[ri + 1].cells[ci].text = str(val)
    doc.add_paragraph()


def add_bullets(doc: Document, items: list[str]) -> None:
    for item in items:
        doc.add_paragraph(item, style="List Bullet")


def add_numbered(doc: Document, items: list[str]) -> None:
    for item in items:
        doc.add_paragraph(item, style="List Number")


def build() -> Path:
    doc = setup_doc("ДЗ-9 — руководство по эксплуатации и пояснительная записка")
    meta_lines(
        doc,
        [
            ("Студент:", "Игорь Кашинцев"),
            ("Курс:", "VibeCoder, Тема 9 — локальная CRM, Supabase, RLS"),
            ("Проект:", "DesignStudio CRM"),
            ("Папка:", "Projects/ДЗ-9/designstudio-crm/"),
            ("Дата:", "июнь 2026"),
            ("Полная версия (MD):", "DZ-9_РУКОВОДСТВО_И_ПЗ.md"),
        ],
    )

    doc.add_heading("Аннотация", level=1)
    doc.add_paragraph(
        "Документ объединяет пояснительную записку к ДЗ-9 и руководство по эксплуатации. "
        "Цель — чтобы вы могли самостоятельно запускать проект, понимать RLS и роли, "
        "работать со Studio и сдавать домашку со скринами."
    )

    doc.add_heading("1. Что это за проект", level=1)
    doc.add_paragraph(
        "Локальная CRM для отдела продаж DesignStudio: менеджер видит только своих лидов, "
        "админ — всех. Стек: Docker + Supabase CLI + Next.js 14 + PostgreSQL RLS."
    )

    doc.add_heading("2. Глоссарий (кратко)", level=1)
    add_table(
        doc,
        ["Термин", "Простыми словами"],
        [
            ("Docker", "Запускает контейнеры — «коробки» с Supabase на вашем ПК"),
            ("Supabase CLI", "Команда npx supabase start — поднимает БД и Auth локально"),
            ("Studio", "Веб-панель http://localhost:54323 — таблицы, SQL, пользователи"),
            ("RLS", "Правила в PostgreSQL: кто какие строки таблицы видит"),
            ("JWT", "Токен после входа; внутри role для admin"),
            ("anon key", "Публичный ключ приложения (в .env.local)"),
            ("service_role", "Секретный ключ только на сервере, обходит RLS"),
        ],
    )

    doc.add_heading("3. Ежедневный запуск", level=1)
    add_numbered(
        doc,
        [
            "Docker Desktop → Engine running",
            "cd Projects\\ДЗ-9\\designstudio-crm",
            "npx supabase start (если ещё не запущен)",
            "npm run dev → http://localhost:3000",
        ],
    )
    doc.add_paragraph("Остановка: npx supabase stop")

    doc.add_heading("4. Роли и проверка", level=1)
    add_table(
        doc,
        ["Пользователь", "Страница", "Ожидание"],
        [
            ("manager@designstudio.ru", "/dashboard", "2 лида"),
            ("admin@designstudio.ru", "/admin/clients", "5 лидов"),
        ],
    )
    doc.add_paragraph(
        "После назначения admin через SQL — выйти и войти снова (обновить JWT)."
    )

    doc.add_heading("5. SQL после регистрации", level=1)
    doc.add_paragraph(
        "Файл supabase/seed_after_signup.sql — в Studio → SQL Editor → Run. "
        "Не запускать путь к файлу в PowerShell как команду."
    )

    doc.add_heading("6. Security Advisor (2 warning)", level=1)
    doc.add_paragraph(
        "Предупреждения про handle_new_user() — типичны для триггера регистрации "
        "SECURITY DEFINER. Для учебного локального проекта допустимо. "
        "В проде настраивают REVOKE EXECUTE."
    )

    doc.add_heading("7. Сдача ДЗ", level=1)
    add_bullets(
        doc,
        [
            "Скрин менеджера: dashboard, 2 клиента",
            "Скрин админа: /admin/clients, 5 клиентов",
            "Опционально: Docker Containers или Studio → leads",
        ],
    )

    doc.add_heading("8. Заключение", level=1)
    doc.add_paragraph(
        "ДЗ выполнено: локальный Supabase, RLS, два пользователя, разграничение доступа. "
        "Подробные пояснения, примеры SQL и troubleshooting — в DZ-9_РУКОВОДСТВО_И_ПЗ.md."
    )

    out = ROOT / "DZ-9_РУКОВОДСТВО_И_ПЗ.docx"
    doc.save(out)
    return out


def build_report() -> Path:
    doc = setup_doc("ДЗ-9 — отчёт для сдачи (Lite)")
    meta_lines(
        doc,
        [
            ("Студент:", "Игорь Кашинцев"),
            ("Курс:", "VibeCoder, Тема 9 — локальная CRM, Supabase, RLS"),
            ("Проект:", "DesignStudio CRM"),
            ("Папка:", "Projects/ДЗ-9/designstudio-crm/"),
            ("Запуск:", "localhost:3000 · Studio :54323"),
            ("Дата:", "08.06.2026"),
        ],
    )

    doc.add_heading("1. Цель работы", level=1)
    add_numbered(
        doc,
        [
            "Локальная CRM через Docker + Supabase CLI (без облака).",
            "Два пользователя: менеджер и администратор.",
            "RLS в PostgreSQL: менеджер — только assigned_to = его ID.",
            "Next.js 14: login, /dashboard, /admin/clients.",
            "Проверка: 2 vs 5 лидов — разграничение работает.",
        ],
    )

    doc.add_heading("2. Отличие от методички", level=1)
    add_table(
        doc,
        ["В методичке", "В реализации"],
        [
            ("trailcamp-crm", "designstudio-crm (Lite)"),
            ("@trailcamp.ru", "@designstudio.ru"),
            ("/admin/leads", "/admin/clients"),
        ],
    )

    doc.add_heading("3. Стек", level=1)
    doc.add_paragraph(
        "Docker · Supabase CLI · PostgreSQL RLS · Next.js 14 · TypeScript · "
        "Tailwind · @supabase/ssr"
    )

    doc.add_heading("4. Скриншоты (вставить в документ)", level=1)
    add_table(
        doc,
        ["№", "Что снять", "Подпись"],
        [
            ("1", "Менеджер /dashboard — 2 клиента, RLS (2)", "Рис. 1. Менеджер"),
            ("2", "Админ /admin/clients — 5 клиентов, АДМИН", "Рис. 2. Админ"),
            ("3", "Docker — контейнеры designstudio-crm", "Рис. 3. Docker"),
            ("4", "Studio — таблица leads", "Рис. 4. База"),
            ("5", "Терминал npm run dev", "Рис. 5. Запуск"),
        ],
    )

    doc.add_heading("5. Сценарий проверки", level=1)
    add_numbered(
        doc,
        [
            "Docker → npx supabase start → npm run dev",
            "Регистрация manager@ и admin@designstudio.ru",
            "SQL seed_after_signup.sql в Studio",
            "Admin: выход/вход → /admin/clients — 5 лидов",
            "Manager: /dashboard — 2 лида",
        ],
    )

    doc.add_heading("6. Результат", level=1)
    add_table(
        doc,
        ["Пункт", "Статус"],
        [
            ("Supabase локально", "✅"),
            ("RLS + 2 пользователя", "✅"),
            ("Менеджер — 2 лида", "✅"),
            ("Админ — 5 лидов", "✅"),
            ("Скрины в документе", "☐ вручную"),
        ],
    )

    doc.add_heading("7. Ссылки", level=1)
    add_table(
        doc,
        ["Ресурс", "URL"],
        [
            ("GitHub", "https://github.com/treshkash323-alt/designstudio-crm"),
            ("CRM (локально)", "http://localhost:3000"),
            ("Supabase Studio", "http://localhost:54323"),
        ],
    )

    doc.add_heading("8. Комментарий для преподавателя", level=1)
    doc.add_paragraph(
        "Lite выполнено локально. RLS + middleware. Подробное руководство: "
        "DZ-9_РУКОВОДСТВО_И_ПЗ.docx. Advisor: 0 errors."
    )

    out = ROOT / "DZ-9_отчёт_для_сдачи.docx"
    doc.save(out)
    return out


if __name__ == "__main__":
    print("OK guide:", build())
    print("OK report:", build_report())
