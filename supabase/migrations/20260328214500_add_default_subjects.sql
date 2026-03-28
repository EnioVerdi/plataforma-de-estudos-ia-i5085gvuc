DO $$
BEGIN
  -- Update the handle_new_user function to also insert default subjects
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.subjects (id, name, color, user_id)
    VALUES
      (gen_random_uuid(), 'Português', '#3b82f6', NEW.id),
      (gen_random_uuid(), 'Matemática', '#ef4444', NEW.id),
      (gen_random_uuid(), 'Física', '#f59e0b', NEW.id),
      (gen_random_uuid(), 'Química', '#10b981', NEW.id),
      (gen_random_uuid(), 'Biologia', '#84cc16', NEW.id),
      (gen_random_uuid(), 'História', '#eab308', NEW.id),
      (gen_random_uuid(), 'Geografia', '#0ea5e9', NEW.id),
      (gen_random_uuid(), 'Filosofia', '#8b5cf6', NEW.id),
      (gen_random_uuid(), 'Sociologia', '#ec4899', NEW.id),
      (gen_random_uuid(), 'Inglês', '#6366f1', NEW.id),
      (gen_random_uuid(), 'Literatura', '#d946ef', NEW.id),
      (gen_random_uuid(), 'Artes', '#f43f5e', NEW.id),
      (gen_random_uuid(), 'Educação Física', '#f97316', NEW.id);

    RETURN NEW;
  END;
  $function$;
END $$;

-- Insert missing subjects for existing users safely
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    INSERT INTO public.subjects (id, name, color, user_id)
    VALUES
      (gen_random_uuid(), 'Português', '#3b82f6', u.id),
      (gen_random_uuid(), 'Matemática', '#ef4444', u.id),
      (gen_random_uuid(), 'Física', '#f59e0b', u.id),
      (gen_random_uuid(), 'Química', '#10b981', u.id),
      (gen_random_uuid(), 'Biologia', '#84cc16', u.id),
      (gen_random_uuid(), 'História', '#eab308', u.id),
      (gen_random_uuid(), 'Geografia', '#0ea5e9', u.id),
      (gen_random_uuid(), 'Filosofia', '#8b5cf6', u.id),
      (gen_random_uuid(), 'Sociologia', '#ec4899', u.id),
      (gen_random_uuid(), 'Inglês', '#6366f1', u.id),
      (gen_random_uuid(), 'Literatura', '#d946ef', u.id),
      (gen_random_uuid(), 'Artes', '#f43f5e', u.id),
      (gen_random_uuid(), 'Educação Física', '#f97316', u.id)
    ON CONFLICT (user_id, name) DO UPDATE SET color = EXCLUDED.color;
  END LOOP;
END $$;
