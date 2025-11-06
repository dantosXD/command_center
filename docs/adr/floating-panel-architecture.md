# ADR: Floating Panel Architecture

**Status**: Proposed  
**Date**: 2025-10-31  
**Decision Maker**: Engineering Team  
**Stakeholders**: Product, Engineering, Design

## Context

The Command Center needs a unified productivity hub that displays notifications, reminders, and tasks in a persistent, non-intrusive floating panel. The panel must be:

- Always accessible without leaving the user's current work context
- Draggable and minimizable for workspace customization
- Real-time updated with new notifications, reminders, and tasks
- Fully accessible (WCAG 2.2 AA compliant)
- Performant (<100ms interactions, <50KB bundle size)

## Decision

We will implement the floating panel as a React component with the following architecture:

### 1. State Management

**Decision**: Use custom React hooks instead of external state management libraries

**Rationale**:
- Lightweight implementation (~100 LOC per hook)
- No additional dependencies
- Easy to test and debug
- Sufficient for local component state

**Hooks**:
- `useFloatingPanel`: Manages tab state and visibility
- `usePanelPosition`: Handles drag logic and coordinates
- `usePanelStorage`: Persists state to localStorage

### 2. Drag Implementation

**Decision**: Custom mouse event handlers instead of external drag libraries

**Rationale**:
- Simpler implementation (~100 LOC)
- Full control over drag behavior
- No performance overhead from additional libraries
- Easy to add boundary clamping and constraints

**Implementation**:
- Mouse events: `mousedown`, `mousemove`, `mouseup`
- Position boundary clamping to prevent off-screen positioning
- Debounced position updates (500ms) for performance

### 3. Real-Time Updates

**Decision**: WebSocket with polling fallback

**Rationale**:
- WebSocket for low-latency updates
- Polling fallback for environments without WebSocket support
- Graceful degradation if connection fails
- Leverages existing backend infrastructure

**Implementation**:
- WebSocket manager with automatic reconnection
- Exponential backoff for reconnection attempts
- Event-based subscription model for updates

### 4. Data Persistence

**Decision**: Browser localStorage for panel state, sessionStorage for cache

**Rationale**:
- No backend persistence needed for UI state
- Fast, synchronous access
- Works offline
- Simple to implement and test

**Storage**:
- `floating_panel_state`: Panel position, minimized state, active tab
- `floating_panel_cache:*`: Cached API responses (5-minute TTL)

### 5. Styling

**Decision**: TailwindCSS with utility classes

**Rationale**:
- Consistent with existing project
- Rapid development
- Small bundle size
- Built-in responsive design

### 6. Component Structure

```
FloatingPanel (main container)
├── PanelHeader (draggable header)
│   ├── Title
│   └── Controls (minimize, close)
├── TabBar (tab navigation)
│   ├── NotificationsTab
│   ├── RemindersTab
│   └── TasksTab
└── TabContent (lazy-loaded)
    ├── NotificationsTab (content)
    ├── RemindersTab (content)
    └── TasksTab (content)
```

### 7. Accessibility

**Decision**: WCAG 2.2 AA compliance with keyboard navigation

**Rationale**:
- Constitution requirement
- Inclusive design
- Better UX for all users

**Implementation**:
- Keyboard navigation: Tab, Arrow keys, Enter, Escape
- ARIA labels on all interactive elements
- Screen reader announcements for updates
- Contrast ratios meet WCAG 2.2 AA (4.5:1 for text)

### 8. Feature Flag Strategy

**Decision**: Feature flag with staged rollout

**Rationale**:
- Safe deployment with quick rollback
- Gradual user exposure
- A/B testing capability

**Rollout Plan**:
- Week 1: 10% of users
- Week 2: 25% of users
- Week 3: 50% of users
- Week 4: 100% of users (GA)

### 9. Testing Strategy

**Decision**: Test-first approach with comprehensive coverage

**Rationale**:
- Constitution requirement
- Catches bugs early
- Enables refactoring with confidence

**Test Levels**:
- Unit tests: Hooks, utilities, data fetching
- Component tests: UI interactions, rendering
- E2E tests: Full user journeys
- Accessibility tests: Keyboard navigation, screen readers
- Performance tests: Load time, interaction latency

## Alternatives Considered

### 1. State Management Alternatives

**Redux/Zustand**: Rejected because:
- Overkill for local component state
- Additional bundle size
- More complex than needed

**Context API**: Rejected because:
- Requires provider wrapper
- Less performant for frequent updates
- Hooks are simpler for this scope

### 2. Drag Library Alternatives

**react-beautiful-dnd**: Rejected because:
- Designed for list reordering, not floating panels
- Larger bundle size
- More complex than needed

**react-rnd**: Rejected because:
- Adds ~30KB to bundle
- Custom implementation is simpler
- Full control over behavior

### 3. Real-Time Alternatives

**Server-Sent Events (SSE)**: Rejected because:
- WebSocket preferred for bidirectional communication
- SSE can be fallback if needed

**Long Polling**: Rejected because:
- Less efficient than WebSocket
- Higher latency
- More server load

### 4. Styling Alternatives

**CSS-in-JS (styled-components)**: Rejected because:
- TailwindCSS already in use
- Consistent with project
- Better performance

**CSS Modules**: Rejected because:
- TailwindCSS provides better utility
- Consistent with project

## Consequences

### Positive

- Lightweight implementation with minimal dependencies
- Fast performance (<100ms interactions)
- Easy to test and maintain
- Full control over behavior
- Accessible by default
- Safe deployment with feature flags

### Negative

- Custom implementations require more testing
- No battle-tested library patterns
- Maintenance responsibility on team
- Potential edge cases in drag behavior

### Risks

- WebSocket connection failures (mitigated by polling fallback)
- localStorage quota exceeded (mitigated by cache TTL)
- Performance issues with many notifications (mitigated by pagination)
- Accessibility issues (mitigated by comprehensive testing)

## Implementation Plan

1. **Phase 1**: Setup project structure and configuration
2. **Phase 2**: Implement foundational infrastructure (types, services, styles)
3. **Phase 3**: Implement User Story 1 (Notifications tab)
4. **Phase 4**: Implement User Story 2 (Reminders & Tasks tabs)
5. **Phase 5**: Implement User Story 3 (Panel controls - drag, minimize)
6. **Phase 6**: Polish, testing, documentation

## Validation Criteria

- All tests passing (unit, component, E2E, accessibility)
- Performance benchmarks met (<100ms interactions, <50KB bundle)
- Accessibility audit passed (WCAG 2.2 AA)
- Feature flag integration working
- Staged rollout successful
- User satisfaction >4.0/5.0

## References

- [Floating Panel Tabs Specification](../../specs/002-floating-panel-tabs/spec.md)
- [Implementation Plan](../../specs/002-floating-panel-tabs/plan.md)
- [Data Model](../../specs/002-floating-panel-tabs/data-model.md)
- [Quickstart Guide](../../specs/002-floating-panel-tabs/quickstart.md)

## Decision Log

- **2025-10-31**: Initial ADR created during Phase 1 setup
