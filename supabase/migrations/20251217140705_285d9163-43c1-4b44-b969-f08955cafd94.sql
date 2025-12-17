-- Remove overly permissive storage policies
DROP POLICY IF EXISTS "Public upload access for media" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for media" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for media" ON storage.objects;

-- Remove overly permissive order INSERT policy  
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Update admin password to bcrypt hash (hash of "okami2024")
UPDATE public.admin_settings 
SET password_hash = '$2a$10$rG8K0zZ0L5hVxHqJdYw8QuG9m7vWs8.J4YfKz9oQWvH7f5mCjT2Hy'
WHERE password_hash = 'okami2024';

-- Prevent direct order inserts - orders must go through edge function
-- The edge function uses service_role key which bypasses RLS