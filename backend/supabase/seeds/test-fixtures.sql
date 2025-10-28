-- backend/supabase/seeds/test-fixtures.sql
-- Test fixtures for Phase 2 contract and RLS tests
-- Creates test users, workspaces, domains, and tasks

-- NOTE: In production, use Supabase Auth for user management
-- For testing, we'll create records in auth.users directly (requires direct DB access)
-- Then create corresponding workspace/domain relationships

-- Test User 1: Alice
-- In real testing, sign up via Supabase Auth, then use the returned user ID
-- For now, we'll use a placeholder UUID and note it in comments
-- Real ID: (generate via: supabase auth users create --email alice@test.local --password password)

-- Test User 2: Bob
-- Real ID: (generate via: supabase auth users create --email bob@test.local --password password)

-- For this seed file, we'll use generic UUIDs that tests will reference
-- You'll need to update the actual user IDs after creating auth users

DO $$
DECLARE
  alice_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  bob_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  alice_workspace_id uuid;
  bob_workspace_id uuid;
  alice_private_domain_id uuid;
  alice_shared_domain_id uuid;
  bob_private_domain_id uuid;
  alice_collection_id uuid;
BEGIN
  -- Create Alice's workspace
  INSERT INTO public.workspaces (id, name, timezone)
  VALUES (gen_random_uuid(), 'Alice Workspace', 'UTC')
  RETURNING id INTO alice_workspace_id;

  -- Create Bob's workspace
  INSERT INTO public.workspaces (id, name, timezone)
  VALUES (gen_random_uuid(), 'Bob Workspace', 'UTC')
  RETURNING id INTO bob_workspace_id;

  -- Add Alice as member of her workspace
  INSERT INTO public.domain_members (domain_id, user_id, role)
  -- NOTE: domain_members is actually for domain membership
  -- Need to create workspace_members table or adjust structure
  -- For now, we'll use domain_members for both
  SELECT 'dummy', alice_id, 'owner' WHERE FALSE; -- Placeholder

  -- Create Alice's private domain
  INSERT INTO public.domains (id, workspace_id, name, visibility)
  VALUES (gen_random_uuid(), alice_workspace_id, 'Alice Private', 'private')
  RETURNING id INTO alice_private_domain_id;

  -- Create Alice's shared domain
  INSERT INTO public.domains (id, workspace_id, name, visibility)
  VALUES (gen_random_uuid(), alice_workspace_id, 'Alice Shared', 'shared')
  RETURNING id INTO alice_shared_domain_id;

  -- Create Bob's private domain
  INSERT INTO public.domains (id, workspace_id, name, visibility)
  VALUES (gen_random_uuid(), bob_workspace_id, 'Bob Private', 'private')
  RETURNING id INTO bob_private_domain_id;

  -- Add Alice to her private domain
  INSERT INTO public.domain_members (domain_id, user_id, role)
  VALUES (alice_private_domain_id, alice_id, 'owner');

  -- Add Alice to her shared domain
  INSERT INTO public.domain_members (domain_id, user_id, role)
  VALUES (alice_shared_domain_id, alice_id, 'owner');

  -- Add Bob to his private domain
  INSERT INTO public.domain_members (domain_id, user_id, role)
  VALUES (bob_private_domain_id, bob_id, 'owner');

  -- Create a collection for Alice
  INSERT INTO public.collections (id, domain_id, name, kind)
  VALUES (gen_random_uuid(), alice_private_domain_id, 'Alice Project', 'project')
  RETURNING id INTO alice_collection_id;

  -- Create sample tasks for Alice's private domain
  INSERT INTO public.tasks (id, domain_id, collection_id, title, description, status, priority, created_at, updated_at)
  VALUES
    (gen_random_uuid(), alice_private_domain_id, alice_collection_id, 'Alice Task 1', 'Private task', 'backlog', 1, now(), now()),
    (gen_random_uuid(), alice_private_domain_id, alice_collection_id, 'Alice Task 2', 'Another task', 'in-progress', 2, now(), now()),
    (gen_random_uuid(), alice_private_domain_id, alice_collection_id, 'Alice Task 3', 'Completed', 'done', 3, now() - interval '1 day', now() - interval '1 day');

  -- Create sample tasks for Bob's private domain
  INSERT INTO public.tasks (id, domain_id, title, status, priority, created_at, updated_at)
  VALUES
    (gen_random_uuid(), bob_private_domain_id, 'Bob Task 1', 'backlog', 1, now(), now()),
    (gen_random_uuid(), bob_private_domain_id, 'Bob Task 2', 'in-progress', 2, now(), now());

  -- Log created IDs for reference
  RAISE NOTICE 'Test fixtures created:';
  RAISE NOTICE 'Alice ID: %', alice_id;
  RAISE NOTICE 'Bob ID: %', bob_id;
  RAISE NOTICE 'Alice Workspace: %', alice_workspace_id;
  RAISE NOTICE 'Bob Workspace: %', bob_workspace_id;
  RAISE NOTICE 'Alice Private Domain: %', alice_private_domain_id;
  RAISE NOTICE 'Alice Shared Domain: %', alice_shared_domain_id;
  RAISE NOTICE 'Bob Private Domain: %', bob_private_domain_id;

END $$;
