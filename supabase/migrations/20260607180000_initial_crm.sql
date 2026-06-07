-- DesignStudio CRM: profiles, leads, RLS

CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  role       text NOT NULL DEFAULT 'manager'
             CHECK (role IN ('manager', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  company     text,
  phone       text,
  email       text,
  status      text DEFAULT 'new'
              CHECK (status IN ('new', 'contacted', 'won', 'lost')),
  assigned_to uuid REFERENCES public.profiles(id),
  notes       text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

-- leads: manager
CREATE POLICY "leads: manager sees own"
  ON public.leads FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "leads: manager insert"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "leads: manager update own"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- leads: admin
CREATE POLICY "leads: admin all"
  ON public.leads FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

-- demo leads (unassigned until manager UUID is known)
INSERT INTO public.leads (name, company, phone, email, status) VALUES
  ('Алексей Петров',   'ООО Вертикаль',    '+7-999-111-22-33', 'a.petrov@vert.ru',      'new'),
  ('Мария Смирнова',   'ИП Смирнова М.',   '+7-999-222-33-44', 'm.smirnova@mail.ru',    'contacted'),
  ('Дмитрий Козлов',   'DesignPro Ltd.',   '+7-999-333-44-55', 'd.kozlov@dp.com',       'won'),
  ('Анна Новикова',    'Студия интерьера', '+7-999-444-55-66', 'a.novikova@studio.ru',  'new'),
  ('Сергей Белов',     'ООО Маршрут',      '+7-999-555-66-77', 's.belov@marshrut.ru',   'lost');
