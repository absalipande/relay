drop policy if exists "workspace admins can add members"
on public.workspace_members;

create policy "workspace owners and admins can add members"
on public.workspace_members
for insert
to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner'])
  or (
    public.has_workspace_role(workspace_id, array['admin'])
    and role in ('admin', 'member', 'viewer')
  )
);

create or replace function public.prevent_last_workspace_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner'
      and not exists (
        select 1
        from public.workspace_members
        where workspace_id = old.workspace_id
          and user_id <> old.user_id
          and role = 'owner'
      )
    then
      raise exception 'A workspace must have at least one owner.';
    end if;

    return old;
  end if;

  if old.role = 'owner'
    and (
      new.role <> 'owner'
      or new.workspace_id <> old.workspace_id
      or new.user_id <> old.user_id
    )
    and not exists (
      select 1
      from public.workspace_members
      where workspace_id = old.workspace_id
        and user_id <> old.user_id
        and role = 'owner'
    )
  then
    raise exception 'A workspace must have at least one owner.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_last_workspace_owner_removal
on public.workspace_members;

create trigger prevent_last_workspace_owner_removal
before update or delete on public.workspace_members
for each row
execute function public.prevent_last_workspace_owner_removal();
