# Floating Panel Tabs Component

A production-ready floating panel component for displaying notifications, reminders, and tasks in real-time.

## Features

- ✅ **Draggable Panel**: Move the panel anywhere on screen with boundary clamping
- ✅ **Minimizable**: Collapse to a compact view when not needed
- ✅ **Three Tabs**: Notifications, Reminders, and Tasks
- ✅ **Real-Time Updates**: WebSocket integration with polling fallback
- ✅ **State Persistence**: Remembers position and state across sessions
- ✅ **Accessibility**: WCAG 2.2 AA compliant with keyboard navigation
- ✅ **Performance**: <100ms interactions, <50KB bundle size
- ✅ **Feature Flag**: Safe rollout with gradual user exposure

## Installation

```bash
npm install
# or
pnpm install
```

## Usage

### Basic Usage

```tsx
import FloatingPanel from '@/components/FloatingPanel/FloatingPanel';

export default function App() {
  return (
    <div>
      <FloatingPanel />
    </div>
  );
}
```

### With Close Handler

```tsx
<FloatingPanel 
  onClose={() => {
    // Handle panel close
    console.log('Panel closed');
  }}
/>
```

## Component Structure

```
FloatingPanel/
├── FloatingPanel.tsx          # Main container with feature flag guard
├── PanelHeader.tsx            # Draggable header with controls
├── TabBar.tsx                 # Tab navigation
├── NotificationsTab.tsx       # Notifications display
├── RemindersTab.tsx           # Reminders display
├── TasksTab.tsx               # Tasks display
└── styles.ts                  # Tailwind CSS utilities
```

## Hooks

### useFloatingPanel

Manages panel state, data fetching, and real-time updates.

```tsx
const {
  activeTab,
  notifications,
  reminders,
  tasks,
  loading,
  error,
  setActiveTab,
  loadNotifications,
  markNotificationAsRead,
  // ... more methods
} = useFloatingPanel();
```

### usePanelPosition

Handles drag logic and position management.

```tsx
const {
  position,
  isDragging,
  handleMouseDown,
  setPosition,
  resetPosition,
} = usePanelPosition({ x: 20, y: 20 });
```

### usePanelStorage

Manages localStorage persistence.

```tsx
const {
  panelState,
  isLoaded,
  updatePosition,
  toggleMinimized,
  setActiveTab,
  resetState,
} = usePanelStorage();
```

## Services

### panelApi

API service for data fetching and WebSocket management.

```tsx
import {
  fetchNotifications,
  fetchReminders,
  fetchTasks,
  wsManager,
  savePanelState,
  loadPanelState,
} from '@/services/panelApi';

// Fetch data
const notifications = await fetchNotifications(50, 0, false);

// WebSocket subscription
wsManager.subscribe('notification:created', (event) => {
  console.log('New notification:', event.data);
});
```

### featureFlags

Feature flag management for safe rollout.

```tsx
import { useFeatureFlag } from '@/services/featureFlags';

const isEnabled = useFeatureFlag('floating_panel_tabs');
```

## Keyboard Navigation

- **Tab**: Move focus between interactive elements
- **Arrow Right/Left**: Switch between tabs
- **Enter**: Interact with focused element
- **Escape**: Close detail view (if applicable)

## Accessibility

- WCAG 2.2 AA compliant
- Full keyboard navigation support
- Screen reader announcements
- ARIA labels on all interactive elements
- Focus indicators on all buttons

## Performance

- **Load Time**: < 2 seconds
- **Tab Switch**: < 100ms
- **Bundle Size**: < 50KB (gzipped)
- **Memory**: < 10MB
- **WebSocket Latency**: < 500ms

## API Integration

### Endpoints

- `GET /api/notifications` - Fetch notifications
- `GET /api/reminders` - Fetch reminders
- `GET /api/tasks` - Fetch tasks
- `WebSocket /ws/updates` - Real-time updates

### Data Models

```tsx
interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  actionUrl?: string;
  actionLabel?: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}
```

## Testing

### Unit Tests

```bash
npm run test:unit
```

### Component Tests

```bash
npm run test:component
```

### E2E Tests

```bash
npm run test:e2e
```

### Accessibility Tests

```bash
npm run test:a11y
```

## Feature Flag

The component is protected by the `floating_panel_tabs` feature flag.

### Rollout Strategy

- **Week 1**: 10% of users
- **Week 2**: 25% of users
- **Week 3**: 50% of users
- **Week 4**: 100% of users (GA)

### Rollback Triggers

- Error rate > 5%
- Performance degradation > 20%
- Manual intervention

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

### Tailwind CSS

The component uses TailwindCSS utility classes. Ensure TailwindCSS is configured in your project.

## Styling

Customize the component appearance by modifying `styles.ts`:

```tsx
// Change panel dimensions
export const panelContainerStyles = {
  expanded: 'w-96 h-96', // Modify width/height
  minimized: 'w-64 h-12',
};

// Change colors
export const panelHeaderStyles = {
  base: 'bg-gradient-to-r from-blue-600 to-blue-700', // Modify colors
};
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Dependencies

- React 18+
- TypeScript 4.5+
- TailwindCSS 3+
- Lucide React (icons)

## License

MIT

## Support

For issues or questions, please refer to the [Architecture Decision Record](../../docs/adr/floating-panel-architecture.md).
