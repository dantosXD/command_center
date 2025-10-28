import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

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

    // Feature flag guard (central-hub-mvp)
    const { data: enabled } = await supabaseClient.rpc('feature_flag_enabled', {
      flag_key: 'central-hub-mvp',
    });
    if (!enabled) {
      return new Response(JSON.stringify({ error: 'Feature disabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      p_query = '',
      p_domain_id = null,
      p_statuses = null,
      p_priorities = null,
      p_due_from = null,
      p_due_to = null,
      p_event_starts_from = null,
      p_event_starts_to = null,
      p_limit = 50,
      p_offset = 0,
    } = await req.json();

    // NOTE: The materialized view hub_search_mv can be queried directly,
    // but to keep RLS we use the already-defined SQL function search_tasks_and_events
    // which internally queries the materialized view.
    const { data, error } = await supabaseClient.rpc('search_tasks_and_events', {
      p_query,
      p_domain_id,
      p_statuses,
      p_priorities,
      p_due_from,
      p_due_to,
      p_event_starts_from,
      p_event_starts_to,
      p_limit,
      p_offset,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optional: add natural language parse hooks (quick-add intent)
    // For now, return raw results; the frontend quick-add parser handles intent

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
