create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  key text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, key)
);

create index if not exists projects_workspace_id_created_at_idx
on public.projects (workspace_id, created_at desc);

alter table public.projects enable row level security;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create policy "workspace members can view projects"
on public.projects
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace members can create projects"
on public.projects
for insert
to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin', 'member'])
  and created_by = auth.uid()
);

create policy "workspace members can update projects"
on public.projects
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "workspace admins can delete projects"
on public.projects
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

grant select, insert, update, delete on public.projects to authenticated;
