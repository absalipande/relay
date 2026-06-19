alter table public.workspaces
add column if not exists icon_initials text,
add column if not exists icon_color text;
