create or replace function public.prevent_last_workspace_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if current_setting('app.deleting_workspace_id', true) = old.workspace_id::text then
      return old;
    end if;

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

create or replace function public.delete_workspace_for_current_user(
  target_workspace_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.has_workspace_role(target_workspace_id, array['owner']) then
    raise exception 'Only workspace owners can delete this workspace.';
  end if;

  perform set_config('app.deleting_workspace_id', target_workspace_id::text, true);

  delete from public.workspaces
  where id = target_workspace_id;
end;
$$;

grant execute on function public.delete_workspace_for_current_user(uuid)
to authenticated;
