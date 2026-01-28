-- Tabela de emails para Inbox do sistema

CREATE TABLE IF NOT EXISTS public.emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'imap',
  provider_id text NOT NULL,
  thread_id text,
  from_name text,
  from_email text,
  subject text,
  received_at timestamptz,
  body_raw_html text,
  body_clean_text text,
  navio_id uuid REFERENCES public.navios(id) ON DELETE SET NULL,
  ship text,
  topic text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'new',
  priority text,
  attachments jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_provider_id
  ON public.emails(provider, provider_id);

CREATE INDEX IF NOT EXISTS idx_emails_received_at
  ON public.emails(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_emails_due_at
  ON public.emails(due_at);

CREATE INDEX IF NOT EXISTS idx_emails_navio
  ON public.emails(navio_id);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emails_select_auth" ON public.emails;
CREATE POLICY "emails_select_auth" ON public.emails
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "emails_insert_auth" ON public.emails;
CREATE POLICY "emails_insert_auth" ON public.emails
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "emails_update_auth" ON public.emails;
CREATE POLICY "emails_update_auth" ON public.emails
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
