/**
 * FloatingPanel Component
 * Main container for the floating panel with tabs and feature flag guard
 */

import React, { useMemo } from 'react';
import { useFeatureFlag } from '../../services/featureFlags';
import { useFloatingPanel } from '../../hooks/useFloatingPanel';
import { usePanelPosition } from '../../hooks/usePanelPosition';
import { usePanelStorage } from '../../hooks/usePanelStorage';
import { panelContainerStyles, combineStyles } from './styles';
import PanelHeader from './PanelHeader';
import TabBar from './TabBar';
import NotificationsTab from './NotificationsTab';
import RemindersTab from './RemindersTab';
import TasksTab from './TasksTab';

export interface FloatingPanelProps {
  onClose?: () => void;
}

/**
 * FloatingPanel Component
 * Displays notifications, reminders, and tasks in a draggable, minimizable panel
 */
export default function FloatingPanel({ onClose }: FloatingPanelProps): JSX.Element | null {
  // Check feature flag
  const isEnabled = useFeatureFlag('floating_panel_tabs');

  // Get panel state from hooks
  const panelData = useFloatingPanel();
  const { position, isDragging, handleMouseDown, setPosition } = usePanelPosition(
    { x: 20, y: 20 }
  );
  const { panelState, isLoaded, updatePosition, toggleMinimized, setActiveTab } =
    usePanelStorage();

  // Sync position with storage
  React.useEffect(() => {
    if (isLoaded && panelState.position) {
      setPosition(panelState.position);
    }
  }, [isLoaded, panelState.position, setPosition]);

  // Sync position changes to storage
  React.useEffect(() => {
    if (isLoaded) {
      updatePosition(position.x, position.y);
    }
  }, [position, isLoaded, updatePosition]);

  // Determine panel dimensions
  const panelDimensions = useMemo(() => {
    if (panelState.minimized) {
      return { width: 320, height: 56 }; // w-80 h-14
    }
    return { width: 384, height: 600 }; // w-96 h-[600px]
  }, [panelState.minimized]);

  // If feature flag is disabled, don't render
  if (!isEnabled || !isLoaded) {
    return null;
  }

  const panelClasses = combineStyles(
    panelContainerStyles.base,
    panelState.minimized ? panelContainerStyles.minimized : panelContainerStyles.expanded,
    isDragging ? 'opacity-75' : ''
  );

  return (
    <div
      className={panelClasses}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${panelDimensions.width}px`,
        height: `${panelDimensions.height}px`,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
      }}
      role="region"
      aria-label="Floating panel with notifications, reminders, and tasks"
    >
      {/* Panel Header */}
      <PanelHeader
        onMouseDown={handleMouseDown}
        minimized={panelState.minimized}
        onMinimizeToggle={toggleMinimized}
        onClose={onClose}
        notificationCount={panelData.notifications.filter(n => !n.read).length}
      />

      {/* Tab Bar and Content */}
      {!panelState.minimized && (
        <>
          <TabBar 
            activeTab={panelState.activeTab} 
            onTabChange={setActiveTab}
            notificationCount={panelData.notifications.filter(n => !n.read).length}
            reminderCount={panelData.reminders.filter(r => !r.completed).length}
            taskCount={panelData.tasks.filter(t => t.status !== 'completed').length}
          />

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {panelState.activeTab === 'notifications' && (
              <NotificationsTab
                notifications={panelData.notifications}
                loading={panelData.loading}
                error={panelData.error}
                onNotificationClick={panelData.markNotificationAsRead}
              />
            )}

            {panelState.activeTab === 'reminders' && (
              <RemindersTab
                reminders={panelData.reminders}
                loading={panelData.loading}
                error={panelData.error}
                onReminderComplete={panelData.markReminderCompleted}
              />
            )}

            {panelState.activeTab === 'tasks' && (
              <TasksTab
                tasks={panelData.tasks}
                loading={panelData.loading}
                error={panelData.error}
                onTaskStatusChange={panelData.updateTaskStatus}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
