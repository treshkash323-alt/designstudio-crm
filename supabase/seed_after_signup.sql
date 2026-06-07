-- ДЗ-9: назначить admin и привязать лидов менеджеру
-- Выполнить в Supabase Studio → SQL Editor после регистрации пользователей

-- 1) Роль admin (profiles + JWT app_metadata)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@designstudio.ru';

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@designstudio.ru';

-- 2) Привязать двух лидов менеджеру
UPDATE public.leads
SET assigned_to = (SELECT id FROM auth.users WHERE email = 'manager@designstudio.ru')
WHERE name IN ('Алексей Петров', 'Мария Смирнова');

-- Проверка
SELECT u.email, p.role, p.full_name FROM auth.users u
JOIN public.profiles p ON p.id = u.id;

SELECT name, assigned_to FROM public.leads ORDER BY name;
