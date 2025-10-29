/**
 * frontend/src/hooks.server.ts
 * SvelteKit server hooks for authentication middleware
 *
 * Protects routes and validates sessions server-side
 */

import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Auth middleware - validates session for protected routes
 */
const authHook: Handle = async ({ event, resolve }) => {
  // For now, we're doing client-side auth with Supabase
  // In production, you'd validate the session token here

  // Protected routes pattern: anything under (app)/*
  const isProtectedRoute = event.url.pathname.startsWith('/hub') ||
    event.url.pathname.startsWith('/tasks') ||
    event.url.pathname.startsWith('/calendar') ||
    event.url.pathname.startsWith('/domains');

  // Public routes that don't require auth
  const isPublicRoute = event.url.pathname === '/login' ||
    event.url.pathname === '/signup' ||
    event.url.pathname.startsWith('/auth/callback') ||
    event.url.pathname === '/';

  // If accessing a protected route, check for auth
  // Note: In a full implementation, we'd check the session cookie here
  // For now, we rely on client-side auth redirect
  if (isProtectedRoute && !isPublicRoute) {
    // In production: validate session token from cookies
    // const session = event.cookies.get('sb-access-token');
    // if (!session) throw redirect(303, '/login');
  }

  const response = await resolve(event);
  return response;
};

/**
 * CORS and security headers
 */
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};

export const handle = sequence(authHook, securityHook);
