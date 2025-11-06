# Floating Panel Tabs - Manual Testing Checklist

**Test Date**: October 31, 2025  
**Tester**: [Your Name]  
**Browser**: [Chrome/Firefox/Safari]  
**URL**: http://localhost:5173

---

## Pre-Test Setup

- [ ] Development server running on localhost:5173
- [ ] Browser console open (F12)
- [ ] Network tab open to monitor API calls
- [ ] No errors in console before starting tests

---

## Test Suite 1: Panel Visibility & Initialization

### T1.1: Panel Appears on Page Load
- [ ] Floating panel is visible on page load
- [ ] Panel appears in bottom-right corner (default position)
- [ ] Panel has proper shadow and border styling
- [ ] Panel is not blocking main content

**Expected**: Panel visible with notifications tab active

### T1.2: Feature Flag Check
- [ ] Open browser console
- [ ] Run: `window.__FEATURE_FLAGS?.floating_panel_tabs`
- [ ] Should return `true` or enabled status

**Expected**: Feature flag is enabled

### T1.3: Panel Dimensions
- [ ] Expanded panel width: ~384px (w-96)
- [ ] Expanded panel height: ~384px (h-96)
- [ ] Panel header height: ~48px (h-12)
- [ ] Tab bar height: ~40px

**Expected**: Dimensions match design specs

---

## Test Suite 2: Tab Navigation

### T2.1: Default Tab (Notifications)
- [ ] Notifications tab is selected by default
- [ ] Tab has `aria-selected="true"`
- [ ] Notifications content is visible
- [ ] Other tabs are not visible

**Expected**: Notifications tab active

### T2.2: Switch to Reminders Tab
- [ ] Click on "Reminders" tab
- [ ] Reminders tab becomes active
- [ ] Notifications content disappears
- [ ] Reminders content appears
- [ ] Tab has `aria-selected="true"`

**Expected**: Reminders tab active and content displayed

### T2.3: Switch to Tasks Tab
- [ ] Click on "Tasks" tab
- [ ] Tasks tab becomes active
- [ ] Reminders content disappears
- [ ] Tasks content appears
- [ ] Tab has `aria-selected="true"`

**Expected**: Tasks tab active and content displayed

### T2.4: Tab Persistence
- [ ] Switch to Reminders tab
- [ ] Minimize panel
- [ ] Expand panel
- [ ] Reminders tab should still be active

**Expected**: Tab selection persists

---

## Test Suite 3: Notifications Tab

### T3.1: Notifications Display
- [ ] Notifications are displayed in a list
- [ ] Each notification shows:
  - [ ] Title
  - [ ] Content/message
  - [ ] Timestamp
  - [ ] Type badge (info/warning/error/success)
- [ ] Unread notifications have blue dot indicator

**Expected**: All notification elements visible

### T3.2: Notification Interaction
- [ ] Click on a notification
- [ ] Notification should be marked as read
- [ ] Blue dot indicator disappears
- [ ] No page navigation occurs

**Expected**: Notification marked as read

### T3.3: Empty State
- [ ] If no notifications exist
- [ ] "No notifications" message appears
- [ ] Message is centered and readable

**Expected**: Empty state message displayed

### T3.4: Loading State
- [ ] On initial load, "Loading notifications..." appears briefly
- [ ] After data loads, notifications appear
- [ ] No loading spinner remains

**Expected**: Loading state clears after data loads

---

## Test Suite 4: Reminders Tab

### T4.1: Reminders Display
- [ ] Reminders are displayed in a list
- [ ] Each reminder shows:
  - [ ] Title
  - [ ] Description (if available)
  - [ ] Due date (📅 format)
  - [ ] Priority badge (Low/Medium/High)
  - [ ] Recurrence indicator (if applicable)
  - [ ] Checkbox for completion

**Expected**: All reminder elements visible

### T4.2: Reminder Completion
- [ ] Click checkbox on a reminder
- [ ] Reminder should be marked as completed
- [ ] Text should have strikethrough
- [ ] Checkbox should be checked

**Expected**: Reminder marked as completed

### T4.3: Reminder Sorting
- [ ] Reminders should be sorted by due date
- [ ] Earliest due date appears first
- [ ] Most recent due date appears last

**Expected**: Reminders sorted chronologically

### T4.4: Priority Indicators
- [ ] Low priority: Gray badge
- [ ] Medium priority: Yellow badge
- [ ] High priority: Red badge

**Expected**: Priority colors correct

---

## Test Suite 5: Tasks Tab

### T5.1: Tasks Display
- [ ] Tasks are displayed in a list
- [ ] Each task shows:
  - [ ] Title
  - [ ] Description (if available)
  - [ ] Status indicator (colored dot)
  - [ ] Priority badge
  - [ ] Due date (if available)
  - [ ] Assignee (if available)
  - [ ] Tags (if available)
  - [ ] Status dropdown

**Expected**: All task elements visible

### T5.2: Task Status Change
- [ ] Click status dropdown on a task
- [ ] Options appear: Open, In Progress, Completed, Blocked
- [ ] Select a new status
- [ ] Task status updates
- [ ] Status indicator color changes

**Expected**: Task status updated

### T5.3: Status Indicators
- [ ] Open: Blue indicator
- [ ] In Progress: Orange indicator
- [ ] Completed: Green indicator
- [ ] Blocked: Red indicator

**Expected**: Status colors correct

### T5.4: Task Priority
- [ ] Low priority: Gray badge
- [ ] Medium priority: Yellow badge
- [ ] High priority: Red badge

**Expected**: Priority colors correct

---

## Test Suite 6: Panel Controls

### T6.1: Minimize Button
- [ ] Click minimize button (chevron down icon)
- [ ] Panel collapses to header only
- [ ] Panel height reduces to ~48px
- [ ] Content disappears

**Expected**: Panel minimized

### T6.2: Expand Button
- [ ] Click expand button (chevron up icon)
- [ ] Panel expands to full size
- [ ] Content reappears
- [ ] Previously active tab is still active

**Expected**: Panel expanded with state preserved

### T6.3: Close Button
- [ ] Click close button (X icon)
- [ ] Panel disappears from view
- [ ] Page content is fully visible

**Expected**: Panel closed

### T6.4: Minimize/Expand Persistence
- [ ] Minimize panel
- [ ] Refresh page (F5)
- [ ] Panel should still be minimized

**Expected**: Minimized state persists

---

## Test Suite 7: Drag Functionality

### T7.1: Drag Panel
- [ ] Click on panel header
- [ ] Drag panel to new position
- [ ] Panel follows mouse movement
- [ ] Panel stays within viewport bounds

**Expected**: Panel draggable

### T7.2: Boundary Clamping
- [ ] Drag panel to right edge
- [ ] Panel should not go off-screen
- [ ] Drag panel to bottom edge
- [ ] Panel should not go off-screen

**Expected**: Panel stays within bounds

### T7.3: Position Persistence
- [ ] Drag panel to new position
- [ ] Refresh page (F5)
- [ ] Panel should be at same position

**Expected**: Position persists

### T7.4: Drag While Minimized
- [ ] Minimize panel
- [ ] Drag minimized panel
- [ ] Panel should still be draggable

**Expected**: Minimized panel draggable

---

## Test Suite 8: Real-Time Updates

### T8.1: WebSocket Connection
- [ ] Open browser console
- [ ] Check Network tab
- [ ] WebSocket connection should be established
- [ ] No connection errors in console

**Expected**: WebSocket connected

### T8.2: Notification Update
- [ ] Add a new notification via API/backend
- [ ] Notification should appear in panel within 1 second
- [ ] No page refresh needed

**Expected**: Real-time update received

### T8.3: Polling Fallback
- [ ] Disable WebSocket in DevTools (Network tab)
- [ ] Panel should still update via polling
- [ ] Updates may take slightly longer (5-10 seconds)

**Expected**: Polling fallback works

---

## Test Suite 9: Accessibility

### T9.1: Keyboard Navigation
- [ ] Press Tab key repeatedly
- [ ] Focus should cycle through:
  - [ ] Minimize button
  - [ ] Close button
  - [ ] Notification tab
  - [ ] Reminders tab
  - [ ] Tasks tab
  - [ ] Content items

**Expected**: All elements keyboard accessible

### T9.2: Tab Key Navigation
- [ ] Tab to a tab button
- [ ] Press Enter to activate
- [ ] Tab content should change

**Expected**: Tab activation via keyboard

### T9.3: Arrow Key Navigation
- [ ] Tab to a tab button
- [ ] Press Arrow Right
- [ ] Next tab should activate
- [ ] Press Arrow Left
- [ ] Previous tab should activate

**Expected**: Arrow keys navigate tabs

### T9.4: ARIA Labels
- [ ] Open browser DevTools
- [ ] Inspect panel element
- [ ] Should have `aria-label="Floating panel..."`
- [ ] Each tab should have `aria-label`
- [ ] Each button should have `aria-label`

**Expected**: All ARIA labels present

### T9.5: Screen Reader Test (if available)
- [ ] Enable screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Navigate to panel
- [ ] Screen reader should announce:
  - [ ] "Floating panel with notifications, reminders, and tasks"
  - [ ] Tab names
  - [ ] Button functions

**Expected**: Screen reader announces content

---

## Test Suite 10: Performance

### T10.1: Load Time
- [ ] Open DevTools Network tab
- [ ] Reload page
- [ ] Panel should be visible within 2 seconds
- [ ] No loading spinner after 2 seconds

**Expected**: <2 second load time

### T10.2: Interaction Response
- [ ] Click on a tab
- [ ] Tab should switch within 100ms
- [ ] No visible lag

**Expected**: <100ms response time

### T10.3: Drag Performance
- [ ] Drag panel smoothly
- [ ] No stuttering or lag
- [ ] Smooth 60fps animation

**Expected**: Smooth drag performance

### T10.4: Memory Usage
- [ ] Open DevTools Memory tab
- [ ] Take heap snapshot
- [ ] Panel should use <10MB memory
- [ ] No memory leaks after 5 minutes

**Expected**: <10MB memory usage

---

## Test Suite 11: Error Handling

### T11.1: API Error
- [ ] Disable network in DevTools
- [ ] Try to load notifications
- [ ] Error message should appear
- [ ] "Error: Failed to fetch" message visible

**Expected**: Error message displayed

### T11.2: Recovery from Error
- [ ] Re-enable network
- [ ] Click refresh or wait for retry
- [ ] Data should load successfully

**Expected**: Recovery works

### T11.3: Graceful Degradation
- [ ] Close WebSocket connection
- [ ] Panel should still function
- [ ] Polling should take over
- [ ] No console errors

**Expected**: Graceful fallback

---

## Test Suite 12: Responsive Design

### T12.1: Desktop View (1920x1080)
- [ ] Panel displays correctly
- [ ] All elements visible
- [ ] No overflow or cutoff

**Expected**: Proper desktop layout

### T12.2: Tablet View (768x1024)
- [ ] Panel displays correctly
- [ ] Panel size adjusts if needed
- [ ] All elements visible

**Expected**: Proper tablet layout

### T12.3: Mobile View (375x667)
- [ ] Panel displays correctly
- [ ] Panel may be smaller but functional
- [ ] All elements accessible

**Expected**: Proper mobile layout

---

## Test Suite 13: Browser Compatibility

### T13.1: Chrome/Edge
- [ ] Panel works correctly
- [ ] All features functional
- [ ] No console errors

**Expected**: Full compatibility

### T13.2: Firefox
- [ ] Panel works correctly
- [ ] All features functional
- [ ] No console errors

**Expected**: Full compatibility

### T13.3: Safari
- [ ] Panel works correctly
- [ ] All features functional
- [ ] No console errors

**Expected**: Full compatibility

---

## Test Suite 14: Data Persistence

### T14.1: Panel State Persistence
- [ ] Minimize panel
- [ ] Switch to Reminders tab
- [ ] Refresh page (F5)
- [ ] Panel should still be minimized
- [ ] Reminders tab should still be active

**Expected**: State persists across refresh

### T14.2: Position Persistence
- [ ] Drag panel to center
- [ ] Refresh page
- [ ] Panel should be at same position

**Expected**: Position persists

### T14.3: localStorage Verification
- [ ] Open DevTools Application tab
- [ ] Check localStorage
- [ ] Should have `floating_panel_state` key
- [ ] Should contain position, minimized, activeTab

**Expected**: localStorage contains panel state

---

## Test Suite 15: Edge Cases

### T15.1: Rapid Tab Switching
- [ ] Rapidly click between tabs
- [ ] Panel should handle without crashing
- [ ] No console errors

**Expected**: Handles rapid switching

### T15.2: Rapid Minimize/Expand
- [ ] Rapidly click minimize/expand
- [ ] Panel should handle without crashing
- [ ] No console errors

**Expected**: Handles rapid toggling

### T15.3: Drag During Load
- [ ] Start dragging panel
- [ ] While dragging, new data loads
- [ ] Panel should continue dragging smoothly

**Expected**: Handles concurrent operations

### T15.4: Multiple Tabs Open
- [ ] Open app in multiple browser tabs
- [ ] Update data in one tab
- [ ] Other tabs should update via polling

**Expected**: Multiple instances work

---

## Summary

**Total Tests**: 80+  
**Passed**: ___  
**Failed**: ___  
**Skipped**: ___  

### Issues Found

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |
| | | | |

### Notes

---

**Tester Signature**: _______________  
**Date**: _______________  
**Time**: _______________
