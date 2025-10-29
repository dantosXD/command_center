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

    const { domain_id, collection_id, group_by = 'status' } = await req.json();

    // Fetch tasks grouped by status or priority
    const { data: tasks, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('domain_id', domain_id)
      .eq('collection_id', collection_id || null)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group tasks by status or priority
    const grouped = (tasks || []).reduce((acc: any, task: any) => {
      const key = group_by === 'status' ? task.status : `P${task.priority}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});

    return new Response(JSON.stringify({ data: grouped }), {
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
