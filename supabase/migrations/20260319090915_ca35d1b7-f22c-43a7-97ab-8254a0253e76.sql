
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
    0,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.seed_performance_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  months TEXT[] := ARRAY['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  m TEXT;
BEGIN
  FOREACH m IN ARRAY months LOOP
    INSERT INTO public.performance_history (user_id, month, score)
    VALUES (NEW.user_id, m, 0);
  END LOOP;
  RETURN NEW;
END;
$function$;
