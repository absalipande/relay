drop policy if exists "users can view their own memberships"
on public.workspace_members;

create policy "users can view their own memberships"
on public.workspace_members
for select
to authenticated
using (user_id = auth.uid());
