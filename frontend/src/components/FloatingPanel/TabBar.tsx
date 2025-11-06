/**
 * TabBar Component
 * Navigation tabs for Notifications, Reminders, and Tasks
 */

import React from 'react';
import { Bell, Clock, CheckSquare } from 'lucide-react';
import { tabBarStyles, combineStyles } from './styles';

export interface TabBarProps {
  activeTab: 'notifications' | 'reminders' | 'tasks';
  onTabChange: (tab: 'notifications' | 'reminders' | 'tasks') => void;
  notificationCount?: number;
  reminderCount?: number;
  taskCount?: number;
}

interface Tab {
  id: 'notifications' | 'reminders' | 'tasks';
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const tabs: Tab[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-4 h-4" />,
    ariaLabel: 'Notifications tab',
  },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: <Clock className="w-4 h-4" />,
    ariaLabel: 'Reminders tab',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <CheckSquare className="w-4 h-4" />,
    ariaLabel: 'Tasks tab',
  },
];

export default function TabBar({ 
  activeTab, 
  onTabChange, 
  notificationCount = 0,
  reminderCount = 0,
  taskCount = 0
}: TabBarProps): JSX.Element {
  return (
    <div
      className={tabBarStyles.base}
      role="tablist"
      aria-label="Panel tabs"
    >
      {tabs.map((tab) => {
        const getCount = () => {
          switch (tab.id) {
            case 'notifications': return notificationCount;
            case 'reminders': return reminderCount;
            case 'tasks': return taskCount;
            default: return 0;
          }
        };
        
        const count = getCount();
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={combineStyles(
              tabBarStyles.tab,
              activeTab === tab.id ? tabBarStyles.tabActive : ''
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.ariaLabel}
            title={tab.label}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
