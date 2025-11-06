/**
 * PanelHeader Component
 * Draggable header with minimize and close buttons
 */

import React, { useState } from 'react';
import { Bell, ChevronDown, ChevronUp, X, Settings } from 'lucide-react';
import { panelHeaderStyles, buttonStyles, combineStyles } from './styles';
import PreferencesModal from './PreferencesModal';

export interface PanelHeaderProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  minimized: boolean;
  onMinimizeToggle: () => void;
  onClose?: () => void;
  notificationCount?: number;
}

export default function PanelHeader({
  onMouseDown,
  minimized,
  onMinimizeToggle,
  onClose,
  notificationCount = 0,
}: PanelHeaderProps): JSX.Element {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  return (
    <div
      className={panelHeaderStyles.base}
      onMouseDown={onMouseDown}
      role="banner"
      aria-label="Panel header - drag to move"
    >
      {/* Bell Icon with Notification Count */}
      <div className={panelHeaderStyles.bellContainer}>
        <Bell className={panelHeaderStyles.bellIcon} />
        {notificationCount > 0 && (
          <span className={panelHeaderStyles.notificationCount}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </div>

      <h2 className={panelHeaderStyles.title}>Notifications</h2>

      <div className={panelHeaderStyles.controls}>
        {/* Minimize/Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimizeToggle();
          }}
          className={combineStyles(buttonStyles.base)}
          aria-label={minimized ? 'Expand panel' : 'Minimize panel'}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          {minimized ? (
            <ChevronUp className={buttonStyles.icon} />
          ) : (
            <ChevronDown className={buttonStyles.icon} />
          )}
        </button>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={combineStyles(buttonStyles.base)}
            aria-label="Close panel"
            title="Close"
          >
            <X className={buttonStyles.icon} />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPreferencesOpen(true);
          }}
          className={combineStyles(buttonStyles.base)}
          aria-label="Notification preferences"
          title="Preferences"
        >
          <Settings className={buttonStyles.icon} />
        </button>
      </div>
      
      {/* Preferences Modal */}
      <PreferencesModal 
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
