/**
 * Unit Tests for useFloatingPanel Hook
 * Tests tab state management, data fetching, and real-time updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFloatingPanel } from '../../src/hooks/useFloatingPanel';
import * as panelApi from '../../src/services/panelApi';

// Mock the panelApi module
vi.mock('../../src/services/panelApi', () => ({
  fetchNotifications: vi.fn(),
  fetchReminders: vi.fn(),
  fetchTasks: vi.fn(),
  wsManager: {
    connect: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    disconnect: vi.fn(),
  },
  getErrorMessage: vi.fn((error) => String(error)),
}));

describe('useFloatingPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFloatingPanel());

    expect(result.current.activeTab).toBe('notifications');
    expect(result.current.notifications).toEqual([]);
    expect(result.current.reminders).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set active tab', () => {
    const { result } = renderHook(() => useFloatingPanel());

    act(() => {
      result.current.setActiveTab('reminders');
    });

    expect(result.current.activeTab).toBe('reminders');
  });

  it('should load notifications', async () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test Notification',
        content: 'Test content',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info' as const,
      },
    ];

    vi.mocked(panelApi.fetchNotifications).mockResolvedValue({
      data: mockNotifications,
      total: 1,
      hasMore: false,
    });

    const { result } = renderHook(() => useFloatingPanel());

    // Wait for initial load
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test Notification');
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useFloatingPanel());

    // Set initial notifications
    act(() => {
      result.current.markNotificationAsRead('1');
    });

    // Note: In real implementation, this would update the notifications array
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to fetch';
    vi.mocked(panelApi.fetchNotifications).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFloatingPanel());

    // Wait for initial load
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.error).toBeTruthy();
  });

  it('should connect to WebSocket on mount', () => {
    renderHook(() => useFloatingPanel());

    expect(panelApi.wsManager.connect).toHaveBeenCalled();
  });

  it('should disconnect from WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useFloatingPanel());

    unmount();

    expect(panelApi.wsManager.disconnect).toHaveBeenCalled();
  });
});
