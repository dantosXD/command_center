/**
 * NotificationsTab Component
 * Displays notifications with timestamps and action links
 */

import React from 'react';
import type { Notification } from '../../types/panel';
import {
  notificationItemStyles,
  tabContentStyles,
  getNotificationBadgeClass,
  combineStyles,
} from './styles';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return time.toLocaleDateString();
}

/**
 * Get avatar initials from title or source
 */
function getAvatarInitials(title: string, source?: string): string {
  const text = source || title;
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

export interface NotificationsTabProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onNotificationClick: (id: string) => void;
}

export default function NotificationsTab({
  notifications,
  loading,
  error,
  onNotificationClick,
}: NotificationsTabProps): JSX.Element {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={combineStyles(tabContentStyles.base, tabContentStyles.empty)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">All caught up!</p>
          <p className="text-gray-400 text-xs mt-1">No new notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className={tabContentStyles.base} role="region" aria-label="Notifications list">
      <ul className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={combineStyles(
              notificationItemStyles.container,
              !notification.read ? 'bg-blue-50/30' : ''
            )}
            onClick={() => onNotificationClick(notification.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNotificationClick(notification.id);
              }
            }}
            aria-label={`Notification: ${notification.title}`}
          >
            {/* Avatar */}
            <div className={notificationItemStyles.avatar}>
              {getAvatarInitials(notification.title, notification.source)}
            </div>

            {/* Content */}
            <div className={notificationItemStyles.content}>
              <h3 className={notificationItemStyles.title}>
                {notification.title}
              </h3>
              <p className={notificationItemStyles.message}>
                {notification.content}
              </p>
              <p className={notificationItemStyles.timestamp}>
                {formatRelativeTime(notification.timestamp)}
              </p>

              {/* Action Link */}
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {notification.actionLabel || 'View'}
                </a>
              )}
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
              <div
                className={notificationItemStyles.unreadIndicator}
                aria-label="Unread"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
