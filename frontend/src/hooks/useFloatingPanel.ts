/**
 * useFloatingPanel Hook
 * Manages floating panel state: active tab, visibility, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import type { Notification, Reminder, Task, PaginatedResponse } from '../types/panel';
import {
  fetchNotifications,
  fetchReminders,
  fetchTasks,
  wsManager,
  getErrorMessage,
} from '../services/panelApi';

export interface FloatingPanelState {
  activeTab: 'notifications' | 'reminders' | 'tasks';
  notifications: Notification[];
  reminders: Reminder[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  notificationsTotal: number;
  remindersTotal: number;
  tasksTotal: number;
}

export function useFloatingPanel() {
  const [state, setState] = useState<FloatingPanelState>({
    activeTab: 'notifications',
    notifications: [],
    reminders: [],
    tasks: [],
    loading: false,
    error: null,
    notificationsTotal: 0,
    remindersTotal: 0,
    tasksTotal: 0,
  });

  /**
   * Set active tab
   */
  const setActiveTab = useCallback(
    (tab: 'notifications' | 'reminders' | 'tasks') => {
      setState((prev) => ({ ...prev, activeTab: tab }));
    },
    []
  );

  /**
   * Fetch notifications
   */
  const loadNotifications = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetchNotifications(50, 0, false);
      setState((prev) => ({
        ...prev,
        notifications: response.data,
        notificationsTotal: response.total,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(error),
        loading: false,
      }));
    }
  }, []);

  /**
   * Fetch reminders
   */
  const loadReminders = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetchReminders(50, 0, 'dueDate');
      setState((prev) => ({
        ...prev,
        reminders: response.data,
        remindersTotal: response.total,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(error),
        loading: false,
      }));
    }
  }, []);

  /**
   * Fetch tasks
   */
  const loadTasks = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetchTasks(50, 0);
      setState((prev) => ({
        ...prev,
        tasks: response.data,
        tasksTotal: response.total,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(error),
        loading: false,
      }));
    }
  }, []);

  /**
   * Initialize WebSocket and load initial data
   */
  useEffect(() => {
    // Load initial data
    loadNotifications();
    loadReminders();
    loadTasks();

    // Connect WebSocket
    wsManager.connect().catch((error) => {
      console.error('Failed to connect WebSocket:', error);
    });

    // Subscribe to real-time updates
    const unsubscribeNotification = wsManager.subscribe(
      'notification:created',
      () => {
        loadNotifications();
      }
    );

    const unsubscribeReminder = wsManager.subscribe('reminder:updated', () => {
      loadReminders();
    });

    const unsubscribeTask = wsManager.subscribe('task:updated', () => {
      loadTasks();
    });

    // Cleanup
    return () => {
      unsubscribeNotification();
      unsubscribeReminder();
      unsubscribeTask();
      wsManager.disconnect();
    };
  }, [loadNotifications, loadReminders, loadTasks]);

  /**
   * Refresh current tab data
   */
  const refresh = useCallback(async () => {
    switch (state.activeTab) {
      case 'notifications':
        await loadNotifications();
        break;
      case 'reminders':
        await loadReminders();
        break;
      case 'tasks':
        await loadTasks();
        break;
    }
  }, [state.activeTab, loadNotifications, loadReminders, loadTasks]);

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  /**
   * Mark reminder as completed
   */
  const markReminderCompleted = useCallback((reminderId: string) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === reminderId ? { ...r, completed: true } : r
      ),
    }));
  }, []);

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback(
    (taskId: string, status: 'open' | 'in-progress' | 'completed' | 'blocked') => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        ),
      }));
    },
    []
  );

  return {
    ...state,
    setActiveTab,
    loadNotifications,
    loadReminders,
    loadTasks,
    refresh,
    markNotificationAsRead,
    markReminderCompleted,
    updateTaskStatus,
  };
}
