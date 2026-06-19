alter table public.workspaces
add column if not exists last_opened_at timestamptz;
