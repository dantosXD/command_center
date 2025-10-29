-- backend/supabase/seeds/dev.sql
-- Development seed data for Command Center
-- Run: psql $DATABASE_URL < backend/supabase/seeds/dev.sql

BEGIN;

-- Clean existing data (for idempotent seeding)
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.task_dependencies CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.collections CASCADE;
TRUNCATE TABLE public.domain_members CASCADE;
TRUNCATE TABLE public.domains CASCADE;
TRUNCATE TABLE public.workspace_members CASCADE;
TRUNCATE TABLE public.workspaces CASCADE;
TRUNCATE TABLE public.feature_flags CASCADE;

-- Create test workspace
INSERT INTO public.workspaces (id, name, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Test Workspace', NOW(), NOW());

-- Create test domains (Home, Work, Play)
INSERT INTO public.domains (id, workspace_id, name, color, visibility, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Home', '#3B82F6', 'private', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Work', '#10B981', 'private', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Play', '#F59E0B', 'private', NOW(), NOW());

-- Create test users (simulated auth.users)
-- Note: In real Supabase, these would be created via GoTrue
-- For development, we'll create domain memberships for a test user
-- User ID: 20000000-0000-0000-0000-000000000001 (test@example.com)
-- User ID: 20000000-0000-0000-0000-000000000002 (user2@example.com)

-- Workspace memberships
INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner', NOW()),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'member', NOW());

-- Domain memberships (user1 has access to all domains, user2 only to Work)
INSERT INTO public.domain_members (domain_id, user_id, role, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner', NOW()),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'owner', NOW()),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'owner', NOW()),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'member', NOW());

-- Create collections
INSERT INTO public.collections (id, domain_id, name, type, created_at, updated_at) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Personal Projects', 'project', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Q4 2025 Planning', 'project', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Engineering Tasks', 'list', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Hobby Projects', 'project', NOW(), NOW());

-- Create sample tasks (varied statuses, priorities, due dates)
INSERT INTO public.tasks (id, domain_id, collection_id, title, description, status, priority, due_at, assigned_to, created_at, updated_at) VALUES
  -- Home domain tasks
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Plan family vacation', 'Research destinations and book flights for summer 2025', 'backlog', 2,
   NOW() + INTERVAL '10 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', NOW()),

  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'Buy groceries', 'Weekly shopping list: milk, eggs, bread, vegetables', 'in-progress', 4,
   NOW() + INTERVAL '1 day', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW()),

  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', NULL,
   'Fix leaky faucet', 'Call plumber or DIY repair bathroom sink', 'backlog', 3,
   NOW() + INTERVAL '5 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW()),

  -- Work domain tasks
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
   'Complete Q4 budget review', 'Analyze departmental spending and prepare report for CFO', 'in-progress', 4,
   NOW() + INTERVAL '3 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days', NOW()),

  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003',
   'Implement user authentication', 'Build login/signup flow with Supabase GoTrue integration', 'in-progress', 4,
   NOW() + INTERVAL '2 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days', NOW()),

  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003',
   'Fix critical production bug', 'Users report 500 errors on checkout page. Investigate ASAP.', 'blocked', 5,
   NOW(), '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day', NOW()),

  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003',
   'Write API documentation', 'Document all PostgREST endpoints and response schemas', 'done', 2,
   NOW() - INTERVAL '2 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),

  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
   'Prepare team presentation', 'Create slides for Q4 roadmap review meeting', 'backlog', 3,
   NOW() + INTERVAL '7 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW()),

  -- Play domain tasks
  ('40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004',
   'Learn guitar solo', 'Practice "Stairway to Heaven" solo section for 30 min daily', 'in-progress', 2,
   NOW() + INTERVAL '14 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days', NOW()),

  ('40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004',
   'Finish reading "Dune"', 'Complete chapters 8-12 this weekend', 'backlog', 1,
   NOW() + INTERVAL '3 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days', NOW()),

  -- Overdue tasks (for testing)
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', NULL,
   'File taxes', 'Gather documents and file federal tax return', 'backlog', 5,
   NOW() - INTERVAL '5 days', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '10 days'),

  ('40000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003',
   'Update security patches', 'Apply latest security updates to production servers', 'in-progress', 5,
   NOW() - INTERVAL '1 day', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days', NOW());

-- Create sample events
INSERT INTO public.events (id, domain_id, title, description, start_at, end_at, all_day, location, attendees, created_at, updated_at) VALUES
  -- Home events
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Dentist Appointment', 'Regular checkup and cleaning',
   NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '15 hours',
   false, 'Downtown Dental, 123 Main St', '[]', NOW(), NOW()),

  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Weekend Hiking Trip', 'Mountain trail with family',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '6 hours',
   true, 'Mt. Rainier National Park', '["Sarah", "Alex"]', NOW(), NOW()),

  -- Work events
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002',
   'Q4 Budget Review Meeting', 'Leadership team quarterly review',
   NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '11 hours',
   false, 'Conference Room A', '["CFO", "VP Engineering", "VP Sales"]', NOW(), NOW()),

  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002',
   'Team Standup', 'Daily engineering sync',
   NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '10 hours' + INTERVAL '30 minutes',
   false, 'Zoom', '["Engineering Team"]', NOW(), NOW()),

  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002',
   'Product Launch', 'v2.0 release celebration',
   NOW() + INTERVAL '10 days' + INTERVAL '17 hours', NOW() + INTERVAL '10 days' + INTERVAL '19 hours',
   false, 'Office Cafeteria', '["All Staff"]', NOW(), NOW()),

  -- Play events
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003',
   'Guitar Lesson', 'Weekly lesson with instructor',
   NOW() + INTERVAL '4 days' + INTERVAL '18 hours', NOW() + INTERVAL '4 days' + INTERVAL '19 hours',
   false, 'Music Academy', '[]', NOW(), NOW());

-- Create feature flags
INSERT INTO public.feature_flags (key, enabled, description, created_at, updated_at) VALUES
  ('central-hub-mvp', true, 'Enable central hub aggregation view', NOW(), NOW()),
  ('calendar-overlay', true, 'Enable multi-calendar overlay view', NOW(), NOW()),
  ('task-dependencies', true, 'Enable task dependency tracking', NOW(), NOW()),
  ('search-beta', true, 'Enable full-text search beta', NOW(), NOW()),
  ('notification-outbox-v2', false, 'Enable new notification delivery pipeline', NOW(), NOW());

COMMIT;

-- Verify seed data
SELECT 'Workspaces:' as entity, COUNT(*) as count FROM public.workspaces
UNION ALL
SELECT 'Domains:', COUNT(*) FROM public.domains
UNION ALL
SELECT 'Collections:', COUNT(*) FROM public.collections
UNION ALL
SELECT 'Tasks:', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'Events:', COUNT(*) FROM public.events
UNION ALL
SELECT 'Feature Flags:', COUNT(*) FROM public.feature_flags;
