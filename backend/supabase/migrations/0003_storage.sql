-- 0003_storage.sql: Supabase storage buckets, policies, and attachment metadata schema

-- Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,                          -- not public; presigned only
  52428800,                       -- 50 MiB limit
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) on conflict (id) do nothing;

-- Row-Level Security for storage.objects
-- Users can upload/read/delete via RLS and presigned URLs only if they are domain members with appropriate role

create policy "Attachments are viewable by domain members"
on storage.objects for select
using (
  bucket_id = 'attachments' and exists (
    select 1 from public.attachments a
    join public.tasks t on t.id = a.task_id
    join public.domain_members dm on dm.domain_id = t.domain_id
    where a.file_key = storage.objects.name and dm.user_id = auth.uid()
  )
);

create policy "Attachments can be uploaded by task-authorized domain members"
on storage.objects for insert
with check (
  bucket_id = 'attachments' and exists (
    select 1 from public.attachments a
    join public.tasks t on t.id = a.task_id
    join public.domain_members dm on dm.domain_id = t.domain_id
    where a.file_key = storage.objects.name and dm.user_id = auth.uid() and dm.role in ('owner','admin','member')
  )
);

create policy "Attachments can be updated by task-authorized domain members"
on storage.objects for update
using (
  bucket_id = 'attachments' and exists (
    select 1 from public.attachments a
    join public.tasks t on t.id = a.task_id
    join public.domain_members dm on dm.domain_id = t.domain_id
    where a.file_key = storage.objects.name and dm.user_id = auth.uid() and dm.role in ('owner','admin','member')
  )
);

create policy "Attachments can be deleted by task-authorized domain members"
on storage.objects for delete
using (
  bucket_id = 'attachments' and exists (
    select 1 from public.attachments a
    join public.tasks t on t.id = a.task_id
    join public.domain_members dm on dm.domain_id = t.domain_id
    where a.file_key = storage.objects.name and dm.user_id = auth.uid() and dm.role in ('owner','admin','member')
  )
);

-- Helper function to generate a unique file key per task
create or replace function public.generate_attachment_file_key(p_task_id uuid, p_filename text)
returns text language sql as $$
  select format('%s/%s/%s', p_task_id, gen_random_uuid(), p_filename);
$$;

-- Helper to ensure only allowed MIME types per bucket
create or replace function public.is_allowed_mime_type(p_bucket_id text, p_content_type text)
returns boolean language sql stable as $$
  select p_content_type = any(
    array[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ) and p_bucket_id = 'attachments';
$$;
