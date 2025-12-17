-- Reset admin password to plain text for migration to new hash format
-- The Edge Function will hash it on first password change
UPDATE public.admin_settings 
SET password_hash = 'okami2024'
WHERE password_hash LIKE '$2a$%';