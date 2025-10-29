/**
 * Calendar API Service
 * Handles all calendar CRUD operations via PostgREST
 * Enforces RLS automatically at database level
 *
 * @module frontend/src/lib/services/calendarAPI
 */

import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
    } else {
      throw new Error('Supabase environment variables not configured');
    }
  }
  return supabase;
}

/**
 * Event data structure
 */
export interface Event {
  id: string;
  domain_id: string;
  title: string;
  description?: string;
  start_at: string;  // ISO timestamp
  end_at: string;    // ISO timestamp
  timezone: string;  // e.g., "America/New_York"
  recurrence_rrule?: string;  // RFC 5545 RRULE
  exdates?: string[];  // Exception dates
  location?: string;
  attendees?: string[];  // Email addresses
  reminders?: number[];  // Minutes before
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  domain_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  timezone?: string;
  recurrence_rrule?: string;
  exdates?: string[];
  location?: string;
  attendees?: string[];
  reminders?: number[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  recurrence_rrule?: string;
  exdates?: string[];
  location?: string;
  attendees?: string[];
  reminders?: number[];
}

export interface ListEventsOptions {
  startDate: string;  // ISO date: YYYY-MM-DD
  endDate: string;    // ISO date: YYYY-MM-DD
  expandRecurrence?: boolean;
  collectionId?: string;
  limit?: number;
  offset?: number;
  sort?: 'start_at' | 'title';
}

/**
 * Calendar API client
 */
export const calendarAPI = {
  /**
   * Create a new event
   * @throws Error if validation fails or RLS blocks access
   */
  create: async (input: CreateEventInput): Promise<Event> => {
    // Validate required fields
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Event title is required');
    }
    if (!input.start_at || !input.end_at) {
      throw new Error('Event start_at and end_at are required');
    }

    // Validate date range
    const start = new Date(input.start_at);
    const end = new Date(input.end_at);
    if (start >= end) {
      throw new Error('Event start_at must be before end_at');
    }

    // Default timezone to UTC if not provided
    const timezone = input.timezone || 'UTC';

    const { data, error } = await getSupabase()
      .from('events')
      .insert([{
        domain_id: input.domain_id,
        title: input.title.trim(),
        description: input.description,
        start_at: input.start_at,
        end_at: input.end_at,
        timezone,
        recurrence_rrule: input.recurrence_rrule,
        exdates: input.exdates,
        location: input.location,
        attendees: input.attendees,
        reminders: input.reminders || [15, 60],
      }])
      .select('*')
      .single();

    if (error) {
      // RLS will return 403 if user is not in domain
      if (error.code === 'PGRST301') {
        throw new Error('Access denied: You are not a member of this domain');
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return data;
  },

  /**
   * List events in date range (with optional recurrence expansion)
   */
  list: async (domainId: string, options: ListEventsOptions): Promise<Event[]> => {
    let query = getSupabase()
      .from('events')
      .select('*');

    // Filter by domain
    query = query.eq('domain_id', domainId);

    // Filter by date range (using start_at)
    query = query.gte('start_at', `${options.startDate}T00:00:00Z`);
    query = query.lt('start_at', `${options.endDate}T23:59:59Z`);

    // Filter by collection if provided (future enhancement)
    if (options.collectionId) {
      query = query.eq('collection_id', options.collectionId);
    }

    // Sorting
    if (options.sort === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('start_at', { ascending: true });
    }

    // Pagination
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get single event by ID
   */
  get: async (eventId: string): Promise<Event> => {
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {  // Not found
        throw new Error('Event not found');
      }
      if (error.code === 'PGRST301') {  // RLS
        throw new Error('Access denied');
      }
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return data;
  },

  /**
   * Update event
   */
  update: async (eventId: string, input: UpdateEventInput): Promise<Event> => {
    // Validate date range if both provided
    if (input.start_at && input.end_at) {
      const start = new Date(input.start_at);
      const end = new Date(input.end_at);
      if (start >= end) {
        throw new Error('Event start_at must be before end_at');
      }
    }

    const { data, error } = await getSupabase()
      .from('events')
      .update({
        title: input.title,
        description: input.description,
        start_at: input.start_at,
        end_at: input.end_at,
        timezone: input.timezone,
        recurrence_rrule: input.recurrence_rrule,
        exdates: input.exdates,
        location: input.location,
        attendees: input.attendees,
        reminders: input.reminders,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Access denied');
      }
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete event (cascades to reminders)
   */
  delete: async (eventId: string): Promise<void> => {
    const { error } = await getSupabase()
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Event not found');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Access denied');
      }
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  },

  /**
   * Export event as ICS (RFC 5545 format)
   */
  exportICS: async (eventId: string): Promise<string> => {
    const event = await this.get(eventId);

    // Build minimal ICS format
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Command Center//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;TZID=${event.timezone}:${event.start_at}`,
      `DTEND;TZID=${event.timezone}:${event.end_at}`,
      `SUMMARY:${event.title}`,
    ];

    if (event.description) {
      lines.push(`DESCRIPTION:${event.description}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${event.location}`);
    }
    if (event.recurrence_rrule) {
      lines.push(`RRULE:${event.recurrence_rrule}`);
    }

    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  },

  /**
   * Import events from ICS content
   * (Parse and create multiple events - Phase 3.5 enhancement)
   */
  importICS: async (domainId: string, icsContent: string): Promise<Event[]> => {
    // TODO: Parse ICS format, handle RRULE, create events
    throw new Error('ICS import not yet implemented (Phase 3.5)');
  },

  /**
   * Get attendees for event
   */
  listAttendees: async (eventId: string): Promise<string[]> => {
    const event = await this.get(eventId);
    return event.attendees || [];
  },

  /**
   * Set reminders for event
   */
  setReminders: async (eventId: string, reminders: number[]): Promise<Event> => {
    return this.update(eventId, { reminders });
  },
};
