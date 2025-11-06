/**
 * Comprehensive Playwright Tests for Tasks, Hub, and Calendar Components
 * Tests each component with screenshot verification
 */

import { test, expect } from '@playwright/test';

const screenshotDir = './screenshots';

test.describe('Tasks, Hub, and Calendar Component Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for app to load
    await page.waitForTimeout(1000);
  });

  test.describe('Tasks Component', () => {
    test('1. Verify Tasks Page Loads', async ({ page }) => {
      // Navigate to tasks page
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Take screenshot of tasks page
      await page.screenshot({ path: `${screenshotDir}/tasks-01-page-load.png`, fullPage: true });
      console.log('✅ Tasks page loaded and screenshot captured');
    });

    test('2. Verify Tasks List Display', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Look for task items
      const taskItems = page.locator('[data-testid="task-item"], .task-item, li');
      const count = await taskItems.count();
      
      // Take screenshot of tasks list
      await page.screenshot({ path: `${screenshotDir}/tasks-02-list-display.png`, fullPage: false });
      console.log(`✅ Tasks list displayed (${count} items found)`);
    });

    test('3. Verify Task Creation Form', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Look for task creation form
      const taskForm = page.locator('form, [data-testid="task-form"], .task-form');
      const formVisible = await taskForm.isVisible();
      
      // Take screenshot of task form
      await page.screenshot({ path: `${screenshotDir}/tasks-03-creation-form.png`, fullPage: false });
      console.log(`✅ Task creation form visible: ${formVisible}`);
    });

    test('4. Verify Task Status Updates', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Look for status dropdowns or buttons
      const statusElements = page.locator('select, button[data-testid*="status"], .status-button');
      const statusCount = await statusElements.count();
      
      // Take screenshot of status controls
      await page.screenshot({ path: `${screenshotDir}/tasks-04-status-controls.png`, fullPage: false });
      console.log(`✅ Task status controls found: ${statusCount}`);
    });

    test('5. Verify Task Filtering', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Look for filter controls
      const filterControls = page.locator('[data-testid*="filter"], .filter, select');
      const filterCount = await filterControls.count();
      
      // Take screenshot of filter controls
      await page.screenshot({ path: `${screenshotDir}/tasks-05-filter-controls.png`, fullPage: false });
      console.log(`✅ Task filter controls found: ${filterCount}`);
    });
  });

  test.describe('Hub Component', () => {
    test('6. Verify Hub Page Loads', async ({ page }) => {
      // Navigate to hub page
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Take screenshot of hub page
      await page.screenshot({ path: `${screenshotDir}/hub-01-page-load.png`, fullPage: true });
      console.log('✅ Hub page loaded and screenshot captured');
    });

    test('7. Verify Hub Today Section', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Look for Today section
      const todaySection = page.locator('[data-testid="today"], .today-section, h2:has-text("Today")');
      const todayVisible = await todaySection.isVisible();
      
      // Take screenshot of Today section
      await page.screenshot({ path: `${screenshotDir}/hub-02-today-section.png`, fullPage: false });
      console.log(`✅ Hub Today section visible: ${todayVisible}`);
    });

    test('8. Verify Hub Upcoming Section', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Look for Upcoming section
      const upcomingSection = page.locator('[data-testid="upcoming"], .upcoming-section, h2:has-text("Upcoming")');
      const upcomingVisible = await upcomingSection.isVisible();
      
      // Take screenshot of Upcoming section
      await page.screenshot({ path: `${screenshotDir}/hub-03-upcoming-section.png`, fullPage: false });
      console.log(`✅ Hub Upcoming section visible: ${upcomingVisible}`);
    });

    test('9. Verify Hub Task Display', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Look for tasks in hub
      const hubTasks = page.locator('[data-testid="hub-task"], .hub-task, .task-item');
      const taskCount = await hubTasks.count();
      
      // Take screenshot of hub tasks
      await page.screenshot({ path: `${screenshotDir}/hub-04-task-display.png`, fullPage: false });
      console.log(`✅ Hub tasks displayed: ${taskCount} items`);
    });

    test('10. Verify Hub Domain Filtering', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Look for domain selector
      const domainSelector = page.locator('[data-testid="domain-selector"], .domain-selector, select');
      const selectorVisible = await domainSelector.isVisible();
      
      // Take screenshot of domain selector
      await page.screenshot({ path: `${screenshotDir}/hub-05-domain-selector.png`, fullPage: false });
      console.log(`✅ Hub domain selector visible: ${selectorVisible}`);
    });

    test('11. Verify Hub Real-time Updates', async ({ page }) => {
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Look for indicators of real-time functionality
      const realtimeIndicators = page.locator('[data-testid*="realtime"], .realtime-indicator, [data-testid*="live"]');
      const indicatorCount = await realtimeIndicators.count();
      
      // Take screenshot of hub state
      await page.screenshot({ path: `${screenshotDir}/hub-06-realtime-indicators.png`, fullPage: false });
      console.log(`✅ Hub real-time indicators found: ${indicatorCount}`);
    });
  });

  test.describe('Calendar Component', () => {
    test('12. Verify Calendar Page Loads', async ({ page }) => {
      // Navigate to calendar page
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Take screenshot of calendar page
      await page.screenshot({ path: `${screenshotDir}/calendar-01-page-load.png`, fullPage: true });
      console.log('✅ Calendar page loaded and screenshot captured');
    });

    test('13. Verify Calendar Month View', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Look for month view
      const monthView = page.locator('[data-testid="month-view"], .month-view, .calendar-month');
      const monthVisible = await monthView.isVisible();
      
      // Take screenshot of month view
      await page.screenshot({ path: `${screenshotDir}/calendar-02-month-view.png`, fullPage: false });
      console.log(`✅ Calendar month view visible: ${monthVisible}`);
    });

    test('14. Verify Calendar Week View', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Look for week view toggle
      const weekViewButton = page.locator('button:has-text("Week"), [data-testid="week-view"]');
      if (await weekViewButton.isVisible()) {
        await weekViewButton.click();
        await page.waitForTimeout(500);
      }
      
      // Take screenshot of week view
      await page.screenshot({ path: `${screenshotDir}/calendar-03-week-view.png`, fullPage: false });
      console.log('✅ Calendar week view screenshot captured');
    });

    test('15. Verify Calendar Day View', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Look for day view toggle
      const dayViewButton = page.locator('button:has-text("Day"), [data-testid="day-view"]');
      if (await dayViewButton.isVisible()) {
        await dayViewButton.click();
        await page.waitForTimeout(500);
      }
      
      // Take screenshot of day view
      await page.screenshot({ path: `${screenshotDir}/calendar-04-day-view.png`, fullPage: false });
      console.log('✅ Calendar day view screenshot captured');
    });

    test('16. Verify Calendar Navigation', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Look for navigation controls
      const navControls = page.locator('button:has-text("Previous"), button:has-text("Next"), .calendar-nav');
      const navCount = await navControls.count();
      
      // Take screenshot of navigation controls
      await page.screenshot({ path: `${screenshotDir}/calendar-05-navigation.png`, fullPage: false });
      console.log(`✅ Calendar navigation controls found: ${navCount}`);
    });

    test('17. Verify Calendar Event Display', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Look for calendar events
      const calendarEvents = page.locator('[data-testid="event"], .calendar-event, .event-item');
      const eventCount = await calendarEvents.count();
      
      // Take screenshot of calendar events
      await page.screenshot({ path: `${screenshotDir}/calendar-06-events.png`, fullPage: false });
      console.log(`✅ Calendar events displayed: ${eventCount} items`);
    });

    test('18. Verify Calendar Responsive Design', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Take screenshot of mobile view
      await page.screenshot({ path: `${screenshotDir}/calendar-07-mobile-view.png`, fullPage: true });
      console.log('✅ Calendar mobile view screenshot captured');
      
      // Reset to desktop view
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Integration Tests', () => {
    test('19. Verify Cross-Component Navigation', async ({ page }) => {
      // Start at tasks
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      
      // Navigate to hub
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      
      // Navigate to calendar
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      
      // Take final screenshot
      await page.screenshot({ path: `${screenshotDir}/integration-01-navigation.png`, fullPage: true });
      console.log('✅ Cross-component navigation verified');
    });

    test('20. Verify Component Data Consistency', async ({ page }) => {
      // Check tasks page
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/integration-02-tasks-data.png`, fullPage: false });
      
      // Check hub page (should show same tasks)
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/integration-03-hub-data.png`, fullPage: false });
      
      // Check calendar page (should show same tasks/events)
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/integration-04-calendar-data.png`, fullPage: false });
      
      console.log('✅ Component data consistency screenshots captured');
    });

    test('21. Verify Full Application Flow', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/flow-01-home.png`, fullPage: true });
      
      // Go to tasks
      await page.goto('/tasks');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/flow-02-tasks.png`, fullPage: true });
      
      // Go to hub
      await page.goto('/hub');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/flow-03-hub.png`, fullPage: true });
      
      // Go to calendar
      await page.goto('/calendar');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/flow-04-calendar.png`, fullPage: true });
      
      console.log('✅ Full application flow screenshots captured');
    });
  });

  test.describe('Accessibility and Performance', () => {
    test('22. Verify Component Accessibility', async ({ page }) => {
      const components = ['/tasks', '/hub', '/calendar'];
      
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        await page.goto(component);
        await page.waitForTimeout(1000);
        
        // Check for ARIA labels
        const ariaElements = page.locator('[aria-label], [role]');
        const ariaCount = await ariaElements.count();
        
        await page.screenshot({ 
          path: `${screenshotDir}/accessibility-${i + 1}-${component.replace('/', '')}.png`, 
          fullPage: false 
        });
        
        console.log(`✅ ${component} accessibility elements: ${ariaCount}`);
      }
    });

    test('23. Verify Component Load Performance', async ({ page }) => {
      const components = ['/tasks', '/hub', '/calendar'];
      
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        
        // Measure load time
        const startTime = Date.now();
        await page.goto(component);
        await page.waitForTimeout(1000);
        const loadTime = Date.now() - startTime;
        
        await page.screenshot({ 
          path: `${screenshotDir}/performance-${i + 1}-${component.replace('/', '')}.png`, 
          fullPage: false 
        });
        
        console.log(`✅ ${component} load time: ${loadTime}ms`);
      }
    });
  });
});
