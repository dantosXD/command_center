import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Hub Search Edge Function
 * Provides full-text search across tasks and events with filtering
 *
 * Query Parameters:
 * - search_term: Full-text search query
 * - domain_id: Filter by domain (optional)
 * - status: Filter by task status (optional)
 * - priority: Filter by priority (optional)
 * - date_from: Filter by start date (optional)
 * - date_to: Filter by end date (optional)
 * - limit: Results per page (default: 50)
 * - offset: Pagination offset (default: 0)
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check feature flag
    const { data: enabled } = await supabaseClient.rpc('feature_flag_enabled', {
      flag_key: 'search-beta',
    });

    if (!enabled) {
      return new Response(JSON.stringify({ error: 'Search feature not enabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const {
      search_term,
      domain_id,
      status,
      priority,
      date_from,
      date_to,
      limit = 50,
      offset = 0,
    } = await req.json();

    // Validate search term
    if (!search_term || search_term.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'search_term is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build search query using hub_search view (with pg_trgm index)
    // The view should already have RLS applied via underlying tables
    let query = supabaseClient
      .from('hub_search')
      .select('*')
      .textSearch('search_vector', search_term, {
        type: 'websearch',
        config: 'english',
      })
      .order('relevance', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (domain_id) {
      query = query.eq('domain_id', domain_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority !== undefined && priority !== null) {
      query = query.eq('priority', priority);
    }

    if (date_from) {
      query = query.gte('sort_date', date_from);
    }

    if (date_to) {
      query = query.lte('sort_date', date_to);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Search query error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Search failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return results with pagination metadata
    return new Response(
      JSON.stringify({
        data: data || [],
        pagination: {
          total: count || data?.length || 0,
          limit,
          offset,
          has_more: (data?.length || 0) === limit,
        },
        query: {
          search_term,
          filters: {
            domain_id,
            status,
            priority,
            date_from,
            date_to,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Hub search error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
