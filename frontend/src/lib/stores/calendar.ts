/**
 * Calendar Store
 * Svelte store for managing calendar state with optimistic updates
 * Follows same pattern as Phase 2 tasks store
 *
 * @module frontend/src/lib/stores/calendar
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { calendarAPI, type Event, type CreateEventInput, type UpdateEventInput } from '$lib/services/calendarAPI';

/**
 * Calendar state structure
 */
export interface CalendarState {
  events: Event[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
}

/**
 * Create calendar store with optimistic updates
 */
export function createCalendarStore(): {
  subscribe: (fn: (state: CalendarState) => void) => () => void;
  loadEvents: (domainId: string, startDate: Date, endDate: Date) => Promise<void>;
  createEvent: (data: Partial<CreateEventInput>) => Promise<Event>;
  updateEvent: (id: string, data: Partial<UpdateEventInput>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  getEventsForDate: (date: Date) => Readable<Event[]>;
  getRecurringEvents: () => Readable<Event[]>;
} {
  // Main store
  const store = writable<CalendarState>({
    events: [],
    selectedDate: new Date(),
    loading: false,
    error: null,
  });

  /**
   * Load events for date range from API
   */
  const loadEvents = async (domainId: string, startDate: Date, endDate: Date) => {
    store.update((s) => ({ ...s, loading: true, error: null }));

    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const events = await calendarAPI.list(domainId, {
        startDate: startStr,
        endDate: endStr,
        expandRecurrence: true,
      });

      store.update((s) => ({
        ...s,
        events,
        loading: false,
      }));
    } catch (error) {
      store.update((s) => ({
        ...s,
        error: error instanceof Error ? error.message : 'Failed to load events',
        loading: false,
      }));
      throw error;
    }
  };

  /**
   * Create event with optimistic update
   */
  const createEvent = async (data: Partial<CreateEventInput>): Promise<Event> => {
    // Validate required fields
    if (!data.domain_id || !data.title || !data.start_at || !data.end_at) {
      throw new Error('Missing required fields: domain_id, title, start_at, end_at');
    }

    // Create optimistic event
    const optimisticEvent: Event = {
      id: `temp-${Date.now()}`,
      domain_id: data.domain_id,
      title: data.title,
      description: data.description,
      start_at: data.start_at,
      end_at: data.end_at,
      timezone: data.timezone || 'UTC',
      recurrence_rrule: data.recurrence_rrule,
      exdates: data.exdates,
      location: data.location,
      attendees: data.attendees,
      reminders: data.reminders || [15, 60],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to store immediately (optimistic)
    store.update((s) => ({
      ...s,
      events: [...s.events, optimisticEvent],
    }));

    try {
      // Sync with server
      const created = await calendarAPI.create(data as CreateEventInput);

      // Replace optimistic with real
      store.update((s) => ({
        ...s,
        events: s.events.map((e) => (e.id === optimisticEvent.id ? created : e)),
      }));

      return created;
    } catch (error) {
      // Rollback on error
      store.update((s) => ({
        ...s,
        events: s.events.filter((e) => e.id !== optimisticEvent.id),
        error: error instanceof Error ? error.message : 'Failed to create event',
      }));
      throw error;
    }
  };

  /**
   * Update event with optimistic update
   */
  const updateEvent = async (id: string, data: Partial<UpdateEventInput>): Promise<Event> => {
    const state = getCurrentState();
    const oldEvent = state.events.find((e) => e.id === id);

    if (!oldEvent) {
      throw new Error('Event not found');
    }

    // Update optimistically
    const optimisticEvent = { ...oldEvent, ...data, updated_at: new Date().toISOString() };
    store.update((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? optimisticEvent : e)),
    }));

    try {
      // Sync with server
      const updated = await calendarAPI.update(id, data);

      // Update with server response
      store.update((s) => ({
        ...s,
        events: s.events.map((e) => (e.id === id ? updated : e)),
      }));

      return updated;
    } catch (error) {
      // Rollback to original
      store.update((s) => ({
        ...s,
        events: s.events.map((e) => (e.id === id ? oldEvent : e)),
        error: error instanceof Error ? error.message : 'Failed to update event',
      }));
      throw error;
    }
  };

  /**
   * Delete event with optimistic update
   */
  const deleteEvent = async (id: string): Promise<void> => {
    const state = getCurrentState();
    const oldEvent = state.events.find((e) => e.id === id);

    if (!oldEvent) {
      throw new Error('Event not found');
    }

    // Remove optimistically
    store.update((s) => ({
      ...s,
      events: s.events.filter((e) => e.id !== id),
    }));

    try {
      // Sync with server
      await calendarAPI.delete(id);
    } catch (error) {
      // Rollback
      store.update((s) => ({
        ...s,
        events: [...s.events, oldEvent],
        error: error instanceof Error ? error.message : 'Failed to delete event',
      }));
      throw error;
    }
  };

  /**
   * Set selected date
   */
  const setSelectedDate = (date: Date) => {
    store.update((s) => ({
      ...s,
      selectedDate: date,
    }));
  };

  /**
   * Get events for specific date (derived store)
   */
  const getEventsForDate = (date: Date): Readable<Event[]> => {
    return derived(store, ($store) => {
      const dateStr = date.toISOString().split('T')[0];
      return $store.events.filter((e) => {
        const eventDate = new Date(e.start_at).toISOString().split('T')[0];
        return eventDate === dateStr;
      });
    });
  };

  /**
   * Get recurring events (derived store)
   */
  const getRecurringEvents = (): Readable<Event[]> => {
    return derived(store, ($store) => {
      return $store.events.filter((e) => e.recurrence_rrule);
    });
  };

  /**
   * Helper: Get current state
   */
  let currentState: CalendarState;
  store.subscribe((s) => {
    currentState = s;
  });
  const getCurrentState = () => currentState;

  return {
    subscribe: store.subscribe,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setSelectedDate,
    getEventsForDate,
    getRecurringEvents,
  };
}
