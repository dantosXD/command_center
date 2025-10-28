import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { domainStore } from './domain';
import type { HubItem, QuickAddParsed } from '$lib/types/hub';

interface HubState {
  items: HubItem[];
  domainId: string | null;
  filter: string | null;
  loading: boolean;
  error: string | null;
  searchOpen: boolean;
  quickAddOpen: boolean;
}

function createHubStore() {
  const { subscribe, set, update } = writable<HubState>({
    items: [],
    domainId: null,
    filter: null,
    loading: false,
    error: null,
    searchOpen: false,
    quickAddOpen: false,
  });

  async function refresh() {
    update((s) => ({ ...s, loading: true, error: null }));

    // Get current domain state
    const domainState = get(domainStore);
    const domainId = domainState.selectedId || undefined;

    try {
      // Call hub-feed Edge Function with domain filter
      const { data, error } = await supabase.functions.invoke('hub-feed', {
        body: { p_domain_id: domainId },
      });

      if (error) {
        throw error;
      }

      update((s) => ({ ...s, loading: false, items: (data as HubItem[]) || [] }));
    } catch (err: any) {
      update((s) => ({
        ...s,
        loading: false,
        error: err?.message || 'Failed to load hub feed',
      }));
    }
  }

  // Set active domain for hub aggregation
  function setDomain(id: string | null) {
    update((s) => ({ ...s, domainId: id }));
  }

  // Quick-add intent parsing handled by quick-add utility
  async function createQuickAdd(input: string) {
    // Parse via quickAdd utility
    // Then call tasks/events RPCs to insert
    // Finally, refresh hub
    // TODO: wire quickAddParser and mutation calls
  }

  // Open/close search panel
  function setSearchOpen(open: boolean) {
    update((s) => ({ ...s, searchOpen: open }));
  }

  function setQuickAddOpen(open: boolean) {
    update((s) => ({ ...s, quickAddOpen: open }));
  }

  // Realtime subscription to hub feed updates
  function subscribeRealtime() {
    const channel = supabase
      .channel('hub-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => refresh(),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }

  // Reset store
  function reset() {
    set({
      items: [],
      domainId: null,
      filter: null,
      loading: false,
      error: null,
      searchOpen: false,
      quickAddOpen: false,
    });
  }

  return {
    subscribe,
    refresh,
    setDomain,
    createQuickAdd,
    setSearchOpen,
    setQuickAddOpen,
    subscribeRealtime,
    reset,
  };
}

export const hubStore = createHubStore();

// Derived helpers
export const todayItems = derived<HubState, HubItem[]>(
  hubStore,
  ($state) =>
    $state.items.filter(
      (item) =>
        (item.type === 'task' && item.due_at && new Date(item.due_at).toDateString() === new Date().toDateString()) ||
        (item.type === 'event' && item.starts_at && new Date(item.starts_at).toDateString() === new Date().toDateString()),
    ),
);

export const upcomingItems = derived<HubState, HubItem[]>(
  hubStore,
  ($state) =>
    $state.items.filter(
      (item) =>
        (item.type === 'task' && item.due_at && new Date(item.due_at) > new Date()) ||
        (item.type === 'event' && item.starts_at && new Date(item.starts_at) > new Date()),
    ),
);
