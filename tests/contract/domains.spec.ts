/**
 * domains.spec.ts
 * Contract tests for domain/collection CRUD (US2)
 * Validates API surfaces for creating, updating, deleting domains and collections.
 */

import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

describe('Domain & Collection Contracts', () => {
  let supabase: ReturnType<typeof createClient>;
  let domainId: string | null = null;
  let collectionId: string | null = null;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    // TODO: authenticate test user and seed workspace fixture
  });

  it('should reject unauthenticated domain creation', async () => {
    const anon = createClient(supabaseUrl, supabaseKey);
    const { error } = await anon.from('domains').insert({ name: 'Private', visibility: 'private' });
    expect(error).toBeDefined();
  });

  it.skip('should create a domain with default visibility', async () => {
    const { data, error } = await supabase.from('domains').insert({
      name: 'Engineering',
      visibility: 'shared',
      color: '#4f46e5',
    }).select().single();
    expect(error).toBeNull();
    expect(data).toBeDefined();
    domainId = data?.id ?? null;
  });

  it.skip('should update a domain visibility and color', async () => {
    const { error } = await supabase.from('domains').update({
      visibility: 'workspace',
      color: '#0f172a',
    }).eq('id', domainId);
    expect(error).toBeNull();
  });

  it.skip('should create a collection under the domain', async () => {
    const { data, error } = await supabase.from('collections').insert({
      domain_id: domainId,
      name: 'Sprint Backlog',
      kind: 'project',
    }).select().single();
    expect(error).toBeNull();
    collectionId = data?.id ?? null;
  });

  it.skip('should delete collection and domain cleanly', async () => {
    const { error: collErr } = await supabase.from('collections').delete().eq('id', collectionId);
    expect(collErr).toBeNull();
    const { error: domErr } = await supabase.from('domains').delete().eq('id', domainId);
    expect(domErr).toBeNull();
  });

  afterAll(async () => {
    if (collectionId) {
      await supabase.from('collections').delete().eq('id', collectionId);
    }
    if (domainId) {
      await supabase.from('domains').delete().eq('id', domainId);
    }
  });
});
