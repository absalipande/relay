create or replace function public.create_workspace_for_current_user(
  workspace_id uuid,
  workspace_name text,
  workspace_slug text
)
returns table (
  id uuid,
  name text,
  slug text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated.';
  end if;

  insert into public.workspaces (id, name, slug)
  values (workspace_id, workspace_name, workspace_slug);

  insert into public.workspace_members (workspace_id, user_id, role)
  values (workspace_id, current_user_id, 'owner');

  return query
  select
    workspaces.id,
    workspaces.name,
    workspaces.slug,
    workspaces.created_at,
    workspaces.updated_at
  from public.workspaces
  where workspaces.id = workspace_id;
end;
$$;

grant execute on function public.create_workspace_for_current_user(uuid, text, text)
to authenticated;
