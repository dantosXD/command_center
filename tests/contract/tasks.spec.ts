/**
 * tests/contract/tasks.spec.ts
 * Contract tests for Task CRUD operations (T014-T016)
 * Validates PostgREST API endpoints and business rules
 *
 * These tests FAIL initially (RED phase). Implementation in Phase 2 Sprint 3b makes them PASS.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

describe('Task CRUD Contract Tests (T014-T016)', () => {
  let supabase: ReturnType<typeof createClient>;
  let workspaceId: string | null = null;
  let domainId: string | null = null;
  let collectionId: string | null = null;
  let taskId: string | null = null;

  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    // TODO: Authenticate user and create fixtures
  });

  describe('POST /tasks - Create Task', () => {
    it.fails('should create task with required fields (title, domain_id)', async () => {
      const { data, error } = await supabase.from('tasks').insert({
        title: 'Complete sprint planning',
        domain_id: domainId,
        collection_id: collectionId,
        status: 'backlog',
      }).select().single();

      expect(error).toBeNull();
      expect(data?.id).toBeDefined();
      expect(data?.title).toBe('Complete sprint planning');
      taskId = data?.id;
    });

    it.fails('should return 400 if title is missing', async () => {
      const { error } = await supabase.from('tasks').insert({
        domain_id: domainId,
        status: 'backlog',
      }).select().single();

      expect(error?.code).toBe('PGRST102'); // constraint violation
    });

    it.fails('should enforce RLS: user can only create in accessible domain', async () => {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error } = await anonClient.from('tasks').insert({
        title: 'Unauthorized task',
        domain_id: 'inaccessible-domain-id',
        status: 'backlog',
      }).select().single();

      expect(error?.code).toBe('PGRST100'); // RLS violation
    });

    it.fails('should set created_at and updated_at timestamps', async () => {
      const { data } = await supabase.from('tasks').insert({
        title: 'Task with timestamps',
        domain_id: domainId,
        status: 'backlog',
      }).select().single();

      expect(data?.created_at).toBeDefined();
      expect(data?.updated_at).toBeDefined();
      expect(new Date(data?.created_at as string).getTime()).toBeLessThanOrEqual(
        new Date(data?.updated_at as string).getTime()
      );
    });
  });

  describe('GET /tasks - List Tasks', () => {
    it.fails('should list tasks for accessible domains', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('domain_id', domainId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);
    });

    it.fails('should filter by domain_id', async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('domain_id', domainId);

      expect(data?.every((t) => t.domain_id === domainId)).toBe(true);
    });

    it.fails('should filter by collection_id', async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('collection_id', collectionId);

      expect(data?.every((t) => t.collection_id === collectionId)).toBe(true);
    });

    it.fails('should filter by status', async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'backlog');

      expect(data?.every((t) => t.status === 'backlog')).toBe(true);
    });

    it.fails('should sort by due_at ascending', async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('due_at', { ascending: true, nullsFirst: true });

      // Verify sorted order
      for (let i = 1; i < (data?.length || 0); i++) {
        const prev = new Date(data?.[i - 1].due_at).getTime();
        const curr = new Date(data?.[i].due_at).getTime();
        expect(prev).toBeLessThanOrEqual(curr);
      }
    });

    it.fails('should hide tasks from inaccessible domains (RLS)', async () => {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await anonClient
        .from('tasks')
        .select('*')
        .eq('domain_id', 'private-domain-user-cannot-access');

      expect(data?.length).toBe(0);
    });

    it.fails('should support pagination with limit/offset', async () => {
      const { data: page1 } = await supabase
        .from('tasks')
        .select('*')
        .range(0, 9);

      const { data: page2 } = await supabase
        .from('tasks')
        .select('*')
        .range(10, 19);

      expect(page1?.length).toBeLessThanOrEqual(10);
      expect(page2?.length).toBeLessThanOrEqual(10);
      // Verify no overlap
      const page1Ids = new Set(page1?.map((t) => t.id));
      const page2HasNoOverlap = !page2?.some((t) => page1Ids.has(t.id));
      expect(page2HasNoOverlap).toBe(true);
    });
  });

  describe('PATCH /tasks/:id - Update Task', () => {
    it.fails('should update task status', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'in-progress' })
        .eq('id', taskId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('in-progress');
    });

    it.fails('should update task priority and due_at', async () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('tasks')
        .update({ priority: 3, due_at: dueDate })
        .eq('id', taskId)
        .select()
        .single();

      expect(data?.priority).toBe(3);
      expect(data?.due_at).toBe(dueDate);
    });

    it.fails('should prevent update if user is not task owner/admin', async () => {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error } = await anonClient
        .from('tasks')
        .update({ status: 'done' })
        .eq('id', taskId)
        .select()
        .single();

      expect(error?.code).toBe('PGRST100'); // RLS violation
    });

    it.fails('should update updated_at on modification', async () => {
      const { data: before } = await supabase
        .from('tasks')
        .select('updated_at')
        .eq('id', taskId)
        .single();

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: after } = await supabase
        .from('tasks')
        .update({ description: 'Updated description' })
        .eq('id', taskId)
        .select()
        .single();

      const beforeTime = new Date(before?.updated_at as string).getTime();
      const afterTime = new Date(after?.updated_at as string).getTime();
      expect(afterTime).toBeGreaterThan(beforeTime);
    });
  });

  describe('DELETE /tasks/:id - Delete Task', () => {
    it.fails('should delete task if user is owner/admin', async () => {
      // Create a task to delete
      const { data: created } = await supabase
        .from('tasks')
        .insert({
          title: 'To be deleted',
          domain_id: domainId,
          status: 'backlog',
        })
        .select()
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', created?.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', created?.id);

      expect(deleted?.length).toBe(0);
    });

    it.fails('should prevent delete if user is not authorized (RLS)', async () => {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error } = await anonClient
        .from('tasks')
        .delete()
        .eq('id', taskId);

      expect(error?.code).toBe('PGRST100'); // RLS violation
    });
  });

  describe('Task Dependencies - Advanced', () => {
    it.fails('should create task dependency', async () => {
      const { data: task1 } = await supabase
        .from('tasks')
        .insert({ title: 'Task 1', domain_id: domainId, status: 'backlog' })
        .select()
        .single();

      const { data: task2 } = await supabase
        .from('tasks')
        .insert({ title: 'Task 2', domain_id: domainId, status: 'backlog' })
        .select()
        .single();

      const { error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: task2?.id,
          depends_on: task1?.id,
        });

      expect(error).toBeNull();
    });

    it.fails('should prevent circular dependencies', async () => {
      const { data: task1 } = await supabase
        .from('tasks')
        .insert({ title: 'Task A', domain_id: domainId, status: 'backlog' })
        .select()
        .single();

      const { data: task2 } = await supabase
        .from('tasks')
        .insert({ title: 'Task B', domain_id: domainId, status: 'backlog' })
        .select()
        .single();

      // Create first dependency
      await supabase.from('task_dependencies').insert({
        task_id: task2?.id,
        depends_on: task1?.id,
      });

      // Try to create circular dependency (should fail)
      const { error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: task1?.id,
          depends_on: task2?.id,
        });

      expect(error).toBeDefined();
    });
  });

  afterAll(async () => {
    // Cleanup if needed
  });
});
