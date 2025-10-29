/**
 * Timezone utility functions for Command Center
 *
 * Core principle: All times stored in UTC in database
 * This module handles conversion between UTC and user's local timezone for display/input
 *
 * Reference: /backend/docs/timezone-strategy.md
 */

/**
 * Convert a UTC Date to the user's local timezone
 * Returns a Date object representing the same moment adjusted for the timezone
 *
 * @param utcDate - UTC Date object from database
 * @param userTimezone - User's timezone (e.g., 'America/New_York')
 * @returns Date object adjusted to user's timezone
 *
 * @example
 * const utcDate = new Date('2025-04-15T14:30:00Z');
 * const localDate = convertUTCToUserTimezone(utcDate, 'America/New_York');
 * console.log(localDate.getHours()); // 10 (2:30 PM EDT = 10:30 AM)
 */
export function convertUTCToUserTimezone(utcDate: Date, userTimezone: string): Date {
  // Get the time string in user's timezone
  const userTimeString = utcDate.toLocaleString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Parse back to a Date object
  const userLocalDate = new Date(userTimeString);

  // Calculate the offset between the UTC date and the user's local representation
  const parts = utcDate.toLocaleString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).split(/[\D]/);

  const userDateObj = new Date(
    parseInt(parts[0]), // year
    parseInt(parts[1]) - 1, // month (0-indexed)
    parseInt(parts[2]), // day
    parseInt(parts[3]), // hour
    parseInt(parts[4]), // minute
    parseInt(parts[5]) // second
  );

  const offset = utcDate.getTime() - userDateObj.getTime();
  return new Date(utcDate.getTime() - offset);
}

/**
 * Get the hour and minute of a UTC date in the user's timezone
 * Useful for calendar grid positioning
 *
 * @param utcDate - UTC Date object
 * @param userTimezone - User's timezone
 * @returns Object with hour (0-23) and minute (0-59) in user's timezone
 *
 * @example
 * const utcDate = new Date('2025-04-15T14:30:00Z');
 * const time = getEventStartTimeInUserTimezone(utcDate, 'America/New_York');
 * // { hour: 10, minute: 30 }
 */
export function getEventStartTimeInUserTimezone(
  utcDate: Date,
  userTimezone: string
): { hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(utcDate);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');

  return { hour, minute };
}

/**
 * Format a UTC date as a time string in the user's timezone
 *
 * @param utcDate - UTC Date object
 * @param userTimezone - User's timezone
 * @param format - 'short' (e.g., '3:30 PM') or 'long' (e.g., '3:30 PM EDT')
 * @returns Formatted time string
 *
 * @example
 * const utcDate = new Date('2025-04-15T14:30:00Z');
 * formatEventTime(utcDate, 'America/New_York', 'short'); // '10:30 AM'
 * formatEventTime(utcDate, 'America/New_York', 'long');  // '10:30 AM EDT'
 */
export function formatEventTime(
  utcDate: Date,
  userTimezone: string,
  format: 'short' | 'long' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  if (format === 'long') {
    options.timeZoneName = 'short';
  }

  return new Intl.DateTimeFormat('en-US', options).format(utcDate);
}

/**
 * Format a UTC date as a full date string in the user's timezone
 *
 * @param utcDate - UTC Date object
 * @param userTimezone - User's timezone
 * @param format - 'short' (e.g., '4/15/2025'), 'long' (e.g., 'Tuesday, April 15, 2025')
 * @returns Formatted date string
 */
export function formatEventDate(
  utcDate: Date,
  userTimezone: string,
  format: 'short' | 'long' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  };

  if (format === 'long') {
    options.weekday = 'long';
    options.month = 'long';
  }

  return new Intl.DateTimeFormat('en-US', options).format(utcDate);
}

/**
 * Convert user's local time input to UTC for storage
 * Used when creating/editing events
 *
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param userTimezone - User's timezone
 * @returns UTC Date object for storage
 *
 * @example
 * const utcDate = convertUserTimezoneToUTC(2025, 4, 15, 14, 30, 'America/New_York');
 * // Returns UTC equivalent: 2025-04-15T18:30:00Z (EDT offset)
 */
export function convertUserTimezoneToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  userTimezone: string
): Date {
  // Create a date string in ISO format
  const isoString = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Try to create a date assuming it's UTC first
  const tentativeDate = new Date(isoString + 'Z');

  // Format this date in the user's timezone to see what we get
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(tentativeDate);
  const userYear = parseInt(parts.find(p => p.type === 'year')?.value ?? '0');
  const userMonth = parseInt(parts.find(p => p.type === 'month')?.value ?? '0');
  const userDay = parseInt(parts.find(p => p.type === 'day')?.value ?? '0');
  const userHour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0');
  const userMinute = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');
  const userSecond = parseInt(parts.find(p => p.type === 'second')?.value ?? '0');

  // Calculate the offset: what we expected - what we got
  const expectedDate = new Date(year, month - 1, day, hour, minute, 0);
  const actualDate = new Date(userYear, userMonth - 1, userDay, userHour, userMinute, userSecond);
  const offsetMs = expectedDate.getTime() - actualDate.getTime();

  // Apply the offset to get the UTC time
  return new Date(tentativeDate.getTime() + offsetMs);
}

/**
 * Get the current user's timezone
 * Falls back to UTC if browser timezone cannot be determined
 *
 * @returns IANA timezone string (e.g., 'America/New_York')
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    console.warn('Could not determine user timezone, defaulting to UTC');
    return 'UTC';
  }
}

/**
 * Check if a date is in daylight saving time for a given timezone
 *
 * @param date - Date to check (in UTC)
 * @param userTimezone - User's timezone
 * @returns true if the date is during DST in that timezone
 */
export function isDaylightSavingTime(date: Date, userTimezone: string): boolean {
  // Get the same date in winter (January)
  const january = new Date(date.getFullYear(), 0, 1);

  // Get UTC offsets
  const formatter = (d: Date) => {
    const utcDate = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(d.toLocaleString('en-US', { timeZone: userTimezone }));
    return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
  };

  const winterOffset = formatter(january);
  const currentOffset = formatter(date);

  return currentOffset !== winterOffset;
}

/**
 * Get all-day event dates in UTC
 * All-day events are stored as midnight UTC on their respective dates
 *
 * @param userYear - Year in user's timezone
 * @param userMonth - Month in user's timezone (1-12)
 * @param userDay - Day in user's timezone (1-31)
 * @param userTimezone - User's timezone
 * @returns { startAt: Date, endAt: Date } in UTC
 *
 * @example
 * const { startAt, endAt } = getAllDayEventDates(2025, 4, 15, 'America/New_York');
 * // startAt = 2025-04-15T04:00:00Z (midnight EDT = 4 AM UTC)
 * // endAt = 2025-04-16T04:00:00Z (start of next day)
 */
export function getAllDayEventDates(
  userYear: number,
  userMonth: number,
  userDay: number,
  userTimezone: string
): { startAt: Date; endAt: Date } {
  // For all-day events, we treat "midnight" in the user's timezone as the boundary
  const startAt = convertUserTimezoneToUTC(userYear, userMonth, userDay, 0, 0, userTimezone);
  const endAt = convertUserTimezoneToUTC(userYear, userMonth, userDay + 1, 0, 0, userTimezone);

  return { startAt, endAt };
}

/**
 * Parse an ISO 8601 UTC string from database
 *
 * @param isoString - ISO 8601 string (e.g., '2025-04-15T14:30:00Z')
 * @returns Date object
 */
export function parseUTCString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Format a Date as ISO 8601 UTC string for storage
 *
 * @param date - Date to format
 * @returns ISO 8601 UTC string (e.g., '2025-04-15T14:30:00Z')
 */
export function formatToUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate the duration between two UTC dates in user-friendly format
 *
 * @param startUtc - Start time in UTC
 * @param endUtc - End time in UTC
 * @param userTimezone - User's timezone
 * @returns Human-readable duration (e.g., '1h 30m', '2 days')
 */
export function formatDuration(
  startUtc: Date,
  endUtc: Date,
  userTimezone: string
): string {
  const diffMs = endUtc.getTime() - startUtc.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}
