/**
 * Keyboard shortcuts registry
 * Central location for defining and managing keyboard shortcuts
 *
 * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
 */

export interface Shortcut {
  key: string;
  cmd?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  label: string;
}

/**
 * Registry of all keyboard shortcuts
 */
export const SHORTCUTS = {
  CREATE_TASK: {
    key: 'n',
    cmd: true,
    label: 'Create new task',
  } as Shortcut,

  EDIT_TASK: {
    key: 'e',
    cmd: true,
    label: 'Edit selected task',
  } as Shortcut,

  DELETE_TASK: {
    key: 'd',
    cmd: true,
    label: 'Delete selected task',
  } as Shortcut,

  FOCUS_SEARCH: {
    key: 'k',
    cmd: true,
    label: 'Open search',
  } as Shortcut,

  ESCAPE: {
    key: 'Escape',
    label: 'Cancel / Close dialog',
  } as Shortcut,

  SUBMIT: {
    key: 'Enter',
    cmd: true,
    label: 'Submit form',
  } as Shortcut,
};

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Check if main key matches
  if (eventKey !== shortcutKey) return false;

  // Check modifiers
  if (shortcut.cmd && !event.metaKey && !event.ctrlKey) return false;
  if (shortcut.ctrl && !event.ctrlKey) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  if (shortcut.alt && !event.altKey) return false;

  // Check that we don't have unexpected modifiers
  if (!shortcut.cmd && (event.metaKey || event.ctrlKey)) return false;
  if (!shortcut.shift && event.shiftKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  return true;
}

/**
 * Format a shortcut for display
 */
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = [];

  if (shortcut.cmd) {
    parts.push(typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Get all shortcuts for documentation/help
 */
export function getShortcutsList(): Array<{ key: string; shortcut: Shortcut }> {
  return Object.entries(SHORTCUTS).map(([key, shortcut]) => ({
    key,
    shortcut,
  }));
}

/**
 * Create a keyboard event listener for shortcuts
 */
export function createShortcutListener(
  callbacks: Partial<Record<keyof typeof SHORTCUTS, () => void>>,
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    for (const [key, shortcut] of Object.entries(SHORTCUTS)) {
      if (matchesShortcut(event, shortcut)) {
        const callback = callbacks[key as keyof typeof SHORTCUTS];
        if (callback) {
          event.preventDefault();
          callback();
          return;
        }
      }
    }
  };
}
