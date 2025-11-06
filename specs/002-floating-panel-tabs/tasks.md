# Tasks: Floating Panel Tabs

**Input**: Design documents from `/specs/002-floating-panel-tabs/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, quickstart.md

**Tests**: Tests are MANDATORY per the constitution—include unit, component, E2E, and accessibility coverage for UI work.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Backend**: `backend/src/`, `backend/tests/`
- Web app structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create FloatingPanel component directory structure in `frontend/src/components/FloatingPanel/`
- [x] T002 [P] Create hooks directory structure in `frontend/src/hooks/`
- [x] T003 [P] Create services directory structure in `frontend/src/services/`
- [x] T004 [P] Create types directory with TypeScript interfaces in `frontend/src/types/panel.ts`
- [x] T005 Create test directories: `frontend/tests/unit/`, `frontend/tests/component/`, `frontend/tests/e2e/`
- [x] T006 Setup feature flag framework with `floating_panel_tabs` flag in feature flag configuration
- [x] T007 Initialize ADR template and create `/docs/adr/floating-panel-architecture.md` placeholder
- [ ] T008 Configure Vitest for unit tests in `vitest.config.ts`
- [ ] T009 Configure Playwright for E2E tests in `playwright.config.ts`
- [ ] T010 Setup axe-core accessibility testing in test configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create TypeScript interfaces for Notification, Reminder, Task, and PanelState in `frontend/src/types/panel.ts`
- [x] T012 [P] Create panelApi service for fetching notifications in `frontend/src/services/panelApi.ts`
- [x] T013 [P] Create panelApi service for fetching reminders in `frontend/src/services/panelApi.ts`
- [x] T014 [P] Create panelApi service for fetching tasks in `frontend/src/services/panelApi.ts`
- [x] T015 Setup WebSocket connection handler for real-time updates in `frontend/src/services/panelApi.ts`
- [x] T016 Create base styles and Tailwind configuration for floating panel in `frontend/src/components/FloatingPanel/styles.ts`
- [x] T017 Setup localStorage utility functions for panel state persistence in `frontend/src/services/panelApi.ts`
- [x] T018 Configure feature flag guard wrapper component in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [x] T019 Create error handling and graceful degradation for API failures in `frontend/src/services/panelApi.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Notifications in Floating Panel (Priority: P1) 🎯 MVP

**Goal**: Display notifications in a dedicated tab within the floating panel with real-time updates

**Independent Test**: Launch app, open floating panel, verify notifications tab displays notifications with timestamps and content. Can be tested independently without reminders/tasks.

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US1] Unit test for useFloatingPanel hook (tab state management) in `frontend/tests/unit/useFloatingPanel.test.ts`
- [ ] T021 [P] [US1] Unit test for notification data fetching in `frontend/tests/unit/panelApi.test.ts`
- [ ] T022 [P] [US1] Component test for NotificationsTab rendering in `frontend/tests/component/NotificationsTab.test.tsx`
- [ ] T023 [P] [US1] Component test for notification item click interaction in `frontend/tests/component/NotificationsTab.test.tsx`
- [x] T024 [P] [US1] E2E smoke test for viewing notifications in `frontend/tests/e2e/floating-panel.spec.ts`
- [x] T025 [P] [US1] Accessibility test for notifications tab keyboard navigation in `frontend/tests/e2e/floating-panel.spec.ts`
- [ ] T026 [US1] Performance test confirming notification fetch completes within 2 seconds in `frontend/tests/unit/panelApi.test.ts`

### Implementation for User Story 1

- [x] T027 [P] [US1] Implement useFloatingPanel hook for tab state management in `frontend/src/hooks/useFloatingPanel.ts`
- [x] T028 [P] [US1] Implement NotificationsTab component in `frontend/src/components/FloatingPanel/NotificationsTab.tsx`
- [x] T029 [P] [US1] Implement NotificationItem component for displaying individual notifications in `frontend/src/components/FloatingPanel/NotificationsTab.tsx`
- [x] T030 [US1] Implement TabBar component with Notifications tab in `frontend/src/components/FloatingPanel/TabBar.tsx`
- [x] T031 [US1] Implement FloatingPanel main container with feature flag guard in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [x] T032 [US1] Add real-time notification updates via WebSocket in `frontend/src/hooks/useFloatingPanel.ts`
- [x] T033 [US1] Add empty state handling for notifications tab in `frontend/src/components/FloatingPanel/NotificationsTab.tsx`
- [x] T034 [US1] Add error handling and retry logic for notification fetch failures in `frontend/src/hooks/useFloatingPanel.ts`
- [x] T035 [US1] Implement notification click handler to show full details in `frontend/src/components/FloatingPanel/NotificationsTab.tsx`
- [x] T036 [US1] Add ARIA labels and screen reader announcements for notifications in `frontend/src/components/FloatingPanel/NotificationsTab.tsx`

**Checkpoint**: User Story 1 should be fully functional and testable independently. Notifications display, update in real-time, and are accessible.

---

## Phase 4: User Story 2 - Manage Reminders and Tasks (Priority: P2)

**Goal**: Display reminders and tasks in separate tabs with proper sorting and status indicators

**Independent Test**: Open Reminders and Tasks tabs, verify items display with due dates and status. Can be tested independently without notifications.

### Tests for User Story 2 (MANDATORY) ⚠️

- [ ] T037 [P] [US2] Unit test for reminder data fetching and sorting in `frontend/tests/unit/panelApi.test.ts`
- [ ] T038 [P] [US2] Unit test for task data fetching and filtering in `frontend/tests/unit/panelApi.test.ts`
- [ ] T039 [P] [US2] Component test for RemindersTab rendering sorted reminders in `frontend/tests/component/RemindersTab.test.tsx`
- [ ] T040 [P] [US2] Component test for TasksTab rendering tasks with status in `frontend/tests/component/TasksTab.test.tsx`
- [ ] T041 [P] [US2] E2E smoke test for switching between Reminders and Tasks tabs in `frontend/tests/e2e/floating-panel.spec.ts`
- [ ] T042 [P] [US2] Accessibility test for reminders/tasks tab keyboard navigation in `frontend/tests/e2e/floating-panel.spec.ts`
- [ ] T043 [US2] Performance test confirming tab content lazy loads within 100ms in `frontend/tests/unit/useFloatingPanel.test.ts`

### Implementation for User Story 2

- [x] T044 [P] [US2] Implement RemindersTab component in `frontend/src/components/FloatingPanel/RemindersTab.tsx`
- [x] T045 [P] [US2] Implement ReminderItem component with due date and priority display in `frontend/src/components/FloatingPanel/RemindersTab.tsx`
- [x] T046 [P] [US2] Implement TasksTab component in `frontend/src/components/FloatingPanel/TasksTab.tsx`
- [x] T047 [P] [US2] Implement TaskItem component with status and priority indicators in `frontend/src/components/FloatingPanel/TasksTab.tsx`
- [ ] T048 [US2] Add Reminders and Tasks tabs to TabBar in `frontend/src/components/FloatingPanel/TabBar.tsx`
- [ ] T049 [US2] Implement lazy loading for tab content (only render active tab) in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [ ] T050 [US2] Add real-time reminder updates via WebSocket in `frontend/src/hooks/useFloatingPanel.ts`
- [ ] T051 [US2] Add real-time task updates via WebSocket in `frontend/src/hooks/useFloatingPanel.ts`
- [ ] T052 [US2] Add empty state handling for reminders and tasks tabs in `frontend/src/components/FloatingPanel/RemindersTab.tsx` and `TasksTab.tsx`
- [ ] T053 [US2] Add error handling for reminder/task fetch failures in `frontend/src/hooks/useFloatingPanel.ts`
- [ ] T054 [US2] Implement reminder completion toggle in `frontend/src/components/FloatingPanel/RemindersTab.tsx`
- [ ] T055 [US2] Implement task status update in `frontend/src/components/FloatingPanel/TasksTab.tsx`
- [ ] T056 [US2] Add ARIA labels and screen reader announcements for reminders/tasks in `frontend/src/components/FloatingPanel/RemindersTab.tsx` and `TasksTab.tsx`

**Checkpoint**: User Stories 1 AND 2 should both work independently. All three tabs display content correctly with real-time updates.

---

## Phase 5: User Story 3 - Control Panel Behavior and Positioning (Priority: P3)

**Goal**: Enable users to drag, minimize, and persist panel state across sessions

**Independent Test**: Drag panel to new position, minimize it, refresh page, verify position and state are restored. Can be tested independently without notifications/reminders/tasks.

### Tests for User Story 3 (MANDATORY) ⚠️

- [ ] T057 [P] [US3] Unit test for usePanelPosition hook (drag logic) in `frontend/tests/unit/usePanelPosition.test.ts`
- [ ] T058 [P] [US3] Unit test for usePanelStorage hook (localStorage persistence) in `frontend/tests/unit/usePanelStorage.test.ts`
- [ ] T059 [P] [US3] Unit test for position boundary clamping in `frontend/tests/unit/usePanelPosition.test.ts`
- [ ] T060 [P] [US3] Component test for PanelHeader drag interaction in `frontend/tests/component/PanelHeader.test.tsx`
- [ ] T061 [P] [US3] Component test for minimize/expand button in `frontend/tests/component/PanelHeader.test.tsx`
- [ ] T062 [P] [US3] E2E smoke test for dragging panel in `frontend/tests/e2e/floating-panel.spec.ts`
- [ ] T063 [P] [US3] E2E smoke test for minimize/expand and state persistence in `frontend/tests/e2e/floating-panel.spec.ts`
- [ ] T064 [P] [US3] Accessibility test for drag handle and minimize button keyboard interaction in `frontend/tests/e2e/floating-panel.spec.ts`

### Implementation for User Story 3

- [ ] T065 [P] [US3] Implement usePanelPosition hook with drag logic in `frontend/src/hooks/usePanelPosition.ts`
- [ ] T066 [P] [US3] Implement usePanelStorage hook for localStorage persistence in `frontend/src/hooks/usePanelStorage.ts`
- [ ] T067 [P] [US3] Implement PanelHeader component with draggable header in `frontend/src/components/FloatingPanel/PanelHeader.tsx`
- [ ] T068 [US3] Implement minimize/expand button in PanelHeader in `frontend/src/components/FloatingPanel/PanelHeader.tsx`
- [ ] T069 [US3] Integrate usePanelPosition into FloatingPanel for drag handling in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [ ] T070 [US3] Integrate usePanelStorage into FloatingPanel for state persistence in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [ ] T071 [US3] Add position boundary clamping to prevent off-screen positioning in `frontend/src/hooks/usePanelPosition.ts`
- [ ] T072 [US3] Implement minimized state rendering (compact view) in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`
- [ ] T073 [US3] Add debouncing to position updates for performance in `frontend/src/hooks/usePanelPosition.ts`
- [ ] T074 [US3] Add ARIA labels to drag handle and minimize button in `frontend/src/components/FloatingPanel/PanelHeader.tsx`
- [ ] T075 [US3] Add keyboard shortcuts for minimize/expand (e.g., Escape to minimize) in `frontend/src/components/FloatingPanel/FloatingPanel.tsx`

**Checkpoint**: All user stories should now be independently functional. Panel can be dragged, minimized, and state persists across sessions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T076 [P] Write ADR for floating panel architecture in `/docs/adr/floating-panel-architecture.md`
- [ ] T077 [P] Create user guide documenting panel features and keyboard shortcuts in `/docs/floating-panel-guide.md`
- [ ] T078 [P] Run full accessibility audit using axe-core and manual keyboard testing
- [ ] T079 [P] Performance profiling and optimization (ensure <50KB bundle, <100ms interactions)
- [ ] T080 [P] Code cleanup and refactoring across all components
- [ ] T081 [P] Add JSDoc comments to all hooks and components in `frontend/src/`
- [ ] T082 Run full test suite: unit, component, E2E, and accessibility tests
- [ ] T083 Verify feature flag integration and rollout configuration
- [ ] T084 Update release notes with floating panel feature description and flag status
- [ ] T085 Create deployment checklist and validation script
- [ ] T086 Validate quickstart.md scenarios work end-to-end
- [ ] T087 Performance benchmark: panel load time, tab switch time, real-time update latency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but integrates with shared panel)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but integrates with shared panel)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before hooks
- Hooks before integration
- Core implementation before real-time updates
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for useFloatingPanel hook (tab state management) in frontend/tests/unit/useFloatingPanel.test.ts"
Task: "Unit test for notification data fetching in frontend/tests/unit/panelApi.test.ts"
Task: "Component test for NotificationsTab rendering in frontend/tests/component/NotificationsTab.test.tsx"
Task: "Component test for notification item click interaction in frontend/tests/component/NotificationsTab.test.tsx"

# Launch all components for User Story 1 together:
Task: "Implement useFloatingPanel hook for tab state management in frontend/src/hooks/useFloatingPanel.ts"
Task: "Implement NotificationsTab component in frontend/src/components/FloatingPanel/NotificationsTab.tsx"
Task: "Implement NotificationItem component for displaying individual notifications in frontend/src/components/FloatingPanel/NotificationsTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Notifications)
   - Developer B: User Story 2 (Reminders & Tasks)
   - Developer C: User Story 3 (Panel Controls)
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 87
- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 9 tasks
- **Phase 3 (US1 - Notifications)**: 17 tasks (7 tests + 10 implementation)
- **Phase 4 (US2 - Reminders & Tasks)**: 19 tasks (7 tests + 12 implementation)
- **Phase 5 (US3 - Panel Controls)**: 19 tasks (8 tests + 11 implementation)
- **Phase 6 (Polish)**: 12 tasks

### Parallelizable Tasks

- **Phase 1**: 3 tasks can run in parallel
- **Phase 2**: 4 tasks can run in parallel
- **Phase 3**: 7 test tasks + 2 component tasks can run in parallel
- **Phase 4**: 7 test tasks + 4 component tasks can run in parallel
- **Phase 5**: 8 test tasks + 2 hook tasks can run in parallel
- **Phase 6**: 7 tasks can run in parallel

### Independent Test Criteria

- **US1**: Notifications display, update in real-time, are clickable, accessible
- **US2**: Reminders and Tasks display with sorting/status, update in real-time, accessible
- **US3**: Panel draggable, minimizable, state persists across sessions, accessible

### Suggested MVP Scope

**Recommended MVP**: Complete Phases 1, 2, and 3 (User Story 1 only)

This delivers:
- Floating panel with notifications tab
- Real-time notification updates
- Full accessibility compliance
- Feature flag integration
- ~500 LOC frontend code
- Deployable and testable independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths relative to repository root
