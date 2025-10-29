/**
 * frontend/src/routes/auth/callback/+server.ts
 * OAuth callback handler for Supabase authentication
 *
 * Handles the OAuth redirect after successful authentication
 * Exchanges the code for a session and redirects to the app
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/hub';

  if (code) {
    // In a real implementation with Supabase Auth Helpers:
    // const supabase = await locals.supabase;
    // await supabase.auth.exchangeCodeForSession(code);

    // For now, redirect to the next page
    // The client-side auth store will handle session management
    throw redirect(303, next);
  }

  // If no code, redirect to login
  throw redirect(303, '/login');
};
