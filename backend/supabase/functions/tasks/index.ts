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

    // Task CRUD operations
    if (action === 'create') {
      const { domain_id, collection_id, title, description, status, priority, due_at } = payload;
      const { data, error } = await supabaseClient.from('tasks').insert({
        domain_id,
        collection_id,
        title,
        description,
        status: status || 'backlog',
        priority: priority || 3,
        due_at,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      const { task_id, updates } = payload;
      const { data, error } = await supabaseClient.from('tasks').update(updates).eq('id', task_id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      const { task_id } = payload;
      const { error } = await supabaseClient.from('tasks').delete().eq('id', task_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add dependency
    if (action === 'add_dependency') {
      const { task_id, depends_on } = payload;
      const { error } = await supabaseClient.from('task_dependencies').insert({
        task_id,
        depends_on,
      });
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
