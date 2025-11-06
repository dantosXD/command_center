/**
 * frontend/src/lib/stores/tasks.ts
 * Task store for managing task state (CRUD, filtering, sorting)
 *
 * Part of Phase 2 Sprint 3b: GREEN phase - Implementation
 * Provides reactive task management with optimistic updates
 */

import { writable, derived } from 'svelte/store';
import { taskAPI } from '$lib/services/taskAPI';

export interface Task {
  id: string;
  domain_id: string;
  collection_id?: string | null;
  title: string;
  description?: string | null;
  status: 'backlog' | 'in-progress' | 'blocked' | 'done';
  priority?: number | null;
  due_at?: string | null;
  start_at?: string | null;
  completed_at?: string | null;
  recurrence_rrule?: string | null;
  parent_id?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter?: {
    status?: string;
    collection_id?: string;
    assignee?: string;
  };
}

export function createTaskStore() {
  const store = writable<TaskState>({
    tasks: [],
    loading: false,
    error: null,
  });

  return {
    subscribe: store.subscribe,

    /**
     * Load tasks from Supabase for a given domain
     * Updates loading state and handles errors
     */
    loadTasks: async (domainId: string) => {
      store.update((s) => ({ ...s, loading: true, error: null }));
      try {
        const tasks = await taskAPI.list(domainId);
        store.set({ tasks, loading: false, error: null });
        return tasks;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load tasks';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Create a new task
     * Optimistically adds to local store, then syncs with server
     * Rolls back on error
     */
    createTask: async (data: Partial<Task>) => {
      // Optimistic update: add task locally first
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        domain_id: data.domain_id || '',
        title: data.title || 'Untitled',
        status: data.status || 'backlog',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      };

      let previousState: TaskState | null = null;
      store.update((s) => {
        previousState = s;
        return { ...s, tasks: [...s.tasks, optimisticTask] };
      });

      try {
        // Send to server
        const created = await taskAPI.create(data as any);

        // Replace temp task with real one from server
        store.update((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === optimisticTask.id ? created : t)),
        }));

        return created;
      } catch (err: any) {
        // Rollback on error
        if (previousState) {
          store.set(previousState);
        }
        throw err;
      }
    },

    /**
     * Update an existing task
     * Optimistically updates local state, then syncs with server
     * Rolls back on error
     */
    updateTask: async (id: string, data: Partial<Task>) => {
      let previousState: TaskState | null = null;

      // Optimistic update
      store.update((s) => {
        previousState = s;
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        };
      });

      try {
        // Send to server
        const updated = await taskAPI.update(id, data as any);

        // Confirm with server response
        store.update((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
        }));

        return updated;
      } catch (err: any) {
        // Rollback on error
        if (previousState) {
          store.set(previousState);
        }
        throw err;
      }
    },

    /**
     * Delete a task
     * Optimistically removes from local state, then syncs with server
     * Rolls back on error
     */
    deleteTask: async (id: string) => {
      let previousState: TaskState | null = null;

      // Optimistic update
      store.update((s) => {
        previousState = s;
        return { ...s, tasks: s.tasks.filter((t) => t.id !== id) };
      });

      try {
        // Send to server
        await taskAPI.delete(id);
        // If successful, state is already updated
        return true;
      } catch (err: any) {
        // Rollback on error
        if (previousState) {
          store.set(previousState);
        }
        throw err;
      }
    },

    /**
     * Get tasks filtered by status
     * Returns derived store of filtered tasks
     */
    filterByStatus: (status: string) => {
      return derived(store, ($store) =>
        $store.tasks.filter((t) => t.status === status)
      );
    },

    /**
     * Get tasks sorted by due date
     * Returns tasks sorted ascending by due_at (nulls first)
     */
    sortByDueDate: () => {
      return derived(store, ($store) =>
        [...$store.tasks].sort((a, b) => {
          // Handle nulls
          if (!a.due_at && !b.due_at) return 0;
          if (!a.due_at) return -1;
          if (!b.due_at) return 1;

          // Compare dates
          const aTime = new Date(a.due_at).getTime();
          const bTime = new Date(b.due_at).getTime();
          return aTime - bTime;
        })
      );
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      store.set({
        tasks: [],
        loading: false,
        error: null,
      });
    },
  };
}

export const taskStore = createTaskStore();
