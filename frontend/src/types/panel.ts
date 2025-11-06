/**
 * Floating Panel Types
 * Defines all TypeScript interfaces for the floating panel tabs feature
 */

/**
 * Notification entity - represents an alert or message
 */
export interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: string; // ISO 8601 datetime
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Reminder entity - represents a time-based reminder
 */
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO 8601 date
  dueTime?: string; // ISO 8601 time
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Task entity - represents a work item
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO 8601 date
  assignee?: string;
  tags?: string[];
}

/**
 * Panel state - stores user preferences for the floating panel
 * Stored in browser localStorage
 */
export interface PanelState {
  position: {
    x: number;
    y: number;
  };
  minimized: boolean;
  activeTab: 'notifications' | 'reminders' | 'tasks';
  lastUpdated: string; // ISO 8601 datetime
}

/**
 * Default panel state
 */
export const DEFAULT_PANEL_STATE: PanelState = {
  position: { x: 20, y: 20 },
  minimized: false,
  activeTab: 'notifications',
  lastUpdated: new Date().toISOString(),
};

/**
 * API response wrapper for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

/**
 * WebSocket event types for real-time updates
 */
export type WebSocketEventType =
  | 'notification:created'
  | 'notification:updated'
  | 'reminder:created'
  | 'reminder:updated'
  | 'task:created'
  | 'task:updated';

/**
 * WebSocket event payload
 */
export interface WebSocketEvent {
  type: WebSocketEventType;
  data: Notification | Reminder | Task;
}

/**
 * Panel API error response
 */
export interface PanelApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
