# Research: Floating Panel Tabs

**Phase**: 0 - Outline & Research  
**Date**: 2025-10-31  
**Status**: Complete

## Overview

This document consolidates research findings and design decisions for the floating panel tabs feature. All technical unknowns have been resolved based on existing project stack and best practices.

## Research Findings

### 1. Floating Panel Implementation Pattern

**Decision**: Use React with custom hooks for state management + TailwindCSS for styling + Lucide for icons.

**Rationale**: 
- Aligns with existing tech stack (React, TailwindCSS, Lucide already in use)
- Floating panels are a well-established UI pattern with proven libraries
- Custom hooks provide lightweight state management without additional dependencies
- TailwindCSS enables rapid, responsive styling

**Alternatives Considered**:
- Headless UI floating-ui library: More complex than needed; custom implementation is simpler
- Redux for state: Overkill for local panel state; hooks are sufficient
- CSS-in-JS: TailwindCSS already in use; consistent with project

### 2. Draggable Panel Implementation

**Decision**: Implement custom drag logic using mouse events (mousedown, mousemove, mouseup) with localStorage persistence.

**Rationale**:
- Lightweight implementation (~100 LOC) without external drag libraries
- Full control over drag behavior and constraints
- Easy to test and debug
- localStorage ensures position persists across sessions

**Alternatives Considered**:
- react-beautiful-dnd: Overkill for single draggable element
- react-rnd: Adds ~30KB; custom implementation is simpler
- Framer Motion: Adds animation complexity not needed for MVP

### 3. Real-Time Updates

**Decision**: Use existing WebSocket connection (if available) or polling with exponential backoff for notifications/reminders/tasks updates.

**Rationale**:
- Leverages existing backend infrastructure
- Polling as fallback ensures compatibility
- Real-time updates enhance UX without blocking MVP

**Alternatives Considered**:
- Server-Sent Events (SSE): WebSocket preferred if available; SSE as fallback
- Long polling: Less efficient than WebSocket; use only if necessary

### 4. State Management Architecture

**Decision**: Three custom hooks:
- `useFloatingPanel`: Tab state, visibility
- `usePanelPosition`: X/Y coordinates, drag state
- `usePanelStorage`: localStorage persistence

**Rationale**:
- Separates concerns (UI state vs. positioning vs. persistence)
- Each hook is independently testable
- Minimal bundle size impact
- Easy to extend with new features

**Alternatives Considered**:
- Context API: Adds provider wrapper; hooks are simpler for this scope
- Zustand: Lightweight but unnecessary for single-component state
- Jotai: Same as Zustand; overkill

### 5. Accessibility Implementation

**Decision**: 
- Keyboard navigation: Tab to cycle through tabs, Arrow keys to navigate items, Enter to interact
- ARIA labels on all interactive elements
- Screen reader announcements for tab changes and content updates
- Contrast ratios validated against WCAG 2.2 AA

**Rationale**:
- Meets constitution requirement for WCAG 2.2 AA compliance
- Keyboard-only navigation ensures accessibility
- ARIA labels provide context for assistive technologies

**Alternatives Considered**:
- Headless UI components: Adds dependency; custom implementation sufficient
- Radix UI: Excellent but adds bundle size; custom implementation meets requirements

### 6. Testing Strategy

**Decision**:
- Unit tests: Vitest for hooks (state management, drag logic, storage)
- Component tests: React Testing Library for UI interactions
- E2E tests: Playwright for full user journeys
- Accessibility tests: axe-core for automated scans + manual keyboard testing

**Rationale**:
- Aligns with existing test infrastructure
- Comprehensive coverage from unit to E2E
- Accessibility testing built-in

**Alternatives Considered**:
- Jest: Vitest is faster and already in use
- Cypress: Playwright preferred for modern browsers

### 7. Performance Optimization

**Decision**:
- Lazy load tab content (render only active tab)
- Memoize components to prevent unnecessary re-renders
- Debounce drag events (16ms throttle for 60fps)
- Bundle size target: <50KB

**Rationale**:
- Ensures panel doesn't impact main app performance
- Meets <100ms interaction target
- Lazy loading reduces initial load time

**Alternatives Considered**:
- Virtual scrolling: Not needed for small lists
- Web Workers: Overkill for this scope

### 8. Feature Flag Implementation

**Decision**: Use existing feature flag infrastructure with flag name `floating_panel_tabs`.

**Rationale**:
- Enables staged rollout (10% → 25% → 50% → 100%)
- Allows quick rollback if issues detected
- Aligns with constitution requirement

**Alternatives Considered**:
- Environment variables: Less flexible than feature flags
- Build-time flags: Cannot be changed without redeployment

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Framework | React + TailwindCSS | Existing stack |
| State Management | Custom hooks | Lightweight, testable |
| Drag Implementation | Custom mouse events | Simple, no dependencies |
| Real-Time Updates | WebSocket + polling | Existing infrastructure |
| Testing | Vitest + Playwright + RTL | Existing stack |
| Accessibility | WCAG 2.2 AA + keyboard nav | Constitution requirement |
| Performance | Lazy loading + memoization | <100ms interactions |
| Feature Flag | Built-in infrastructure | Staged rollout |

## Dependencies

### New Dependencies
- None required (all existing in project)

### Existing Dependencies Used
- React (UI framework)
- TailwindCSS (styling)
- Lucide Icons (icons)
- shadcn/ui (component library)
- Vitest (unit testing)
- React Testing Library (component testing)
- Playwright (E2E testing)
- TypeScript (type safety)

## Open Questions Resolved

1. **How to handle panel positioning at screen boundaries?**
   - Answer: Clamp coordinates to viewport bounds; prevent off-screen positioning

2. **What happens when APIs are unavailable?**
   - Answer: Show cached data or empty state; graceful degradation

3. **Should panel state sync across browser tabs?**
   - Answer: No - each tab maintains independent state (simpler implementation)

4. **How to handle rapid tab switching?**
   - Answer: Debounce tab changes; lazy load content to prevent janky transitions

## Next Steps

- Phase 1: Generate data-model.md, API contracts, and quickstart.md
- Phase 1: Update agent context with new technology stack
- Phase 2: Generate tasks.md with implementation tasks
