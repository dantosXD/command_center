/**
 * frontend/src/routes/logout/+server.ts
 * Logout endpoint for clearing user session
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  // In a real implementation with server-side session:
  // const supabase = await locals.supabase;
  // await supabase.auth.signOut();

  // Clear any cookies if using server-side session management
  // For client-side auth, the auth store handles sign out

  throw redirect(303, '/login');
};

// Also support GET for simple logout links
export const GET: RequestHandler = async ({ locals }) => {
  throw redirect(303, '/login');
};
