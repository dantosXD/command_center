# Manual UI Testing Guide - Phase 3 Calendar & Reminders

## Quick Start

**Dev Server Running**: http://localhost:5173/

### Open in Browser
```bash
# Copy and paste into browser address bar:
http://localhost:5173/

# Or if you have a terminal:
start http://localhost:5173/  # Windows
open http://localhost:5173/   # Mac
xdg-open http://localhost:5173/  # Linux
```

---

## Component Testing Guide

### 1. Calendar Layout (Main Container)
**File**: `frontend/src/components/Calendar.svelte`

**What to Look For**:
- [ ] Header section is sticky (stays at top when scrolling)
- [ ] Navigation buttons visible: Previous, Today, Next
- [ ] View switcher visible: Month, Week, Day (with icons)
- [ ] Current date/month displayed in header
- [ ] Calendar content area below header
- [ ] Month/year picker available

**How to Test**:
1. Scroll down the calendar
   - Header should stay visible at top
2. Click "Previous" button
   - Should go to previous month/week/day
3. Click "Today" button
   - Should jump to current date
4. Click "Next" button
   - Should go to next month/week/day

---

### 2. Month View
**File**: `frontend/src/components/CalendarMonthView.svelte`

**What to Look For**:
- [ ] 7 column grid (Sunday through Saturday)
- [ ] Weekday headers (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- [ ] Calendar cells with dates
- [ ] Previous/next month days in lighter color (grayed out)
- [ ] Today's date highlighted (blue border/background)
- [ ] Event cards showing in cells (if mock data present)
- [ ] All-day events with yellow background
- [ ] Timed events with blue background

**How to Test**:
1. **Visual Check**:
   - Count columns (should be 7)
   - Verify weekday labels

2. **Navigation**:
   - Click "Previous" → month should go back
   - Click "Next" → month should advance
   - Click "Today" → should highlight current date

3. **Event Visibility**:
   - Look for event cards in cells
   - All-day events should be yellow
   - Timed events should show time (e.g., "2:30 PM")

4. **Responsiveness**:
   - Open browser DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Resize to mobile (375px width)
   - Month view should compress but remain readable

---

### 3. Week View
**File**: `frontend/src/components/CalendarWeekView.svelte`

**What to Look For**:
- [ ] 7 columns for days (Monday-Sunday or Sun-Sat)
- [ ] Time labels on left (12 AM, 1 AM, 2 AM, ..., 11 PM)
- [ ] Hourly slots (grid rows)
- [ ] All-day event section at top (yellow background)
- [ ] Timed events as colored blocks (blue)
- [ ] Event blocks have correct height (duration proportional)
- [ ] Current time indicator (red line with dot)
- [ ] Sticky time column (doesn't scroll horizontally)

**How to Test**:
1. **Visual Inspection**:
   - Count columns (should be 7)
   - Count time rows (should be 24 for each hour)
   - Look for events as colored blocks

2. **All-Day Section**:
   - All-day events should appear in top section
   - Should have yellow background
   - Should not have time display

3. **Timed Events**:
   - Events should start at correct hour
   - Event height should represent duration
   - Example: 1-hour event = 60px tall, 2-hour event = 120px tall

4. **Current Time Indicator**:
   - Should see red line at current hour
   - Red dot on left side of line

5. **Scrolling**:
   - Scroll left/right → time column should stay visible
   - Scroll up/down → time column should scroll with content

6. **Mobile Responsiveness**:
   - Resize to mobile (375px)
   - Week view should NOT be visible or hide
   - Day view should appear instead

---

### 4. Day View
**File**: `frontend/src/components/CalendarDayView.svelte`

**What to Look For**:
- [ ] Single day displayed
- [ ] Date header (e.g., "Tuesday, April 15, 2025")
- [ ] All-day event section at top
- [ ] 24-hour timeline (00:00 to 23:00)
- [ ] Time labels on left
- [ ] Timed events as colored blocks
- [ ] Current time indicator (red line)
- [ ] Page auto-scrolls to current time on load

**How to Test**:
1. **Visual Check**:
   - See date in header
   - Count 24 hour slots
   - All-day events visible at top

2. **Current Time**:
   - Page should auto-scroll to current hour
   - Red line should be visible
   - Red dot on left side of line

3. **Events**:
   - Timed events should appear in correct hour
   - All-day events should be in separate section

4. **Navigation**:
   - Click "Previous" → should go to previous day
   - Click "Next" → should go to next day

---

### 5. Event Creation Dialog
**File**: `frontend/src/components/EventCreateDialog.svelte`

**What to Look For**:
- [ ] Modal dialog with semi-transparent backdrop
- [ ] Close button (X) in top right
- [ ] Form fields:
  - [ ] Title input (required, has asterisk *)
  - [ ] Description textarea
  - [ ] Location input
  - [ ] All-day checkbox
  - [ ] Start Date picker
  - [ ] Start Time picker
  - [ ] End Date picker
  - [ ] End Time picker
  - [ ] Timezone display (disabled)
  - [ ] Recurrence dropdown
  - [ ] Attendee email input + Add button
- [ ] Cancel button (bottom left)
- [ ] Create Event button (bottom right, primary color)

**How to Test**:
1. **Open Dialog**:
   - Click on a date in Month view
   - Click on a time slot in Week/Day view
   - Dialog should open with backdrop

2. **Fill Form**:
   - Title: "Team Standup"
   - Description: "Weekly sync with team"
   - Location: "Conference Room A"
   - Start Date: Today
   - Start Time: 10:00 AM
   - End Time: 10:30 AM

3. **Test All-Day**:
   - Check "All-day" checkbox
   - Start Time and End Time fields should disappear
   - Only date pickers should remain
   - Uncheck "All-day" → time fields should reappear

4. **Test Recurrence**:
   - Click "Recurrence" dropdown
   - Options should be: Does not repeat, Daily, Weekly, Monthly, Yearly, Custom
   - Select "Weekly"

5. **Add Attendee**:
   - Enter email: test@example.com
   - Click "Add" button
   - Email should appear as a chip/tag with X to remove
   - Add another attendee to test multiple

6. **Submit**:
   - Click "Create Event"
   - Dialog should close
   - Event should appear on calendar
   - Toast notification should show success message

---

### 6. Event Details Panel
**File**: `frontend/src/components/EventDetailsPanel.svelte`

**What to Look For**:
- [ ] Panel appears on right side (desktop) or bottom (mobile)
- [ ] Event title as heading
- [ ] Date and time (formatted)
- [ ] Duration (calculated, e.g., "1h 30m")
- [ ] Location (if present)
- [ ] Description (if present)
- [ ] All-day badge (yellow, if applicable)
- [ ] Attendees list with RSVP status
- [ ] RSVP buttons: Accept, Maybe, Decline
- [ ] Action buttons: Edit, Delete, Export
- [ ] Close button (X in top right)

**How to Test**:
1. **Open Panel**:
   - Click on an event in calendar
   - Panel should open on right (desktop) or bottom (mobile)

2. **View Details**:
   - Check all fields are populated correctly
   - Time should match calendar display
   - Duration should be calculated correctly
   - All-day event should show yellow badge

3. **Test RSVP**:
   - Click "Accept" button
   - Button should change color/highlight
   - Status should update
   - Toast notification should appear
   - Click "Maybe" → button changes, status updates
   - Click "Decline" → button changes, status updates

4. **Test Edit**:
   - Click "Edit" button
   - EventCreateDialog should open with event data pre-filled

5. **Test Delete**:
   - Click "Delete" button
   - Confirmation dialog should appear
   - Click "Delete" to confirm
   - Event should disappear from calendar
   - Toast notification should show deletion confirmation
   - Panel should close

6. **Test Export**:
   - Click "Export" button
   - Event should be exported as .ics file

---

### 7. Timezone Display
**File**: `frontend/src/lib/utils/timezone.ts`

**What to Look For**:
- [ ] All times displayed in user's local timezone
- [ ] Timezone setting shows in EventCreateDialog (disabled field)
- [ ] Timezone auto-detects from browser settings

**How to Test**:
1. **Check Timezone**:
   - Open EventCreateDialog
   - Look at "Timezone" field
   - Should show your local timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")

2. **Create Event and Check Display**:
   - Create event at "2:00 PM"
   - Check all three views (Month/Week/Day)
   - All should show "2:00 PM" consistently

3. **Verify Consistency**:
   - Create event with specific time
   - Close browser, reopen
   - Time should remain consistent (stored in UTC, displayed in your timezone)

---

## Accessibility Testing

### Keyboard Navigation
**What to Test**:
- [ ] Tab key navigates through all interactive elements
- [ ] Focus indicator visible on focused element (blue outline)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modal dialogs
- [ ] Logical tab order (left-to-right, top-to-bottom)

**How to Test**:
1. Press Tab repeatedly
   - Should cycle through: buttons, links, form inputs, dialogs
   - Should wrap around (after last element, goes to first)

2. Open EventCreateDialog
   - Press Tab
   - Focus should be trapped in dialog (won't leave to background)
   - Press Escape
   - Dialog should close

3. Navigate in Month view
   - Tab to date cell
   - Press Enter
   - Should open EventCreateDialog

### Color Contrast
**How to Test**:
1. Open Chrome DevTools (F12)
2. Right-click on event → Inspect
3. DevTools → Colors tab
4. Check contrast ratio (should be ≥4.5:1 for normal text)

### Screen Reader (Optional)
**How to Test**:
1. Enable Windows Narrator (Win+Enter)
2. Or use NVDA/JAWS if installed
3. Navigate calendar with arrow keys
4. Should hear:
   - Heading: "Calendar, navigation region"
   - Button: "Previous button, navigate"
   - Events: "Team Standup, event, 2:00 PM"

---

## Responsive Design Testing

### Desktop (1440px+)
1. Open browser full screen
2. All three calendar views (Month/Week/Day) should be accessible
3. Calendar should span full width
4. No horizontal scrolling needed

### Tablet (768px)
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPad" or "Tablet" preset
4. Calendar should be responsive
5. No horizontal scrolling for main content

### Mobile (375px)
1. Toggle device toolbar
2. Select "iPhone SE" or set width to 375px
3. Test:
   - [ ] Week view hidden (Month or Day view shown)
   - [ ] Day view visible and full width
   - [ ] All buttons clickable (not too small)
   - [ ] Form inputs accessible
   - [ ] No horizontal scrolling for main content
   - [ ] Touch areas ≥44px×44px

---

## Performance Testing

### Load Time
**How to Test**:
1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Click Record circle
4. Reload page
5. Click Record again to stop
6. Check metrics:
   - Largest Contentful Paint (LCP): should be <2.5s
   - Total Blocking Time (TBT): should be <200ms
   - Cumulative Layout Shift (CLS): should be <0.1

### Smooth Interactions
**How to Test**:
1. While recording performance (above)
2. Click on events, open dialogs
3. Switch between calendar views
4. Scroll calendar
5. Check for long tasks (>50ms) → should be minimal

---

## Test Execution Checklist

### Before Testing
- [ ] Dev server running (http://localhost:5173/)
- [ ] Chrome/Firefox browser open
- [ ] DevTools available (F12)
- [ ] No console errors

### Component Testing
- [ ] Calendar Layout → Navigation works
- [ ] Month View → 7-column grid, today highlighted
- [ ] Week View → 24-hour timeline, all-day section
- [ ] Day View → Current time indicator, auto-scroll
- [ ] EventCreateDialog → Form fields, validation
- [ ] EventDetailsPanel → RSVP buttons, delete action

### Interaction Testing
- [ ] Create event → Appears on calendar
- [ ] Edit event → Opens form with pre-filled data
- [ ] Delete event → Event removed, confirmation shown
- [ ] RSVP event → Status updates
- [ ] Export event → .ics file downloads

### Accessibility Testing
- [ ] Tab navigation → All elements reachable
- [ ] Escape key → Dialog closes
- [ ] Focus indicator → Visible on all elements
- [ ] Color contrast → Readable (4.5:1 ratio)
- [ ] Keyboard-only → All functions usable without mouse

### Responsive Testing
- [ ] Desktop (1440px) → Full layout
- [ ] Tablet (768px) → Responsive
- [ ] Mobile (375px) → Week view hides, Day view shows

### Performance Testing
- [ ] Load time → <2.5s (LCP)
- [ ] Interactions → Smooth, no jank
- [ ] Memory → No memory leaks on repeated actions

---

## Expected Issues & Workarounds

### Issue 1: Missing favicon
- **Symptom**: Icon missing in browser tab
- **Impact**: Visual only, app still functions
- **Workaround**: None needed for testing

### Issue 2: Mock data only
- **Symptom**: No real events from database
- **Impact**: Calendar shows mock events only
- **Workaround**: Backend integration needed (Sprint 3)

### Issue 3: No persistent storage
- **Symptom**: Creating event doesn't save (no backend)
- **Impact**: Events disappear on page reload
- **Workaround**: Backend integration needed (Sprint 3)

---

## Success Criteria

✅ **Phase 3 Frontend Testing Complete** when:
1. All calendar views render correctly
2. Event creation dialog works (form validation, submit)
3. Event details panel displays and allows RSVP
4. Keyboard navigation works without mouse
5. All views responsive on mobile (375px)
6. No console errors
7. Performance <2.5s load time
8. Color contrast meets WCAG AA (4.5:1)

---

## Next Steps

After UI testing:
1. Document any issues found in GitHub issues
2. Proceed to Sprint 3 (backend Edge Functions)
3. Add Supabase integration for persistent storage
4. Add real event data instead of mock data

**Timeline**: UI testing should take ~30-45 minutes for comprehensive coverage

**Documentation**:
- UI Test Report: `UI_TEST_REPORT.md`
- Testing Guide: `MANUAL_UI_TESTING_GUIDE.md`
- Risk Mitigation: `PHASE_3_SPRINT_3_RISK_MITIGATION.md`
- Next Actions: `PHASE_3_NEXT_ACTIONS.md`

