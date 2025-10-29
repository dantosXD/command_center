import type { QuickAddParsed } from '$lib/types/hub';

/**
 * Quick-add parser: converts natural language strings into task/event intent.
 * Supports:
 * - Explicit event keywords (meeting, call, appointment, sync) => event
 * - Time windows (today, tomorrow, Mon, Tue, 9am, 2pm) => parse to ISO
 * - Time ranges for events (9-10, 9:30-10:30, 9am-10am)
 * - Domain switch via @domain syntax
 */

const EVENT_KEYWORDS = [
  'meeting', 'call', 'appointment', 'sync', 'standup', 'review', 'demo',
  'interview', 'workshop', 'webinar', 'conference', 'session',
];

const TIME_PATTERNS = [
  /\b(\d{1,2})(:\d{2})?\s*(am|pm)\b/i,           // 9am, 9:30am
  /\b(\d{1,2})(:\d{2})?\b/,                      // 9, 9:30 (assume 24h)
];

const DATE_PATTERNS = [
  /\btoday\b/i,
  /\btomorrow\b/i,
  /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
];

function parseTime(token: string): Date | null {
  const now = new Date();
  const match = token.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  const [, hoursRaw, minutesRaw, period] = match;
  const hours = parseInt(hoursRaw, 10);
  const minutes = minutesRaw ? parseInt(minutesRaw, 10) : 0;
  let hour24 = hours;
  if (period && /pm/i.test(period) && hours !== 12) hour24 = hours + 12;
  if (period && /am/i.test(period) && hours === 12) hour24 = 0;
  if (!period && hours > 12) hour24 = hours; // assume 24h
  const date = new Date(now);
  date.setHours(hour24, minutes, 0, 0);
  // If time is earlier than now, assume tomorrow
  if (date <= now) date.setDate(date.getDate() + 1);
  return date;
}

function parseDate(token: string): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (/today/i.test(token)) return today;
  if (/tomorrow/i.test(token)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  const dayMatch = token.match(/^(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
  if (dayMatch) {
    const dayIndex = ['sun','mon','tue','wed','thu','fri','sat'].indexOf(dayMatch[1].slice(0,3).toLowerCase());
    if (dayIndex === -1) return null;
    const currentDay = today.getDay();
    let diff = dayIndex - currentDay;
    if (diff <= 0) diff += 7; // next occurrence
    const target = new Date(today);
    target.setDate(target.getDate() + diff);
    return target;
  }
  return null;
}

/**
 * Parse a quick-add string into structured intent.
 */
export function parseQuickAdd(input: string): QuickAddParsed {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'task', title: '' };
  }

  // Detect domain switch @domain
  const domainMatch = trimmed.match(/@(\w+)/);
  const domain = domainMatch ? domainMatch[1] : null;
  const cleanInput = trimmed.replace(/@\w+/, '').trim();

  // Detect event type by keyword
  const isEvent = EVENT_KEYWORDS.some((kw) => cleanInput.toLowerCase().includes(kw));

  // Extract time window tokens
  const tokens = cleanInput.split(/\s+/);
  const timeTokens = tokens.filter((tok) => TIME_PATTERNS.some((re) => re.test(tok)));
  const dateTokens = tokens.filter((tok) => DATE_PATTERNS.some((re) => re.test(tok)));

  // Determine base date
  let baseDate: Date | null = null;
  if (dateTokens.length) {
    baseDate = parseDate(dateTokens[0]);
  }
  if (!baseDate) {
    const today = new Date();
    baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  // Extract times
  const times = timeTokens.map(parseTime).filter(Boolean) as Date[];

  // Remove date/time tokens from title
  const titleTokens = tokens.filter(
    (tok) => !TIME_PATTERNS.some((re) => re.test(tok)) && !DATE_PATTERNS.some((re) => re.test(tok)),
  );
  const title = titleTokens.join(' ').trim();

  if (isEvent) {
    // Event: use times as start/end; if only one time, assume 1-hour duration
    let startsAt: string | null = null;
    let endsAt: string | null = null;
    if (times.length >= 2) {
      const [start, end] = times;
      startsAt = start.toISOString();
      endsAt = end.toISOString();
    } else if (times.length === 1) {
      const start = times[0];
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      startsAt = start.toISOString();
      endsAt = end.toISOString();
    }
    return {
      type: 'event',
      title,
      starts_at: startsAt,
      ends_at: endsAt,
      domain,
    };
  } else {
    // Task: use first time as due_at
    const dueAt = times.length ? times[0].toISOString() : baseDate!.toISOString();
    return {
      type: 'task',
      title,
      due_at: dueAt,
      domain,
    };
  }
}

/**
 * Resolve a domain name slug (from @) to a domain ID using the domainStore.
 */
export async function resolveDomain(_slug: string): Promise<string | null> {
  // TODO: import domainStore and find by name slug
  return null;
}
