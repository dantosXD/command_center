/**
 * frontend/src/lib/stores/auth.ts
 * Authentication store for managing user session state
 *
 * Provides reactive auth state with Supabase GoTrue integration
 */

import { writable, derived, type Readable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Create the auth store with session management
 */
function createAuthStore() {
  const store = writable<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  return {
    subscribe: store.subscribe,

    /**
     * Initialize auth state from Supabase session
     * Should be called on app startup
     */
    initialize: async () => {
      try {
        store.update((s) => ({ ...s, loading: true, error: null }));

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        store.set({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null,
        });

        // Set up auth state listener
        supabase.auth.onAuthStateChange((_event, session) => {
          store.update((s) => ({
            ...s,
            user: session?.user ?? null,
            session: session,
          }));
        });
      } catch (err: any) {
        store.update((s) => ({
          ...s,
          loading: false,
          error: err.message || 'Failed to initialize auth',
        }));
      }
    },

    /**
     * Sign in with email and password
     */
    signIn: async (email: string, password: string) => {
      store.update((s) => ({ ...s, loading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        store.update((s) => ({
          ...s,
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
        }));

        return data;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to sign in';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Sign up with email and password
     */
    signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
      store.update((s) => ({ ...s, loading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });

        if (error) {
          throw error;
        }

        store.update((s) => ({
          ...s,
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
        }));

        return data;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to sign up';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Sign out the current user
     */
    signOut: async () => {
      store.update((s) => ({ ...s, loading: true, error: null }));

      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        store.set({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to sign out';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Reset password via email
     */
    resetPassword: async (email: string) => {
      store.update((s) => ({ ...s, loading: true, error: null }));

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          throw error;
        }

        store.update((s) => ({ ...s, loading: false, error: null }));
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to send reset email';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Update user password
     */
    updatePassword: async (newPassword: string) => {
      store.update((s) => ({ ...s, loading: true, error: null }));

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw error;
        }

        store.update((s) => ({ ...s, loading: false, error: null }));
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update password';
        store.update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Clear any error state
     */
    clearError: () => {
      store.update((s) => ({ ...s, error: null }));
    },
  };
}

export const authStore = createAuthStore();

/**
 * Derived store: Is user authenticated?
 */
export const isAuthenticated: Readable<boolean> = derived(
  authStore,
  ($auth) => $auth.user !== null && $auth.session !== null
);

/**
 * Derived store: Current user
 */
export const currentUser: Readable<User | null> = derived(
  authStore,
  ($auth) => $auth.user
);
