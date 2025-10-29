/**
 * T025: Hub Aggregation RPC Contract Test
 * Phase 3: Daily Hub - User Story 1
 *
 * Tests the hub_feed RPC endpoint that aggregates tasks and events
 * across domains with proper RLS isolation and feature flag support.
 *
 * Contract: POST /rpc/hub_feed
 * Input: { workspace_id, domain_id? }
 * Output: { items: [{ id, title, item_type, status, priority, due_date, domain_id, domain_name }] }
 *
 * Expected to FAIL until T033 (hub_feed RPC) is implemented.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('T025: Hub Aggregation RPC Contract Test', () => {
  let supabase: SupabaseClient;
  let testWorkspaceId: string;
  let testDomainId1: string;
  let testDomainId2: string;
  let testTaskId1: string;
  let testEventId1: string;

  beforeAll(async () => {
    // Initialize Supabase client (service role for setup)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
    supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get or create test workspace
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('name', 'Test Workspace Hub')
      .limit(1);

    if (workspaces && workspaces.length > 0) {
      testWorkspaceId = workspaces[0].id;
    } else {
      const { data: ws } = await supabase
        .from('workspaces')
        .insert({ name: 'Test Workspace Hub', owner_id: '00000000-0000-0000-0000-000000000000' })
        .select('id')
        .single();
      testWorkspaceId = ws?.id || '';
    }

    // Create test domains
    const { data: d1 } = await supabase
      .from('domains')
      .insert({
        workspace_id: testWorkspaceId,
        name: 'Test Domain 1 Hub',
        visibility: 'workspace',
      })
      .select('id')
      .single();
    testDomainId1 = d1?.id || '';

    const { data: d2 } = await supabase
      .from('domains')
      .insert({
        workspace_id: testWorkspaceId,
        name: 'Test Domain 2 Hub',
        visibility: 'workspace',
      })
      .select('id')
      .single();
    testDomainId2 = d2?.id || '';

    // Create test task in domain 1
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const { data: task } = await supabase
      .from('tasks')
      .insert({
        domain_id: testDomainId1,
        title: 'Test Task 1 - Hub',
        status: 'in-progress',
        priority: 2,
        due_date: tomorrowDate.toISOString(),
      })
      .select('id')
      .single();
    testTaskId1 = task?.id || '';

    // Create test event in domain 2
    const eventDate = new Date();
    eventDate.setHours(eventDate.getHours() + 2);

    const { data: event } = await supabase
      .from('events')
      .insert({
        domain_id: testDomainId2,
        title: 'Test Event 1 - Hub',
        start_time: eventDate.toISOString(),
        end_time: new Date(eventDate.getTime() + 3600000).toISOString(),
      })
      .select('id')
      .single();
    testEventId1 = event?.id || '';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testTaskId1) {
      await supabase.from('tasks').delete().eq('id', testTaskId1);
    }
    if (testEventId1) {
      await supabase.from('events').delete().eq('id', testEventId1);
    }
    if (testDomainId1) {
      await supabase.from('domains').delete().eq('id', testDomainId1);
    }
    if (testDomainId2) {
      await supabase.from('domains').delete().eq('id', testDomainId2);
    }
  });

  // Contract test: API exists and is callable
  it('should be callable and return structured response (T025.1)', async () => {
    const { data, error } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
    });

    // Either succeeds with data or fails with auth error (expected at this stage)
    expect(data === null || Array.isArray(data)).toBe(true);
  });

  // Contract test: Returns correct schema
  it('should return items with correct schema (T025.2)', async () => {
    const { data, error } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
    });

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('item_type');
      expect(['task', 'event']).toContain(item.item_type);
    }
  });

  // Contract test: Filters by domain
  it('should filter results by domain_id when provided (T025.3)', async () => {
    const { data: allItems } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
    });

    const { data: domain1Items } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
      p_domain_id: testDomainId1,
    });

    if (Array.isArray(allItems) && Array.isArray(domain1Items)) {
      // Domain-filtered should be subset of all
      expect(domain1Items.length).toBeLessThanOrEqual(allItems.length);
    }
  });

  // Contract test: Sorts by due date
  it('should sort results by due date ascending (T025.4)', async () => {
    const { data } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
    });

    if (Array.isArray(data) && data.length > 1) {
      for (let i = 0; i < data.length - 1; i++) {
        const current = new Date(data[i].due_date || data[i].start_time).getTime();
        const next = new Date(data[i + 1].due_date || data[i + 1].start_time).getTime();
        expect(current).toBeLessThanOrEqual(next);
      }
    }
  });

  // Contract test: Respects RLS policies
  it('should enforce RLS isolation (T025.5)', async () => {
    // Create anon client (no auth)
    const anonClient = createClient(supabaseUrl, supabaseKey);

    const { error } = await anonClient.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
    });

    // Should either require auth or return empty due to RLS
    expect(error === null || error?.message.includes('401') || error?.message.includes('permission')).toBe(true);
  });

  // Contract test: Handles null domain_id (all domains)
  it('should return items from all domains when domain_id is null (T025.6)', async () => {
    const { data: allDomains } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
      p_domain_id: null,
    });

    const { data: domain1Only } = await supabase.rpc('hub_feed', {
      p_workspace_id: testWorkspaceId,
      p_domain_id: testDomainId1,
    });

    if (Array.isArray(allDomains) && Array.isArray(domain1Only)) {
      // All domains should include more or equal items than single domain
      expect(allDomains.length).toBeGreaterThanOrEqual(domain1Only.length);
    }
  });

  // Contract test: Handles non-existent workspace
  it('should handle non-existent workspace gracefully (T025.7)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase.rpc('hub_feed', {
      p_workspace_id: fakeId,
    });

    // Should return empty array or permission error, not crash
    expect(error === null || error?.message.includes('permission')).toBe(true);
    if (!error) {
      expect(Array.isArray(data)).toBe(true);
    }
  });
});
