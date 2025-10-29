import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    /**
     * Add a new toast notification
     * @param message The message to display
     * @param type The type of toast (success, error, info, warning)
     * @param duration How long to show the toast in milliseconds (0 = indefinite)
     * @returns The toast ID for manual removal if needed
     */
    add: (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, message, type, duration };

      update((toasts) => [...toasts, toast]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    /**
     * Remove a specific toast by ID
     */
    remove: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    /**
     * Clear all toasts
     */
    clear: () => {
      update(() => []);
    },
    /**
     * Add success toast
     */
    success: (message: string, duration = 3000) => {
      return createToastStore().add(message, 'success', duration);
    },
    /**
     * Add error toast
     */
    error: (message: string, duration = 5000) => {
      return createToastStore().add(message, 'error', duration);
    },
    /**
     * Add info toast
     */
    info: (message: string, duration = 3000) => {
      return createToastStore().add(message, 'info', duration);
    },
    /**
     * Add warning toast
     */
    warning: (message: string, duration = 4000) => {
      return createToastStore().add(message, 'warning', duration);
    }
  };
}

export const toastStore = createToastStore();
