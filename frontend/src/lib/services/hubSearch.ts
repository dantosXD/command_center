import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { domainStore } from '$lib/stores/domain';

export interface SavedView {
  id: string;
  name: string;
  query?: string;
  domain_id?: string | null;
  statuses?: string[] | null;
  priorities?: number[] | null;
  due_from?: string | null;
  due_to?: string | null;
  event_starts_from?: string | null;
  event_starts_to?: string | null;
  created_at: string;
  updated_at: string;
}

interface HubSearchState {
  query: string;
  domainId: string | null;
  statuses: string[] | null;
  priorities: number[] | null;
  dueFrom: string | null;
  dueTo: string | null;
  eventStartsFrom: string | null;
  eventStartsTo: string | null;
  results: any[];
  loading: boolean;
  error: string | null;
  savedViews: SavedView[];
}

function createHubSearchService() {
  const { subscribe, set, update } = writable<HubSearchState>({
    query: '',
    domainId: null,
    statuses: null,
    priorities: null,
    dueFrom: null,
    dueTo: null,
    eventStartsFrom: null,
    eventStartsTo: null,
    results: [],
    loading: false,
    error: null,
    savedViews: [],
  });

  // Load saved views for the user
  async function loadSavedViews() {
    // TODO: implement table for saved_views with user_id
    // For now, return empty
    update((s) => ({ ...s, savedViews: [] }));
  }

  // Execute search with current filters
  async function execute() {
    update((s) => ({ ...s, loading: true, error: null }));
    const {
      query,
      domainId,
      statuses,
      priorities,
      dueFrom,
      dueTo,
      eventStartsFrom,
      eventStartsTo,
    } = getState();
    const { data, error } = await supabase.rpc('hub_search', {
      p_query: query,
      p_domain_id: domainId,
      p_statuses: statuses,
      p_priorities: priorities,
      p_due_from: dueFrom,
      p_due_to: dueTo,
      p_event_starts_from: eventStartsFrom,
      p_event_starts_to: eventStartsTo,
      p_limit: 100,
    });
    if (error) {
      update((s) => ({ ...s, loading: false, error: error.message }));
    } else {
      update((s) => ({ ...s, loading: false, results: (data as any[]) || [] }));
    }
  }

  // Persist a new saved view
  async function saveView(name: string) {
    const state = getState();
    // TODO: insert into saved_views table via RPC
    // For now, just add to local array
    const newView: SavedView = {
      id: crypto.randomUUID(),
      name,
      query: state.query,
      domain_id: state.domainId,
      statuses: state.statuses,
      priorities: state.priorities,
      due_from: state.dueFrom,
      due_to: state.dueTo,
      event_starts_from: state.eventStartsFrom,
      event_starts_to: state.eventStartsTo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    update((s) => ({ ...s, savedViews: [...s.savedViews, newView] }));
  }

  // Apply a saved view
  function applyView(view: SavedView) {
    update((s) => ({
      ...s,
      query: view.query ?? '',
      domainId: view.domain_id ?? null,
      statuses: view.statuses,
      priorities: view.priorities,
      dueFrom: view.due_from,
      dueTo: view.due_to,
      eventStartsFrom: view.event_starts_from,
      eventStartsTo: view.event_starts_to,
    }));
    execute();
  }

  // Helper to read current snapshot
  function getState(): HubSearchState {
    let snap: HubSearchState | undefined;
    subscribe((s) => (snap = s))();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return snap!;
  }

  // Setters for individual filters
  function setQuery(q: string) {
    update((s) => ({ ...s, query: q }));
    if (q) execute(); else update((s) => ({ ...s, results: [] }));
  }

  function setDomainId(id: string | null) {
    update((s) => ({ ...s, domainId: id }));
    execute();
  }

  // Reset all filters
  function reset() {
    set({
      query: '',
      domainId: null,
      statuses: null,
      priorities: null,
      dueFrom: null,
      dueTo: null,
      eventStartsFrom: null,
      eventStartsTo: null,
      results: [],
      loading: false,
      error: null,
      savedViews: getState().savedViews,
    });
  }

  return {
    subscribe,
    loadSavedViews,
    execute,
    saveView,
    applyView,
    reset,
    setQuery,
    setDomainId,
    setDomainFromStore: () => {
      domainStore.subscribe((s) => setDomainId(s.selectedId));
    },
  };
}

export const hubSearch = createHubSearchService();
