import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient';

export interface Domain {
  id: string;
  name: string;
  color?: string;
  visibility: 'private' | 'shared' | 'workspace';
  created_at: string;
  updated_at: string;
}

interface DomainState {
  domains: Domain[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

function createDomainStore() {
  const { subscribe, set, update } = writable<DomainState>({
    domains: [],
    selectedId: null,
    loading: false,
    error: null,
  });

  // Load domains for the authenticated user
  async function loadDomains() {
    update((s) => ({ ...s, loading: true, error: null }));
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      update((s) => ({ ...s, loading: false, error: 'Not authenticated' }));
      return;
    }

    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .in('id', (
        await supabase.from('domain_members').select('domain_id').eq('user_id', user.id)
      ).data?.map((m: any) => m.domain_id) || [])
      .order('created_at');

    if (error) {
      update((s) => ({ ...s, loading: false, error: error.message }));
      return;
    }

    const domains = (data as Domain[]) || [];

    // Restore persisted selected domain ID from localStorage
    let selectedId: string | null = null;
    if (browser && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('hub:selectedDomainId');
      if (stored && domains.some((d) => d.id === stored)) {
        selectedId = stored;
      }
    }
    // Fallback to first domain
    if (!selectedId && domains.length > 0) {
      selectedId = domains[0].id;
      if (browser && typeof localStorage !== 'undefined') {
        localStorage.setItem('hub:selectedDomainId', selectedId);
      }
    }

    set({ domains, selectedId, loading: false, error: null });
  }

  // Set the active domain and persist it
  function setSelectedId(id: string | null) {
    update((s) => {
      const next = { ...s, selectedId: id };
      if (browser && typeof localStorage !== 'undefined') {
        if (id) {
          localStorage.setItem('hub:selectedDomainId', id);
        } else {
          localStorage.removeItem('hub:selectedDomainId');
        }
      }
      return next;
    });
  }

  // Helper derived store for current domain object
  const selected = derived<DomainState, Domain | null>(
    subscribe,
    ($state) => $state.domains.find((d) => d.id === $state.selectedId) || null,
  );

  // Expose methods and derived stores
  return {
    subscribe,
    loadDomains,
    setSelectedId,
    selected,
    reset: () => set({ domains: [], selectedId: null, loading: false, error: null }),
  };
}

export const domainStore = createDomainStore();
