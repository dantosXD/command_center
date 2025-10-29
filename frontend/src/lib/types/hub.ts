export interface HubItem {
  type: 'task' | 'event';
  id: string;
  title: string;
  description?: string | null;
  status?: 'backlog' | 'in-progress' | 'blocked' | 'done' | null;
  priority?: number | null;
  due_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  domain_id: string;
  domain_name: string;
  domain_color?: string | null;
  domain_visibility: 'private' | 'shared' | 'workspace';
  created_at: string;
  updated_at: string;
}

export interface QuickAddParsed {
  type: 'task' | 'event';
  title: string;
  description?: string | null;
  due_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  domain?: string | null; // domain name slug, resolved to ID before mutation
}

export type QuickAddInput = string;
