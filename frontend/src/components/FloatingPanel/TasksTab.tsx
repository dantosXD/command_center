/**
 * TasksTab Component
 * Displays tasks with status indicators and priority badges
 */

import React from 'react';
import type { Task } from '../../types/panel';
import {
  taskItemStyles,
  tabContentStyles,
  getPriorityBadgeClass,
  getStatusIndicatorClass,
  combineStyles,
} from './styles';

export interface TasksTabProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onTaskStatusChange: (id: string, status: 'open' | 'in-progress' | 'completed' | 'blocked') => void;
}

const statusOptions: Array<'open' | 'in-progress' | 'completed' | 'blocked'> = [
  'open',
  'in-progress',
  'completed',
  'blocked',
];

const statusLabels: Record<string, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

export default function TasksTab({
  tasks,
  loading,
  error,
  onTaskStatusChange,
}: TasksTabProps): JSX.Element {
  if (loading) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p>Loading tasks...</p>
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

  if (tasks.length === 0) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p>No tasks</p>
      </div>
    );
  }

  return (
    <div className={tabContentStyles.base} role="region" aria-label="Tasks list">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-3 hover:bg-gray-50 transition-colors"
            role="button"
            tabIndex={0}
            aria-label={`Task: ${task.title} - ${statusLabels[task.status]}`}
          >
            <div className={taskItemStyles.container}>
              {/* Status Indicator */}
              <div
                className={combineStyles(
                  taskItemStyles.statusIndicator,
                  getStatusIndicatorClass(task.status)
                )}
                aria-label={`Status: ${statusLabels[task.status]}`}
              />

              {/* Content */}
              <div className={taskItemStyles.content}>
                <h3 className={taskItemStyles.title}>{task.title}</h3>

                {task.description && (
                  <p className={taskItemStyles.description}>{task.description}</p>
                )}

                {/* Meta Information */}
                <div className={taskItemStyles.meta}>
                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'open' | 'in-progress' | 'completed' | 'blocked';
                      onTaskStatusChange(task.id, newStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Change status for ${task.title}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>

                  {/* Priority Badge */}
                  <span
                    className={combineStyles(
                      taskItemStyles.priority,
                      getPriorityBadgeClass(task.priority)
                    )}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>

                  {/* Due Date */}
                  {task.dueDate && (
                    <span className="text-xs text-gray-500">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Assignee */}
                {task.assignee && (
                  <p className="text-xs text-gray-500 mt-2">
                    👤 {task.assignee}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
