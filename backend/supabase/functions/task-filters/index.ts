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

    const { action, payload } = await req.json();

    // Save a filter
    if (action === 'save') {
      const { name, domain_id, query_params } = payload;
      const { data, error } = await supabaseClient.from('saved_filters').insert({
        user_id: user.id,
        domain_id,
        name,
        query_params,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List saved filters for user
    if (action === 'list') {
      const { domain_id } = payload;
      const query = supabaseClient.from('saved_filters').select('*').eq('user_id', user.id);
      if (domain_id) query.eq('domain_id', domain_id);
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Share a filter
    if (action === 'share') {
      const { filter_id, share_with } = payload;
      const { error } = await supabaseClient.from('saved_filters').update({
        shared_with: share_with,
      }).eq('id', filter_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete a filter
    if (action === 'delete') {
      const { filter_id } = payload;
      const { error } = await supabaseClient.from('saved_filters').delete().eq('id', filter_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
