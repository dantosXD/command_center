-- domains.sql: PostgREST policies for domain-scoped resources (T052)
-- Enforces domain membership checks for collections, tasks, dependencies, and saved filters

-- Collections: visible to domain members
create policy "Users can view collections in their domains"
on public.collections for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = collections.domain_id and dm.user_id = auth.uid()
  )
);

create policy "Domain members can manage collections"
on public.collections for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = collections.domain_id and dm.user_id = auth.uid() and dm.role in ('owner', 'admin')
  )
);

-- Tasks: visible to domain members, editable by admins/owners
create policy "Users can view tasks in their domains"
on public.tasks for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = tasks.domain_id and dm.user_id = auth.uid()
  )
);

create policy "Domain members can manage tasks"
on public.tasks for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = tasks.domain_id and dm.user_id = auth.uid() and dm.role in ('owner', 'admin', 'member')
  )
);

-- Task dependencies: inherit task visibility
create policy "Users can view task dependencies via task domain"
on public.task_dependencies for select
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = task_dependencies.task_id and dm.user_id = auth.uid()
  )
);

create policy "Users can manage task dependencies via task domain"
on public.task_dependencies for all
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = task_dependencies.task_id and dm.user_id = auth.uid() and dm.role in ('owner', 'admin', 'member')
  )
);

-- Saved filters: user-scoped, optionally shared
create policy "Users can view their own saved filters"
on public.saved_filters for select
using (
  user_id = auth.uid() or auth.uid() = any(shared_with)
);

create policy "Users can manage their own saved filters"
on public.saved_filters for all
using (user_id = auth.uid());

-- Attachments: inherit task domain visibility
create policy "Users can view attachments via task domain"
on public.attachments for select
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = attachments.task_id and dm.user_id = auth.uid()
  )
);

create policy "Users can manage attachments via task domain"
on public.attachments for all
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = attachments.task_id and dm.user_id = auth.uid() and dm.role in ('owner', 'admin', 'member')
  )
);
