/**
 * Panel API Service
 * Handles all API calls for notifications, reminders, tasks, and real-time updates
 */

import type {
  Notification,
  Reminder,
  Task,
  PaginatedResponse,
  WebSocketEvent,
  PanelApiError,
  PanelState,
} from '../types/panel';
import { DEFAULT_PANEL_STATE } from '../types/panel';

// Re-export for convenience
export { DEFAULT_PANEL_STATE };

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:3000/ws';
const STORAGE_KEY = 'floating_panel_state';
const CACHE_KEY = 'floating_panel_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch notifications from backend API
 */
export async function fetchNotifications(
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<PaginatedResponse<Notification>> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      unreadOnly: String(unreadOnly),
    });

    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    cacheData('notifications', data);
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return cached data if available
    const cached = getCachedData('notifications');
    if (cached) {
      return cached;
    }
    // Return empty response with error
    throw {
      code: 'FETCH_ERROR',
      message: 'Failed to fetch notifications',
      details: { error },
    } as PanelApiError;
  }
}

/**
 * Fetch reminders from backend API
 */
export async function fetchReminders(
  limit: number = 50,
  offset: number = 0,
  sortBy: 'dueDate' | 'priority' | 'created' = 'dueDate'
): Promise<PaginatedResponse<Reminder>> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      sortBy,
    });

    const response = await fetch(`${API_BASE_URL}/reminders?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reminders: ${response.statusText}`);
    }

    const data = await response.json();
    cacheData('reminders', data);
    return data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    // Return cached data if available
    const cached = getCachedData('reminders');
    if (cached) {
      return cached;
    }
    throw {
      code: 'FETCH_ERROR',
      message: 'Failed to fetch reminders',
      details: { error },
    } as PanelApiError;
  }
}

/**
 * Fetch tasks from backend API
 */
export async function fetchTasks(
  limit: number = 50,
  offset: number = 0,
  status?: string,
  priority?: string
): Promise<PaginatedResponse<Task>> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await fetch(`${API_BASE_URL}/tasks?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();
    cacheData('tasks', data);
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Return cached data if available
    const cached = getCachedData('tasks');
    if (cached) {
      return cached;
    }
    throw {
      code: 'FETCH_ERROR',
      message: 'Failed to fetch tasks',
      details: { error },
    } as PanelApiError;
  }
}

/**
 * WebSocket connection manager for real-time updates
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const wsEvent: WebSocketEvent = JSON.parse(event.data);
            this.notifyListeners(wsEvent.type, wsEvent);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect().catch(console.error), delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(eventType: string, callback: (event: WebSocketEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private notifyListeners(eventType: string, event: WebSocketEvent): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();

/**
 * localStorage utilities for panel state persistence
 */
export function savePanelState(state: PanelState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving panel state:', error);
  }
}

export function loadPanelState(): PanelState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading panel state:', error);
  }
  return DEFAULT_PANEL_STATE;
}

export function clearPanelState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing panel state:', error);
  }
}

/**
 * Cache utilities for offline support
 */
function cacheData(key: string, data: unknown): void {
  try {
    const cache = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`${CACHE_KEY}:${key}`, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

function getCachedData(key: string): unknown | null {
  try {
    const cached = sessionStorage.getItem(`${CACHE_KEY}:${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error retrieving cached data:', error);
  }
  return null;
}

/**
 * Error handling utilities
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return 'An unknown error occurred';
}
