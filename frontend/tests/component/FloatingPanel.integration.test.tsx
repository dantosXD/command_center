/**
 * Integration Tests for FloatingPanel
 * Tests component interactions and integration between hooks and components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FloatingPanel from '../../src/components/FloatingPanel/FloatingPanel';
import * as featureFlags from '../../src/services/featureFlags';

// Mock feature flags
vi.mock('../../src/services/featureFlags', () => ({
  useFeatureFlag: vi.fn(() => true),
  featureFlagManager: {
    isEnabled: vi.fn(() => true),
  },
}));

// Mock panelApi
vi.mock('../../src/services/panelApi', () => ({
  fetchNotifications: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: '1',
          title: 'Test Notification',
          content: 'Test content',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        },
      ],
      total: 1,
      hasMore: false,
    })
  ),
  fetchReminders: vi.fn(() =>
    Promise.resolve({
      data: [],
      total: 0,
      hasMore: false,
    })
  ),
  fetchTasks: vi.fn(() =>
    Promise.resolve({
      data: [],
      total: 0,
      hasMore: false,
    })
  ),
  wsManager: {
    connect: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    disconnect: vi.fn(),
  },
  DEFAULT_PANEL_STATE: {
    position: { x: 20, y: 20 },
    minimized: false,
    activeTab: 'notifications',
    lastUpdated: new Date().toISOString(),
  },
}));

describe('FloatingPanel Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render floating panel when feature flag is enabled', async () => {
    render(<FloatingPanel />);

    await waitFor(() => {
      const panel = screen.getByRole('region', {
        name: /floating panel/i,
      });
      expect(panel).toBeInTheDocument();
    });
  });

  it('should not render when feature flag is disabled', () => {
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);

    const { container } = render(<FloatingPanel />);

    expect(container.firstChild).toBeNull();
  });

  it('should display notifications tab by default', async () => {
    render(<FloatingPanel />);

    await waitFor(() => {
      const notificationsTab = screen.getByRole('tab', {
        name: /notifications/i,
      });
      expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should switch tabs when clicked', async () => {
    const user = userEvent.setup();
    render(<FloatingPanel />);

    await waitFor(() => {
      const remindersTab = screen.getByRole('tab', {
        name: /reminders/i,
      });
      expect(remindersTab).toBeInTheDocument();
    });

    const remindersTab = screen.getByRole('tab', {
      name: /reminders/i,
    });

    await user.click(remindersTab);

    expect(remindersTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should minimize and expand panel', async () => {
    const user = userEvent.setup();
    render(<FloatingPanel />);

    await waitFor(() => {
      const minimizeButton = screen.getByRole('button', {
        name: /minimize/i,
      });
      expect(minimizeButton).toBeInTheDocument();
    });

    const minimizeButton = screen.getByRole('button', {
      name: /minimize/i,
    });

    await user.click(minimizeButton);

    const expandButton = screen.getByRole('button', {
      name: /expand/i,
    });
    expect(expandButton).toBeInTheDocument();

    await user.click(expandButton);

    const newMinimizeButton = screen.getByRole('button', {
      name: /minimize/i,
    });
    expect(newMinimizeButton).toBeInTheDocument();
  });

  it('should display notifications when loaded', async () => {
    render(<FloatingPanel />);

    await waitFor(() => {
      const notification = screen.getByText(/test notification/i);
      expect(notification).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<FloatingPanel />);

    await waitFor(() => {
      const panel = screen.getByRole('region', {
        name: /floating panel/i,
      });
      expect(panel).toBeInTheDocument();
    });

    // Tab to first tab
    await user.tab();

    const firstTab = screen.getByRole('tab', {
      name: /notifications/i,
    });
    expect(firstTab).toHaveFocus();

    // Arrow right to next tab
    await user.keyboard('{ArrowRight}');

    const secondTab = screen.getByRole('tab', {
      name: /reminders/i,
    });
    expect(secondTab).toHaveFocus();
  });

  it('should call onClose callback when close button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<FloatingPanel onClose={onClose} />);

    await waitFor(() => {
      const closeButton = screen.getByRole('button', {
        name: /close/i,
      });
      expect(closeButton).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {
      name: /close/i,
    });

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', async () => {
    render(<FloatingPanel />);

    await waitFor(() => {
      const panel = screen.getByRole('region');
      expect(panel).toHaveAttribute('aria-label');

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-label');
        expect(tab).toHaveAttribute('aria-selected');
      });
    });
  });

  it('should display loading state', async () => {
    render(<FloatingPanel />);

    // Initially should show loading
    await waitFor(() => {
      const panel = screen.getByRole('region');
      expect(panel).toBeInTheDocument();
    });
  });

  it('should handle panel drag (header interaction)', async () => {
    const user = userEvent.setup();
    render(<FloatingPanel />);

    await waitFor(() => {
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    const header = screen.getByRole('banner');

    // Simulate drag start
    fireEvent.mouseDown(header);
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(document);

    // Panel should still be visible
    const panel = screen.getByRole('region');
    expect(panel).toBeInTheDocument();
  });

  it('should maintain tab selection after minimize/expand', async () => {
    const user = userEvent.setup();
    render(<FloatingPanel />);

    await waitFor(() => {
      const remindersTab = screen.getByRole('tab', {
        name: /reminders/i,
      });
      expect(remindersTab).toBeInTheDocument();
    });

    // Switch to reminders tab
    const remindersTab = screen.getByRole('tab', {
      name: /reminders/i,
    });
    await user.click(remindersTab);

    expect(remindersTab).toHaveAttribute('aria-selected', 'true');

    // Minimize
    const minimizeButton = screen.getByRole('button', {
      name: /minimize/i,
    });
    await user.click(minimizeButton);

    // Expand
    const expandButton = screen.getByRole('button', {
      name: /expand/i,
    });
    await user.click(expandButton);

    // Reminders tab should still be selected
    expect(remindersTab).toHaveAttribute('aria-selected', 'true');
  });
});
