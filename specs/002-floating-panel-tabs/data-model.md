# Data Model: Floating Panel Tabs

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-31  
**Status**: Complete

## Overview

This document defines the data structures and entities used by the floating panel tabs feature. All data is either fetched from existing backend APIs or stored locally in the browser.

## Core Entities

### Notification

Represents an alert or message displayed in the Notifications tab.

**Source**: Backend API (existing)

**Fields**:
- `id` (string): Unique identifier
- `title` (string): Notification title
- `content` (string): Notification message body
- `timestamp` (ISO 8601 datetime): When notification was created
- `read` (boolean): Whether user has read the notification
- `type` (enum): Category - 'info' | 'warning' | 'error' | 'success'
- `actionUrl` (string, optional): Link to take action on notification
- `actionLabel` (string, optional): Label for action button

**Validation Rules**:
- `title` must be non-empty, max 100 characters
- `content` must be non-empty, max 500 characters
- `timestamp` must be valid ISO 8601 datetime
- `type` must be one of allowed enum values

**State Transitions**:
- Created → Unread (default)
- Unread → Read (when user views)
- Any state → Archived (when user dismisses)

### Reminder

Represents a time-based reminder displayed in the Reminders tab.

**Source**: Backend API (existing)

**Fields**:
- `id` (string): Unique identifier
- `title` (string): Reminder title
- `description` (string, optional): Detailed description
- `dueDate` (ISO 8601 date): When reminder is due
- `dueTime` (ISO 8601 time, optional): Specific time for reminder
- `completed` (boolean): Whether reminder has been completed
- `priority` (enum): 'low' | 'medium' | 'high'
- `recurrence` (enum, optional): 'none' | 'daily' | 'weekly' | 'monthly'

**Validation Rules**:
- `title` must be non-empty, max 100 characters
- `dueDate` must be valid ISO 8601 date
- `priority` must be one of allowed enum values
- `dueDate` must not be in the past (for new reminders)

**State Transitions**:
- Created → Active (default)
- Active → Completed (when user marks done)
- Active → Overdue (when dueDate passes)
- Completed → Archived (after 30 days)

### Task

Represents a work item displayed in the Tasks tab.

**Source**: Backend API (existing)

**Fields**:
- `id` (string): Unique identifier
- `title` (string): Task title
- `description` (string, optional): Detailed description
- `status` (enum): 'open' | 'in-progress' | 'completed' | 'blocked'
- `priority` (enum): 'low' | 'medium' | 'high'
- `dueDate` (ISO 8601 date, optional): When task is due
- `assignee` (string, optional): User assigned to task
- `tags` (array of strings, optional): Task categories/labels

**Validation Rules**:
- `title` must be non-empty, max 100 characters
- `status` must be one of allowed enum values
- `priority` must be one of allowed enum values
- `dueDate` must be valid ISO 8601 date if provided

**State Transitions**:
- Created → Open (default)
- Open → In-Progress (when user starts)
- In-Progress → Completed (when user finishes)
- Any state → Blocked (if dependency fails)

### Panel State

Represents user preferences for the floating panel (stored locally).

**Source**: Browser localStorage

**Fields**:
- `position` (object): Panel position on screen
  - `x` (number): Horizontal position in pixels
  - `y` (number): Vertical position in pixels
- `minimized` (boolean): Whether panel is collapsed
- `activeTab` (enum): 'notifications' | 'reminders' | 'tasks'
- `lastUpdated` (ISO 8601 datetime): When state was last saved

**Validation Rules**:
- `x` must be >= 0 and <= viewport width
- `y` must be >= 0 and <= viewport height
- `minimized` must be boolean
- `activeTab` must be one of allowed enum values

**Default Values**:
```json
{
  "position": { "x": 20, "y": 20 },
  "minimized": false,
  "activeTab": "notifications",
  "lastUpdated": "2025-10-31T12:00:00Z"
}
```

## Relationships

```
User
├── Notifications (1:N)
├── Reminders (1:N)
└── Tasks (1:N)

Panel State (1:1 per user, stored locally)
```

## API Integration Points

### Notifications API

**Endpoint**: `GET /api/notifications`

**Query Parameters**:
- `limit` (number, default 50): Max notifications to return
- `offset` (number, default 0): Pagination offset
- `unreadOnly` (boolean, default false): Filter to unread only

**Response**:
```json
{
  "data": [
    {
      "id": "notif-123",
      "title": "New message",
      "content": "You have a new message from Alice",
      "timestamp": "2025-10-31T12:30:00Z",
      "read": false,
      "type": "info",
      "actionUrl": "/messages/123",
      "actionLabel": "View"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

### Reminders API

**Endpoint**: `GET /api/reminders`

**Query Parameters**:
- `limit` (number, default 50): Max reminders to return
- `offset` (number, default 0): Pagination offset
- `sortBy` (enum, default 'dueDate'): 'dueDate' | 'priority' | 'created'

**Response**:
```json
{
  "data": [
    {
      "id": "remind-456",
      "title": "Team meeting",
      "description": "Weekly sync with engineering team",
      "dueDate": "2025-11-01",
      "dueTime": "14:00",
      "completed": false,
      "priority": "high",
      "recurrence": "weekly"
    }
  ],
  "total": 25,
  "hasMore": false
}
```

### Tasks API

**Endpoint**: `GET /api/tasks`

**Query Parameters**:
- `limit` (number, default 50): Max tasks to return
- `offset` (number, default 0): Pagination offset
- `status` (enum, optional): Filter by status
- `priority` (enum, optional): Filter by priority

**Response**:
```json
{
  "data": [
    {
      "id": "task-789",
      "title": "Implement floating panel",
      "description": "Build tabbed floating panel for notifications",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2025-11-05",
      "assignee": "alice@example.com",
      "tags": ["frontend", "ui"]
    }
  ],
  "total": 42,
  "hasMore": true
}
```

## Real-Time Updates

### WebSocket Events

**Connection**: `wss://api.example.com/ws/updates`

**Events**:

1. **Notification Created**
```json
{
  "type": "notification:created",
  "data": { /* Notification object */ }
}
```

2. **Reminder Updated**
```json
{
  "type": "reminder:updated",
  "data": { /* Reminder object */ }
}
```

3. **Task Status Changed**
```json
{
  "type": "task:updated",
  "data": { /* Task object */ }
}
```

## Storage Strategy

### Backend Storage
- Notifications, Reminders, Tasks: Stored in backend database (existing)
- User RLS policies ensure users only see their own data

### Local Storage
- Panel State: Stored in browser localStorage under key `floating_panel_state`
- Cache: Optional local cache of recent notifications/reminders/tasks for offline support

**localStorage Schema**:
```json
{
  "floating_panel_state": {
    "position": { "x": 100, "y": 150 },
    "minimized": false,
    "activeTab": "notifications",
    "lastUpdated": "2025-10-31T15:45:00Z"
  }
}
```

## Performance Considerations

- **Pagination**: Fetch 50 items per page; lazy load on scroll
- **Caching**: Cache last 100 items per tab in memory
- **Debouncing**: Debounce position updates to localStorage (500ms)
- **Real-Time**: Use WebSocket for live updates; fallback to polling (30s interval)

## Constraints & Assumptions

- Users have existing accounts with proper RLS policies
- Backend APIs already exist and are accessible
- WebSocket connection available; polling as fallback
- localStorage available in browser (no private/incognito mode)
- Panel state is per-browser, not synced across tabs
