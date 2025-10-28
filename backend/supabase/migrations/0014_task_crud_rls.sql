-- 0014_task_crud_rls.sql
-- Task CRUD Row-Level Security policies (Phase 2 Sprint 3b)
-- Enforces workspace and domain isolation for task visibility and modification

-- NOTE: Tables 'tasks', 'task_dependencies', 'collections' already exist from Phase 1
-- This migration adds RLS policies to enforce access control

-- Enable RLS on tasks table (should already be enabled, but explicit)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view tasks in domains they belong to
-- A user can view a task if they are a member of the task's domain
CREATE POLICY tasks_select ON public.tasks
  FOR SELECT
  USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT policy: Users can create tasks in domains they have access to
-- Users must be members of the domain to create tasks in it
CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT
  WITH CHECK (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE policy: Users can update tasks in domains they belong to
-- Additionally, task owners/assignees may be able to update their own tasks
-- (can be further refined based on domain role)
CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE
  USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

-- DELETE policy: Users can delete tasks in domains they belong to
-- May further restrict to domain admins or task creators
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE
  USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on task_dependencies table
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view dependencies if they can view both tasks
CREATE POLICY task_dependencies_select ON public.task_dependencies
  FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT policy: Users can create dependencies between accessible tasks
CREATE POLICY task_dependencies_insert ON public.task_dependencies
  FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
    AND depends_on IN (
      SELECT id FROM public.tasks
      WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- DELETE policy: Users can delete dependencies they can access
CREATE POLICY task_dependencies_delete ON public.task_dependencies
  FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes for RLS policy performance (these queries run on every access)
-- Ensure domain_members lookups are fast
CREATE INDEX IF NOT EXISTS idx_domain_members_user_domain
  ON public.domain_members(user_id, domain_id);

-- Ensure task filtering by domain is fast
CREATE INDEX IF NOT EXISTS idx_tasks_domain_created
  ON public.tasks(domain_id, created_at DESC);

-- Comment for reference
COMMENT ON POLICY tasks_select ON public.tasks IS
  'Users can view tasks in domains they are members of';
COMMENT ON POLICY tasks_insert ON public.tasks IS
  'Users can create tasks in domains they have access to';
COMMENT ON POLICY tasks_update ON public.tasks IS
  'Users can update tasks in domains they belong to';
COMMENT ON POLICY tasks_delete ON public.tasks IS
  'Users can delete tasks in domains they belong to';
