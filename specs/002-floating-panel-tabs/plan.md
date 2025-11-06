# Implementation Plan: Floating Panel Tabs

**Branch**: `002-floating-panel-tabs` | **Date**: 2025-10-31 | **Spec**: [Floating Panel Tabs Specification](./spec.md)
**Input**: Feature specification from `/specs/002-floating-panel-tabs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a floating panel application with tabbed interface to provide users with a persistent, non-intrusive view of notifications, reminders, and tasks. The panel will be draggable, minimizable, and maintain state across sessions. This feature transforms the command center into a unified productivity hub accessible from anywhere in the user's workflow.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript/Node.js (existing stack)  
**Primary Dependencies**: React, TailwindCSS, Lucide Icons, shadcn/ui (existing stack)  
**Storage**: Local browser storage for panel state (position, minimized status); backend APIs for notifications/reminders/tasks  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (component)  
**Target Platform**: Web browser (desktop-first, responsive)  
**Project Type**: Web application (frontend + backend integration)  
**Performance Goals**: Panel loads within 2 seconds; tab switching <100ms; real-time updates via WebSocket  
**Constraints**: <50KB bundle size for panel component; no performance impact on main app; works offline (cached data)  
**Scale/Scope**: Single feature module; ~500 LOC frontend; integrates with existing notification/reminder/task APIs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify the feature plan satisfies every constitution guardrail:

- ✅ **Accessibility**: Panel must be fully keyboard navigable (Tab to switch tabs, Enter to interact). Screen readers announce tab names and content updates. Contrast ratios meet WCAG 2.2 AA. Minimize/expand buttons have clear labels. Automated testing via axe-core; manual audit before GA.
- ✅ **Security**: Panel data (notifications, reminders, tasks) uses existing RLS policies - users see only their own data. No new secrets needed. Panel state stored locally (no sensitive data). Threat model: no new attack surface (read-only display of existing data).
- ✅ **Testing**: Unit tests for tab switching and state management; component tests for dragging/minimize; E2E tests for primary journeys; accessibility tests for keyboard/screen reader; performance tests confirming <100ms interactions.
- ✅ **Delivery**: Feature ships behind flag `floating_panel_tabs`. Staged rollout: 10% → 25% → 50% → 100% over 2 weeks. Rollback trigger: error rate >5% or performance degradation >20%. Flag removal 1 month post-GA.
- ✅ **Operations**: Panel state is local (no backend persistence). No background jobs or queues. No disaster recovery implications. Panel gracefully degrades if APIs are unavailable (shows cached/empty state).
- ✅ **Build & Release**: Dependencies pinned in package.json. Build is deterministic (pnpm lockfile). No new tooling required.
- ✅ **Documentation**: ADR `floating-panel-architecture` will document design decisions (tab structure, state management, drag implementation).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── FloatingPanel/
│   │   │   ├── FloatingPanel.tsx          # Main panel container
│   │   │   ├── FloatingPanel.test.tsx
│   │   │   ├── PanelHeader.tsx            # Draggable header with minimize button
│   │   │   ├── TabBar.tsx                 # Tab navigation
│   │   │   ├── NotificationsTab.tsx       # Notifications content
│   │   │   ├── RemindersTab.tsx           # Reminders content
│   │   │   ├── TasksTab.tsx               # Tasks content
│   │   │   └── styles.ts                  # Tailwind classes
│   ├── hooks/
│   │   ├── useFloatingPanel.ts            # Panel state management
│   │   ├── usePanelPosition.ts            # Drag/position logic
│   │   └── usePanelStorage.ts             # LocalStorage persistence
│   ├── services/
│   │   └── panelApi.ts                    # API calls for notifications/reminders/tasks
│   └── types/
│       └── panel.ts                       # TypeScript interfaces
└── tests/
    ├── unit/
    │   ├── FloatingPanel.test.tsx
    │   ├── usePanelPosition.test.ts
    │   └── usePanelStorage.test.ts
    ├── component/
    │   └── FloatingPanel.integration.test.tsx
    └── e2e/
        └── floating-panel.spec.ts         # Playwright E2E tests

backend/
├── src/
│   └── api/
│       ├── notifications.ts               # Existing endpoints
│       ├── reminders.ts                   # Existing endpoints
│       └── tasks.ts                       # Existing endpoints
└── tests/
    └── [existing test structure]
```

**Structure Decision**: Web application with existing frontend/backend separation. Floating panel is a new feature module in `frontend/src/components/FloatingPanel/`. No backend changes required - panel consumes existing APIs. Panel state (position, minimized) stored in browser localStorage.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

