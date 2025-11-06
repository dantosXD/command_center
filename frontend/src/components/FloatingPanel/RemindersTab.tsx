/**
 * RemindersTab Component
 * Displays reminders sorted by due date with completion toggle
 */

import React from 'react';
import type { Reminder } from '../../types/panel';
import {
  reminderItemStyles,
  tabContentStyles,
  getPriorityBadgeClass,
  combineStyles,
} from './styles';

export interface RemindersTabProps {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  onReminderComplete: (id: string) => void;
}

export default function RemindersTab({
  reminders,
  loading,
  error,
  onReminderComplete,
}: RemindersTabProps): JSX.Element {
  if (loading) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p>Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p>No reminders</p>
      </div>
    );
  }

  return (
    <div className={tabContentStyles.base} role="region" aria-label="Reminders list">
      <ul className="divide-y divide-gray-200">
        {reminders.map((reminder) => (
          <li
            key={reminder.id}
            className={combineStyles(
              reminderItemStyles.container,
              'p-3 hover:bg-gray-50 cursor-pointer transition-colors'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onReminderComplete(reminder.id);
              }
            }}
            aria-label={`Reminder: ${reminder.title}${reminder.completed ? ' (completed)' : ''}`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={reminder.completed}
              onChange={() => onReminderComplete(reminder.id)}
              className={combineStyles(reminderItemStyles.checkbox)}
              aria-label={`Mark ${reminder.title} as ${reminder.completed ? 'incomplete' : 'complete'}`}
            />

            {/* Content */}
            <div className={reminderItemStyles.content}>
              <h3
                className={combineStyles(
                  reminderItemStyles.title,
                  reminder.completed ? 'line-through text-gray-500' : ''
                )}
              >
                {reminder.title}
              </h3>

              {reminder.description && (
                <p className={reminderItemStyles.description}>{reminder.description}</p>
              )}

              {/* Meta Information */}
              <div className={reminderItemStyles.meta}>
                <span className={reminderItemStyles.dueDate}>
                  📅 {new Date(reminder.dueDate).toLocaleDateString()}
                  {reminder.dueTime && ` at ${reminder.dueTime}`}
                </span>

                <span
                  className={combineStyles(
                    reminderItemStyles.priority,
                    getPriorityBadgeClass(reminder.priority)
                  )}
                >
                  {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                </span>

                {reminder.recurrence && reminder.recurrence !== 'none' && (
                  <span className="text-xs text-gray-500">
                    🔄 {reminder.recurrence}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
