/**
 * frontend/src/lib/services/taskAPI.ts
 * API client for task operations via Supabase PostgREST
 *
 * Part of Phase 2 Sprint 3b: GREEN phase - Implementation
 * Provides CRUD operations for tasks with RLS enforcement
 */

import { supabase } from '$lib/supabaseClient';

export interface CreateTaskInput {
  title: string;
  domain_id: string;
  collection_id?: string | null;
  description?: string | null;
  status?: 'backlog' | 'in-progress' | 'blocked' | 'done';
  priority?: number | null;
  due_at?: string | null;
  recurrence_rrule?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: 'backlog' | 'in-progress' | 'blocked' | 'done';
  priority?: number | null;
  due_at?: string | null;
  completed_at?: string | null;
}

export const taskAPI = {
  /**
   * Create a new task
   * PostgREST automatically handles created_at and updated_at via database defaults
   * RLS enforces domain_id belongs to user's accessible domains
   */
  create: async (input: CreateTaskInput) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        domain_id: input.domain_id,
        collection_id: input.collection_id || null,
        description: input.description || null,
        status: input.status || 'backlog',
        priority: input.priority || null,
        due_at: input.due_at || null,
        recurrence_rrule: input.recurrence_rrule || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * List tasks for a domain with optional filtering and pagination
   * RLS prevents viewing tasks from inaccessible domains
   * PostgREST handles all filtering/sorting/pagination via query params
   */
  list: async (
    domainId: string,
    options?: {
      collectionId?: string;
      status?: string;
      sortBy?: string;
      ascending?: boolean;
      limit?: number;
      offset?: number;
    }
  ) => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('domain_id', domainId);

    if (options?.collectionId) {
      query = query.eq('collection_id', options.collectionId);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.ascending !== false,
      });
    } else {
      // Default sort by created_at descending
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Get a single task by ID
   * RLS enforces user can only access tasks in their domains
   */
  get: async (taskId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update a task
   * RLS enforces user can only update tasks in their domains
   * Database trigger updates updated_at automatically
   */
  update: async (taskId: string, input: UpdateTaskInput) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.due_at !== undefined && { due_at: input.due_at }),
        ...(input.completed_at !== undefined && { completed_at: input.completed_at }),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete a task
   * RLS enforces user can only delete tasks in their domains
   * Database cascades delete to subtasks and dependencies
   */
  delete: async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw new Error(error.message);
    return true;
  },

  /**
   * Create a task dependency
   * Circular dependency prevention is handled by database check constraint
   * RLS ensures both tasks are accessible to user
   */
  createDependency: async (taskId: string, dependsOnId: string) => {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        depends_on: dependsOnId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * List dependencies for a task
   * Returns all tasks that this task depends on
   */
  listDependencies: async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('depends_on')
      .eq('task_id', taskId);

    if (error) throw new Error(error.message);
    return data || [];
  },
};

export default taskAPI;
