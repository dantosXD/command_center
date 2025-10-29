/**
 * Date utility functions
 * Formatting and comparison utilities for task dates
 */

/**
 * Format a date as relative time (e.g., "in 2 days", "3 days ago")
 */
export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7 && diffDays <= 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < -7 && diffDays >= -30) return `${Math.abs(Math.floor(diffDays / 7))} weeks ago`;

  // Fall back to date formatting
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if a date is overdue (in the past)
 */
export function isOverdue(dateString: string | null | undefined): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return compareDate < todayDate;
}

/**
 * Format a date as ISO string (for input[type="date"])
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse a date from ISO string
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past (excluding today)
 */
export function isPast(dateString: string | null | undefined): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return compareDate < todayDate;
}

/**
 * Check if a date is in the future (excluding today)
 */
export function isFuture(dateString: string | null | undefined): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return compareDate > todayDate;
}

/**
 * Get number of days until a date
 */
export function daysUntil(dateString: string | null | undefined): number {
  if (!dateString) return 0;

  const date = new Date(dateString);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = compareDate.getTime() - todayDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
