-- Create admin sessions table for persistent authentication
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- No public access - only accessible via service role
CREATE POLICY "No public access to admin sessions"
ON public.admin_sessions
FOR ALL
USING (false);

-- Index for faster token lookups
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(token);