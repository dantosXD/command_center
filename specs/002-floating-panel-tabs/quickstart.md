# Quickstart: Floating Panel Tabs

**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-31  
**Status**: Complete

## Feature Overview

The Floating Panel Tabs feature transforms the Command Center into a unified productivity hub by providing a persistent, draggable panel with three tabs:

1. **Notifications Tab**: Real-time alerts and messages
2. **Reminders Tab**: Time-based reminders sorted by due date
3. **Tasks Tab**: Work items with status and priority

The panel is:
- **Floating**: Always visible on top of other windows
- **Draggable**: Users can reposition it anywhere on screen
- **Minimizable**: Collapses to a compact view
- **Persistent**: Remembers position and state across sessions
- **Real-time**: Updates instantly when new data arrives

## Architecture Overview

### Frontend Components

```
FloatingPanel (main container)
├── PanelHeader (draggable header with minimize button)
├── TabBar (tab navigation)
└── Tab Content
    ├── NotificationsTab
    ├── RemindersTab
    └── TasksTab
```

### State Management

Three custom React hooks handle state:

- **`useFloatingPanel`**: Manages tab state and visibility
- **`usePanelPosition`**: Handles drag logic and coordinates
- **`usePanelStorage`**: Persists state to localStorage

### Data Flow

```
Backend APIs
├── GET /api/notifications → NotificationsTab
├── GET /api/reminders → RemindersTab
└── GET /api/tasks → TasksTab

WebSocket (real-time updates)
└── Triggers re-fetch of affected tab

localStorage
└── Panel position & state persistence
```

## Key Design Decisions

### 1. No External Drag Library

**Decision**: Custom drag implementation using mouse events

**Why**: Lightweight (~100 LOC), full control, easy to test

**Implementation**:
```typescript
// Pseudo-code
const handleMouseDown = (e: MouseEvent) => {
  const startX = e.clientX - position.x;
  const startY = e.clientY - position.y;
  
  const handleMouseMove = (e: MouseEvent) => {
    setPosition({
      x: Math.max(0, Math.min(e.clientX - startX, viewportWidth)),
      y: Math.max(0, Math.min(e.clientY - startY, viewportHeight))
    });
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', handleMouseMove);
    savePanelState(); // Persist to localStorage
  });
};
```

### 2. Lazy Loading Tab Content

**Decision**: Only render active tab content; other tabs render empty until clicked

**Why**: Reduces initial load time and memory usage

**Implementation**:
```typescript
{activeTab === 'notifications' && <NotificationsTab />}
{activeTab === 'reminders' && <RemindersTab />}
{activeTab === 'tasks' && <TasksTab />}
```

### 3. Real-Time Updates via WebSocket

**Decision**: Use existing WebSocket connection; fallback to polling

**Why**: Leverages existing infrastructure; graceful degradation

**Implementation**:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToUpdates((event) => {
    if (event.type === 'notification:created') {
      refetchNotifications();
    }
    // ... handle other event types
  });
  
  return unsubscribe;
}, []);
```

### 4. localStorage for Panel State

**Decision**: Store position and minimized state in browser localStorage

**Why**: Simple, fast, no backend changes needed

**Key**:
```
floating_panel_state: {
  position: { x: 100, y: 150 },
  minimized: false,
  activeTab: 'notifications',
  lastUpdated: '2025-10-31T12:00:00Z'
}
```

## Component API

### FloatingPanel

Main container component.

**Props**:
```typescript
interface FloatingPanelProps {
  featureFlagEnabled: boolean;
  onClose?: () => void;
}
```

**Usage**:
```typescript
<FloatingPanel featureFlagEnabled={isFloatingPanelEnabled} />
```

### useFloatingPanel

Hook for managing panel state.

**Returns**:
```typescript
{
  activeTab: 'notifications' | 'reminders' | 'tasks';
  setActiveTab: (tab: string) => void;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
}
```

### usePanelPosition

Hook for managing panel position and drag.

**Returns**:
```typescript
{
  position: { x: number; y: number };
  setPosition: (pos: { x: number; y: number }) => void;
  isDragging: boolean;
  handleMouseDown: (e: MouseEvent) => void;
}
```

### usePanelStorage

Hook for persisting panel state.

**Returns**:
```typescript
{
  loadState: () => PanelState;
  saveState: (state: PanelState) => void;
}
```

## API Contracts

### Notifications Endpoint

**GET** `/api/notifications`

**Query Parameters**:
- `limit` (number, default 50)
- `offset` (number, default 0)
- `unreadOnly` (boolean, default false)

**Response**:
```json
{
  "data": [
    {
      "id": "notif-123",
      "title": "New message",
      "content": "You have a new message",
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

### Reminders Endpoint

**GET** `/api/reminders`

**Query Parameters**:
- `limit` (number, default 50)
- `offset` (number, default 0)
- `sortBy` (enum, default 'dueDate')

**Response**:
```json
{
  "data": [
    {
      "id": "remind-456",
      "title": "Team meeting",
      "description": "Weekly sync",
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

### Tasks Endpoint

**GET** `/api/tasks`

**Query Parameters**:
- `limit` (number, default 50)
- `offset` (number, default 0)
- `status` (enum, optional)
- `priority` (enum, optional)

**Response**:
```json
{
  "data": [
    {
      "id": "task-789",
      "title": "Implement floating panel",
      "description": "Build tabbed floating panel",
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

## Accessibility Features

### Keyboard Navigation

- **Tab**: Move focus between tabs and interactive elements
- **Arrow Keys**: Navigate items within a tab
- **Enter**: Interact with focused item
- **Escape**: Close detail view (if applicable)

### Screen Reader Support

- Tab names announced: "Notifications tab", "Reminders tab", "Tasks tab"
- Content updates announced: "New notification added"
- Button labels clear: "Minimize panel", "Expand panel"

### Visual Accessibility

- Contrast ratios meet WCAG 2.2 AA (4.5:1 for text)
- Focus indicators visible on all interactive elements
- Icons paired with text labels

## Performance Targets

- **Panel Load**: < 2 seconds
- **Tab Switch**: < 100ms
- **Real-Time Update**: < 500ms from event to UI
- **Bundle Size**: < 50KB (gzipped)
- **Memory**: < 10MB for panel + cached data

## Testing Strategy

### Unit Tests

- Tab switching logic
- State management (hooks)
- Position calculations
- localStorage persistence

### Component Tests

- Drag interaction
- Minimize/expand
- Tab content rendering
- Empty states

### E2E Tests

- Full user journey: open panel → switch tabs → drag → minimize
- Real-time updates
- Keyboard navigation
- Accessibility compliance

### Accessibility Tests

- axe-core automated scans
- Manual keyboard-only navigation
- Screen reader testing (NVDA, JAWS)

## Feature Flag Strategy

**Flag Name**: `floating_panel_tabs`

**Rollout Plan**:
1. **Week 1**: 10% of users (early adopters)
2. **Week 2**: 25% of users (expanded testing)
3. **Week 3**: 50% of users (broad rollout)
4. **Week 4**: 100% of users (general availability)

**Rollback Triggers**:
- Error rate > 5%
- Performance degradation > 20%
- Critical accessibility issues
- User complaints > threshold

**Sunset Plan**:
- 1 month post-GA: Remove feature flag
- Update release notes
- Archive feature branch

## Deployment Checklist

- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] E2E tests passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Feature flag configured
- [ ] Rollout plan documented
- [ ] Rollback procedure tested
- [ ] ADR written and approved
- [ ] Documentation updated
- [ ] Release notes prepared

## Next Steps

1. **Phase 2**: Generate tasks.md with implementation tasks
2. **Implementation**: Build components and hooks
3. **Testing**: Write and run test suites
4. **Review**: Code review and accessibility audit
5. **Deployment**: Staged rollout with monitoring
