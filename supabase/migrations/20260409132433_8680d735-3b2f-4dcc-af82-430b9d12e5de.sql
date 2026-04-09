
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Update trigger to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'employee'),
    NEW.email
  );
  RETURN NEW;
END;
$$;
