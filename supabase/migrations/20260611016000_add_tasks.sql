create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid references auth.users(id) on delete set null,
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_workspace_id_created_at_idx
on public.tasks (workspace_id, created_at desc);

create index if not exists tasks_project_id_status_idx
on public.tasks (project_id, status);

create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_checklist_items_task_id_position_idx
on public.task_checklist_items (task_id, position);

alter table public.tasks enable row level security;
alter table public.task_checklist_items enable row level security;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

drop trigger if exists set_task_checklist_items_updated_at on public.task_checklist_items;
create trigger set_task_checklist_items_updated_at
before update on public.task_checklist_items
for each row
execute function public.set_updated_at();

create policy "workspace members can view tasks"
on public.tasks
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace members can create tasks"
on public.tasks
for insert
to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin', 'member'])
  and created_by = auth.uid()
);

create policy "workspace members can update tasks"
on public.tasks
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "workspace admins can delete tasks"
on public.tasks
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "workspace members can view checklist items"
on public.task_checklist_items
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace members can create checklist items"
on public.task_checklist_items
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "workspace members can update checklist items"
on public.task_checklist_items
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "workspace admins can delete checklist items"
on public.task_checklist_items
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.task_checklist_items to authenticated;
