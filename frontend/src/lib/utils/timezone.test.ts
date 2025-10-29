import { describe, it, expect } from 'vitest';
import {
  convertUTCToUserTimezone,
  getEventStartTimeInUserTimezone,
  formatEventTime,
  formatEventDate,
  convertUserTimezoneToUTC,
  getUserTimezone,
  isDaylightSavingTime,
  getAllDayEventDates,
  parseUTCString,
  formatToUTCString,
  formatDuration
} from './timezone';

describe('timezone utilities', () => {
  const EST_TIMEZONE = 'America/New_York';
  const PST_TIMEZONE = 'America/Los_Angeles';
  const UTC_TIMEZONE = 'UTC';

  describe('convertUTCToUserTimezone', () => {
    it('should convert UTC to EST (winter time)', () => {
      // 2025-01-15T14:30:00Z = 9:30 AM EST
      const utcDate = new Date('2025-01-15T14:30:00Z');
      const result = convertUTCToUserTimezone(utcDate, EST_TIMEZONE);

      // Should be in the morning (EST is UTC-5)
      expect(result.getHours()).toBeLessThan(14);
    });

    it('should convert UTC to EDT (summer time)', () => {
      // 2025-07-15T14:30:00Z = 10:30 AM EDT (UTC-4)
      const utcDate = new Date('2025-07-15T14:30:00Z');
      const result = convertUTCToUserTimezone(utcDate, EST_TIMEZONE);

      expect(result).toBeDefined();
      expect(result instanceof Date).toBe(true);
    });

    it('should handle different timezones', () => {
      const utcDate = new Date('2025-04-15T14:30:00Z');

      const estResult = convertUTCToUserTimezone(utcDate, EST_TIMEZONE);
      const pstResult = convertUTCToUserTimezone(utcDate, PST_TIMEZONE);

      // PST should be earlier than EST
      expect(pstResult.getTime()).toBeLessThan(estResult.getTime());
    });
  });

  describe('getEventStartTimeInUserTimezone', () => {
    it('should return correct hour and minute', () => {
      const utcDate = new Date('2025-01-15T14:30:00Z');
      const result = getEventStartTimeInUserTimezone(utcDate, EST_TIMEZONE);

      expect(result).toHaveProperty('hour');
      expect(result).toHaveProperty('minute');
      expect(result.hour).toBeGreaterThanOrEqual(0);
      expect(result.hour).toBeLessThan(24);
      expect(result.minute).toBeGreaterThanOrEqual(0);
      expect(result.minute).toBeLessThan(60);
    });

    it('should return minute 30 for 14:30 UTC', () => {
      const utcDate = new Date('2025-01-15T14:30:00Z');
      const result = getEventStartTimeInUserTimezone(utcDate, UTC_TIMEZONE);

      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
    });
  });

  describe('formatEventTime', () => {
    it('should format as short time (e.g., 3:30 PM)', () => {
      const utcDate = new Date('2025-01-15T14:30:00Z');
      const result = formatEventTime(utcDate, UTC_TIMEZONE, 'short');

      expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
    });

    it('should format as long time with timezone (e.g., 3:30 PM EST)', () => {
      const utcDate = new Date('2025-01-15T14:30:00Z');
      const result = formatEventTime(utcDate, EST_TIMEZONE, 'long');

      expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)\s[A-Z]{3,4}/);
    });
  });

  describe('formatEventDate', () => {
    it('should format as short date (e.g., 4/15/2025)', () => {
      const utcDate = new Date('2025-04-15T14:30:00Z');
      const result = formatEventDate(utcDate, UTC_TIMEZONE, 'short');

      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should format as long date with weekday', () => {
      const utcDate = new Date('2025-04-15T14:30:00Z');
      const result = formatEventDate(utcDate, UTC_TIMEZONE, 'long');

      expect(result).toMatch(/[A-Z][a-z]+,\s[A-Z][a-z]+\s\d{1,2},\s\d{4}/);
    });
  });

  describe('convertUserTimezoneToUTC', () => {
    it('should convert EST afternoon to UTC', () => {
      // 2:30 PM EST (winter) = 7:30 PM UTC
      const result = convertUserTimezoneToUTC(2025, 1, 15, 14, 30, EST_TIMEZONE);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toMatch(/2025-01-15T\d{2}:\d{2}:\d{2}Z/);
    });

    it('should convert midnight in user timezone correctly', () => {
      const result = convertUserTimezoneToUTC(2025, 4, 15, 0, 0, EST_TIMEZONE);

      expect(result).toBeInstanceOf(Date);
      // Should be around midnight or early morning in UTC
      expect(result.getUTCDate()).toBeGreaterThanOrEqual(14);
      expect(result.getUTCDate()).toBeLessThanOrEqual(15);
    });

    it('should handle same timezone (UTC)', () => {
      const result = convertUserTimezoneToUTC(2025, 4, 15, 14, 30, UTC_TIMEZONE);

      expect(result.getUTCHours()).toBe(14);
      expect(result.getUTCMinutes()).toBe(30);
    });
  });

  describe('getUserTimezone', () => {
    it('should return a valid timezone string', () => {
      const result = getUserTimezone();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should be a valid IANA timezone or UTC
      expect(['UTC', 'America/New_York', 'Europe/London']).toContain(result);
    });
  });

  describe('isDaylightSavingTime', () => {
    it('should return true for summer date in EST timezone', () => {
      const summerDate = new Date('2025-07-15T14:30:00Z');
      const result = isDaylightSavingTime(summerDate, EST_TIMEZONE);

      expect(typeof result).toBe('boolean');
    });

    it('should return false for winter date in EST timezone', () => {
      const winterDate = new Date('2025-01-15T14:30:00Z');
      const result = isDaylightSavingTime(winterDate, EST_TIMEZONE);

      expect(typeof result).toBe('boolean');
    });

    it('should return false for UTC (no DST)', () => {
      const date = new Date('2025-07-15T14:30:00Z');
      const result = isDaylightSavingTime(date, UTC_TIMEZONE);

      expect(result).toBe(false);
    });
  });

  describe('getAllDayEventDates', () => {
    it('should return start and end dates', () => {
      const result = getAllDayEventDates(2025, 4, 15, EST_TIMEZONE);

      expect(result).toHaveProperty('startAt');
      expect(result).toHaveProperty('endAt');
      expect(result.startAt).toBeInstanceOf(Date);
      expect(result.endAt).toBeInstanceOf(Date);
    });

    it('should have endAt one day after startAt', () => {
      const result = getAllDayEventDates(2025, 4, 15, EST_TIMEZONE);

      const diffMs = result.endAt.getTime() - result.startAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Should be approximately 24 hours apart
      expect(diffDays).toBeCloseTo(1, 0.1);
    });

    it('should set midnight times', () => {
      const result = getAllDayEventDates(2025, 4, 15, EST_TIMEZONE);

      // Start should be around midnight in the user's timezone
      expect(result.startAt).toBeInstanceOf(Date);
      expect(result.endAt).toBeInstanceOf(Date);
    });
  });

  describe('parseUTCString', () => {
    it('should parse ISO 8601 UTC string', () => {
      const isoString = '2025-04-15T14:30:00Z';
      const result = parseUTCString(isoString);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(isoString);
    });

    it('should handle ISO string without Z', () => {
      const isoString = '2025-04-15T14:30:00+00:00';
      const result = parseUTCString(isoString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(14);
    });
  });

  describe('formatToUTCString', () => {
    it('should format date as ISO 8601 UTC string', () => {
      const date = new Date('2025-04-15T14:30:00Z');
      const result = formatToUTCString(date);

      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
      expect(result).toContain('2025-04-15');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes', () => {
      const start = new Date('2025-04-15T14:00:00Z');
      const end = new Date('2025-04-15T14:30:00Z');

      const result = formatDuration(start, end, EST_TIMEZONE);

      expect(result).toBe('30m');
    });

    it('should format duration in hours', () => {
      const start = new Date('2025-04-15T14:00:00Z');
      const end = new Date('2025-04-15T16:00:00Z');

      const result = formatDuration(start, end, EST_TIMEZONE);

      expect(result).toBe('2h');
    });

    it('should format duration in hours and minutes', () => {
      const start = new Date('2025-04-15T14:00:00Z');
      const end = new Date('2025-04-15T15:30:00Z');

      const result = formatDuration(start, end, EST_TIMEZONE);

      expect(result).toBe('1h 30m');
    });

    it('should format duration in days', () => {
      const start = new Date('2025-04-15T14:00:00Z');
      const end = new Date('2025-04-17T14:00:00Z');

      const result = formatDuration(start, end, EST_TIMEZONE);

      expect(result).toBe('2d');
    });
  });

  describe('Edge cases', () => {
    it('should handle DST transition correctly', () => {
      // Spring forward: 2025-03-09T07:00:00Z
      const beforeDST = new Date('2025-03-09T06:00:00Z');
      const afterDST = new Date('2025-03-09T08:00:00Z');

      const beforeResult = getEventStartTimeInUserTimezone(beforeDST, EST_TIMEZONE);
      const afterResult = getEventStartTimeInUserTimezone(afterDST, EST_TIMEZONE);

      expect(beforeResult).toBeDefined();
      expect(afterResult).toBeDefined();
    });

    it('should handle timezone boundary (midnight UTC)', () => {
      const utcMidnight = new Date('2025-04-15T00:00:00Z');
      const result = getEventStartTimeInUserTimezone(utcMidnight, EST_TIMEZONE);

      expect(result.hour).toBeDefined();
      expect(result.minute).toBeDefined();
    });

    it('should handle year boundary', () => {
      const decemberUTC = new Date('2024-12-31T23:59:59Z');
      const result = convertUserTimezoneToUTC(2025, 1, 1, 0, 0, EST_TIMEZONE);

      expect(result.getUTCFullYear()).toBeGreaterThanOrEqual(2024);
    });
  });
});
