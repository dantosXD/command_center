import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { hubStore } from './hubStore';
import { domainStore } from './domain';

type RealtimeStatus = 'connected' | 'disconnected' | 'error';

interface RealtimeState {
  status: RealtimeStatus;
  error: string | null;
}

function createHubRealtimeStore() {
  const { subscribe, update } = writable<RealtimeState>({
    status: 'disconnected',
    error: null,
  });

  let channel: any = null;

  // Subscribe to task/event changes in the user's visible domains
  async function connect() {
    if (channel) {
      supabase.removeChannel(channel);
    }

    update((s) => ({ ...s, status: 'disconnected', error: null }));

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      update((s) => ({ ...s, status: 'error', error: 'Not authenticated' }));
      return;
    }

    // Build list of domain IDs the user is a member of
    const { data: memberships } = await supabase
      .from('domain_members')
      .select('domain_id')
      .eq('user_id', user.id);
    const domainIds = memberships?.map((m: any) => m.domain_id) || [];

    channel = supabase
      .channel('hub-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `domain_id=in.(${domainIds.join(',')})`,
        },
        () => {
          // Refresh hub aggregation; hubStore already debounced and handles loading
          hubStore.refresh();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `domain_id=in.(${domainIds.join(',')})`,
        },
        () => {
          hubStore.refresh();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          update((s) => ({ ...s, status: 'connected', error: null }));
        } else if (status === 'CHANNEL_ERROR') {
          update((s) => ({ ...s, status: 'error', error: 'Subscription error' }));
        }
      });
  }

  function disconnect() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
    update((s) => ({ ...s, status: 'disconnected', error: null }));
  }

  // Auto-reconnect on domain change
  domainStore.subscribe(() => {
    connect();
  });

  return {
    subscribe,
    connect,
    disconnect,
  };
}

export const hubRealtime = createHubRealtimeStore();
