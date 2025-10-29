import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for frontend application.
 * Configured with environment variables for local development and production.
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous (public) key
 *
 * Local development defaults to:
 * - URL: http://localhost:54321 (Supabase Docker container)
 * - Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Docker default)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YXJ0aW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzcwMDAwMDAsImV4cCI6MTk5OTk5OTk5OX0.bNq0X74JITDjEPWKu8TlGmvHG8l5NmiqK3xLNNnlJOY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

/**
 * Supabase client instance for making authenticated API calls.
 *
 * Features:
 * - Authentication with GoTrue
 * - Database queries via PostgREST
 * - Realtime subscriptions
 * - Storage bucket operations
 * - Edge Functions invocation
 *
 * Usage:
 * ```typescript
 * // Fetch data
 * const { data, error } = await supabase.from('tasks').select('*');
 *
 * // Realtime subscription
 * supabase.channel('tasks').on('postgres_changes', { event: '*', table: 'tasks' }, callback).subscribe();
 *
 * // Invoke Edge Function
 * const { data, error } = await supabase.functions.invoke('hub-feed', { body: { p_domain_id: '123' } });
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseClient = typeof supabase;
