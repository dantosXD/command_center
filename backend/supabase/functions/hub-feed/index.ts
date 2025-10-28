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

    // Feature flag guard
    const { data: enabled } = await supabaseClient.rpc('feature_flag_enabled', {
      flag_key: 'central-hub-mvp',
    });
    if (!enabled) {
      return new Response(JSON.stringify({ error: 'Feature disabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { p_domain_id, p_limit = 200, p_offset = 0 } = await req.json();

    // Build dynamic RLS-compliant query to the hub_aggregate view
    // We use .rpc to trigger RLS on underlying tables; the view will filter accordingly
    let query = supabaseClient
      .from('hub_aggregate')
      .select('*')
      .order('hub_sort_at', { ascending: true })
      .range(p_offset, p_offset + p_limit - 1);

    // Apply domain scope if requested (RLS ensures membership check anyway)
    if (p_domain_id) {
      query = query.eq('domain_id', p_domain_id);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Post-process: classify as Today/Upcoming via SQL function or client
    // Optionally add domain visibility filter here, but RLS already enforces

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
