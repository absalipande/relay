create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create policy "workspace members can view workspaces"
on public.workspaces
for select
to authenticated
using (public.is_workspace_member(id));

create policy "authenticated users can create workspaces"
on public.workspaces
for insert
to authenticated
with check (auth.uid() is not null);

create policy "workspace admins can update workspaces"
on public.workspaces
for update
to authenticated
using (public.has_workspace_role(id, array['owner', 'admin']))
with check (public.has_workspace_role(id, array['owner', 'admin']));

create policy "workspace owners can delete workspaces"
on public.workspaces
for delete
to authenticated
using (public.has_workspace_role(id, array['owner']));

create policy "workspace members can view memberships"
on public.workspace_members
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "users can create their initial owner membership"
on public.workspace_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and not exists (
    select 1
    from public.workspace_members existing_members
    where existing_members.workspace_id = workspace_id
  )
);

create policy "workspace admins can add members"
on public.workspace_members
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "workspace owners can update memberships"
on public.workspace_members
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']))
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "workspace owners can remove memberships"
on public.workspace_members
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));
