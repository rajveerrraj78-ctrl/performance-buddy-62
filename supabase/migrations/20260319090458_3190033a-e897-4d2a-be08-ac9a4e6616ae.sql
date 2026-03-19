
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, employee_id, projects_completed, productivity_score, rating, performance_score)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || substr(NEW.id::text, 1, 8)),
    floor(random() * 20 + 5)::int,
    round((random() * 40 + 60)::numeric, 2),
    round((random() * 2 + 3)::numeric, 1),
    round((random() * 30 + 70)::numeric, 2)
  );
  RETURN NEW;
END;
$function$;
