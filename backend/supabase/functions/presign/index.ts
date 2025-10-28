import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
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

    const { taskId, filename, contentType } = await req.json();
    if (!taskId || !filename || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate MIME type via function helper
    const { data: allowed, error: mimeError } = await supabaseClient.rpc('is_allowed_mime_type', {
      p_bucket_id: 'attachments',
      p_content_type: contentType,
    });
    if (mimeError || !allowed) {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enforce task access via domain membership
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('domain_members')
      .select('role')
      .eq('user_id', user.id)
      .in(
        'domain_id',
        (
          await supabaseClient.from('tasks').select('domain_id').eq('id', taskId).single()
        ).data?.domain_id
      )
      .in('role', ['owner', 'admin', 'member']);
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate file key
    const { data: fileKey, error: keyError } = await supabaseClient.rpc('generate_attachment_file_key', {
      p_task_id: taskId,
      p_filename: filename,
    });
    if (keyError || !fileKey) {
      return new Response(JSON.stringify({ error: 'Failed to generate file key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate presigned URL via Supabase Storage client
    const { data: uploadUrl, error: urlError } = await supabaseClient.storage
      .from('attachments')
      .createSignedUploadUrl(fileKey, 60 * 5); // 5 minute expiry

    if (urlError) {
      return new Response(JSON.stringify({ error: urlError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create placeholder attachment record
    const { error: insertError } = await supabaseClient.from('attachments').insert({
      task_id: taskId,
      file_key: fileKey,
      filename,
      content_type: contentType,
      size_bytes: null, // to be updated after upload
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to register attachment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ uploadUrl, fileKey }), {
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
