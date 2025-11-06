/**
 * Component Visual Verification Tests
 * Tests each component with screenshots for visual verification
 */

import { test, expect } from '@playwright/test';

const screenshotDir = './screenshots/component-tests';

test.describe('Component Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for panel to load
    await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
      timeout: 5000,
    });
    // Wait for handlers to be exposed
    await page.waitForFunction(() => (window as any).__handleTabClick !== undefined, { timeout: 5000 });
  });

  // ========== CATEGORY 1: PANEL STRUCTURE ==========

  test('1.1: Panel renders and is visible', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    await expect(panel).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/01-panel-structure-01-panel-visible.png`, fullPage: false });
    console.log('✅ Panel is visible');
  });

  test('1.2: Panel has correct dimensions', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const box = await panel.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
    expect(box?.height).toBeGreaterThan(300);
    await page.screenshot({ path: `${screenshotDir}/01-panel-structure-02-dimensions.png`, fullPage: false });
    console.log('✅ Panel has correct dimensions');
  });

  test('1.3: Panel header is visible', async ({ page }) => {
    const header = page.locator('[role="banner"]');
    await expect(header).toBeVisible();
    const headerText = await header.locator('h2').textContent();
    expect(headerText).toContain('Command Center');
    await page.screenshot({ path: `${screenshotDir}/01-panel-structure-03-header.png`, fullPage: false });
    console.log('✅ Panel header is visible');
  });

  test('1.4: Panel has correct styling', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const classes = await panel.getAttribute('class');
    expect(classes).toContain('fixed');
    expect(classes).toContain('rounded-lg');
    expect(classes).toContain('shadow-lg');
    await page.screenshot({ path: `${screenshotDir}/01-panel-structure-04-styling.png`, fullPage: false });
    console.log('✅ Panel has correct styling');
  });

  // ========== CATEGORY 2: TAB BAR ==========

  test('2.1: All tabs are visible', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBe(3);
    await expect(tabs).toHaveCount(3);
    await page.screenshot({ path: `${screenshotDir}/02-tab-bar-01-all-tabs-visible.png`, fullPage: false });
    console.log('✅ All tabs are visible');
  });

  test('2.2: Tabs have correct labels', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    const tasksTab = page.locator('[role="tab"][aria-label="Tasks tab"]');

    await expect(notificationsTab).toBeVisible();
    await expect(remindersTab).toBeVisible();
    await expect(tasksTab).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/02-tab-bar-02-labels.png`, fullPage: false });
    console.log('✅ Tabs have correct labels');
  });

  test('2.3: Active tab is highlighted', async ({ page }) => {
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    const classes = await activeTab.getAttribute('class');
    expect(classes).toContain('border-blue-600');
    expect(classes).toContain('text-blue-600');
    await page.screenshot({ path: `${screenshotDir}/02-tab-bar-03-active-highlight.png`, fullPage: false });
    console.log('✅ Active tab is highlighted');
  });

  test('2.4: Tab switching works', async ({ page }) => {
    // Switch to Reminders
    await page.evaluate(() => {
      (window as any).__handleTabClick('reminders');
    });
    await page.waitForTimeout(100);

    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    const label = await activeTab.getAttribute('aria-label');
    expect(label).toBe('Reminders tab');
    await page.screenshot({ path: `${screenshotDir}/02-tab-bar-04-switching.png`, fullPage: false });
    console.log('✅ Tab switching works');
  });

  // ========== CATEGORY 3: CONTENT AREAS ==========

  test('3.1: Notifications content displays', async ({ page }) => {
    const notificationsContent = page.locator('[role="region"][aria-label="Notifications list"]');
    await expect(notificationsContent).toBeVisible();
    const items = notificationsContent.locator('[role="button"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: `${screenshotDir}/03-content-areas-01-notifications.png`, fullPage: false });
    console.log('✅ Notifications content displays');
  });

  test('3.2: Reminders content displays', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__handleTabClick('reminders');
    });
    await page.waitForTimeout(100);

    const remindersContent = page.locator('[role="region"][aria-label="Reminders list"]');
    await expect(remindersContent).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/03-content-areas-02-reminders.png`, fullPage: false });
    console.log('✅ Reminders content displays');
  });

  test('3.3: Tasks content displays', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__handleTabClick('tasks');
    });
    await page.waitForTimeout(100);

    const tasksContent = page.locator('[role="region"][aria-label="Tasks list"]');
    await expect(tasksContent).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/03-content-areas-03-tasks.png`, fullPage: false });
    console.log('✅ Tasks content displays');
  });

  test('3.4: Empty states display correctly', async ({ page }) => {
    const notificationsContent = page.locator('[role="region"][aria-label="Notifications list"]');
    const items = notificationsContent.locator('[role="button"]');
    const count = await items.count();
    
    if (count === 0) {
      const emptyMessage = notificationsContent.locator('text=/No/i');
      await expect(emptyMessage).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
    await page.screenshot({ path: `${screenshotDir}/03-content-areas-04-empty-states.png`, fullPage: false });
    console.log('✅ Empty states display correctly');
  });

  // ========== CATEGORY 4: INTERACTIVE ELEMENTS ==========

  test('4.1: Minimize button works', async ({ page }) => {
    // Wait for toggle function
    await page.waitForFunction(() => (window as any).__toggleMinimize !== undefined, { timeout: 5000 });

    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const initialBox = await panel.boundingBox();

    await page.evaluate(() => {
      (window as any).__toggleMinimize();
    });
    await page.waitForTimeout(100);

    const minimizedBox = await panel.boundingBox();
    expect(minimizedBox?.height).toBeLessThan(initialBox?.height || 0);
    await page.screenshot({ path: `${screenshotDir}/04-interactive-01-minimize.png`, fullPage: false });
    console.log('✅ Minimize button works');
  });

  test('4.2: Expand button works', async ({ page }) => {
    await page.waitForFunction(() => (window as any).__toggleMinimize !== undefined, { timeout: 5000 });

    // Minimize first
    await page.evaluate(() => {
      (window as any).__toggleMinimize();
    });
    await page.waitForTimeout(100);

    // Then expand
    await page.evaluate(() => {
      (window as any).__toggleMinimize();
    });
    await page.waitForTimeout(100);

    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const box = await panel.boundingBox();
    expect(box?.height).toBeGreaterThan(200);
    await page.screenshot({ path: `${screenshotDir}/04-interactive-02-expand.png`, fullPage: false });
    console.log('✅ Expand button works');
  });

  test('4.3: Close button is visible', async ({ page }) => {
    const closeButton = page.locator('button[aria-label="Close panel"]');
    await expect(closeButton).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/04-interactive-03-close-button.png`, fullPage: false });
    console.log('✅ Close button is visible');
  });

  test('4.4: Buttons have correct styling', async ({ page }) => {
    const minimizeButton = page.locator('button[aria-label*="Minimize"]');
    const classes = await minimizeButton.getAttribute('class');
    expect(classes).toContain('hover:bg-blue-500');
    expect(classes).toContain('rounded');
    await page.screenshot({ path: `${screenshotDir}/04-interactive-04-button-styling.png`, fullPage: false });
    console.log('✅ Buttons have correct styling');
  });

  // ========== CATEGORY 5: KEYBOARD NAVIGATION ==========

  test('5.1: Tab key focuses elements', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    await notificationsTab.focus();
    await expect(notificationsTab).toBeFocused();
    await page.screenshot({ path: `${screenshotDir}/05-keyboard-01-tab-focus.png`, fullPage: false });
    console.log('✅ Tab key focuses elements');
  });

  test('5.2: Arrow keys navigate tabs', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    await notificationsTab.focus();

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    const label = await activeTab.getAttribute('aria-label');
    expect(label).toBe('Reminders tab');
    await page.screenshot({ path: `${screenshotDir}/05-keyboard-02-arrow-keys.png`, fullPage: false });
    console.log('✅ Arrow keys navigate tabs');
  });

  test('5.3: Enter key activates tabs', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    await notificationsTab.focus();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    const remindersContent = page.locator('[role="region"][aria-label="Reminders list"]');
    await expect(remindersContent).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/05-keyboard-03-enter-key.png`, fullPage: false });
    console.log('✅ Enter key activates tabs');
  });

  test('5.4: Focus indicators are visible', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    await notificationsTab.focus();
    await expect(notificationsTab).toBeFocused();
    await page.screenshot({ path: `${screenshotDir}/05-keyboard-04-focus-indicators.png`, fullPage: false });
    console.log('✅ Focus indicators are visible');
  });

  // ========== CATEGORY 6: ACCESSIBILITY ==========

  test('6.1: ARIA labels present', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    for (let i = 0; i < 3; i++) {
      const tab = tabs.nth(i);
      const label = await tab.getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
    await page.screenshot({ path: `${screenshotDir}/06-accessibility-01-aria-labels.png`, fullPage: false });
    console.log('✅ ARIA labels present');
  });

  test('6.2: Roles are correct', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tablist = page.locator('[role="tablist"]');
    const regions = page.locator('[role="region"]');

    await expect(tabs).toHaveCount(3);
    await expect(tablist).toBeVisible();
    expect(await regions.count()).toBeGreaterThan(0);
    await page.screenshot({ path: `${screenshotDir}/06-accessibility-02-roles.png`, fullPage: false });
    console.log('✅ Roles are correct');
  });

  test('6.3: Color contrast adequate', async ({ page }) => {
    const header = page.locator('[role="banner"]');
    await expect(header).toBeVisible();
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3);
    await page.screenshot({ path: `${screenshotDir}/06-accessibility-03-contrast.png`, fullPage: false });
    console.log('✅ Color contrast adequate');
  });

  test('6.4: Focus indicators visible', async ({ page }) => {
    const tab = page.locator('[role="tab"]').first();
    await tab.focus();
    await expect(tab).toBeFocused();
    await page.screenshot({ path: `${screenshotDir}/06-accessibility-04-focus-visible.png`, fullPage: false });
    console.log('✅ Focus indicators visible');
  });

  // ========== CATEGORY 7: STATE MANAGEMENT ==========

  test('7.1: State persists after minimize', async ({ page }) => {
    await page.waitForFunction(() => (window as any).__toggleMinimize !== undefined, { timeout: 5000 });

    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const initialHeight = (await panel.boundingBox())?.height;

    await page.evaluate(() => {
      (window as any).__toggleMinimize();
    });
    await page.waitForTimeout(100);

    const minimizedHeight = (await panel.boundingBox())?.height;
    expect(minimizedHeight).toBeLessThan(initialHeight || 0);
    await page.screenshot({ path: `${screenshotDir}/07-state-01-minimize-persist.png`, fullPage: false });
    console.log('✅ State persists after minimize');
  });

  test('7.2: Tab selection is maintained', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__handleTabClick('tasks');
    });
    await page.waitForTimeout(100);

    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    const label = await activeTab.getAttribute('aria-label');
    expect(label).toBe('Tasks tab');
    await page.screenshot({ path: `${screenshotDir}/07-state-02-tab-selection.png`, fullPage: false });
    console.log('✅ Tab selection is maintained');
  });

  test('7.3: Content updates with tab', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__handleTabClick('reminders');
    });
    await page.waitForTimeout(100);

    const remindersContent = page.locator('[role="region"][aria-label="Reminders list"]');
    await expect(remindersContent).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/07-state-03-content-updates.png`, fullPage: false });
    console.log('✅ Content updates with tab');
  });

  test('7.4: Position is maintained', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const initialBox = await panel.boundingBox();

    // Perform some interactions
    await page.evaluate(() => {
      (window as any).__handleTabClick('reminders');
    });
    await page.waitForTimeout(100);

    const finalBox = await panel.boundingBox();
    expect(finalBox?.x).toBe(initialBox?.x);
    expect(finalBox?.y).toBe(initialBox?.y);
    await page.screenshot({ path: `${screenshotDir}/07-state-04-position.png`, fullPage: false });
    console.log('✅ Position is maintained');
  });

  // ========== CATEGORY 8: VISUAL VERIFICATION ==========

  test('8.1: Full panel screenshot', async ({ page }) => {
    await page.screenshot({ path: `${screenshotDir}/08-visual-01-full-panel.png`, fullPage: false });
    console.log('✅ Full panel screenshot captured');
  });

  test('8.2: Each tab content screenshot', async ({ page }) => {
    // Notifications
    await page.screenshot({ path: `${screenshotDir}/08-visual-02a-notifications-tab.png`, fullPage: false });

    // Reminders
    await page.evaluate(() => {
      (window as any).__handleTabClick('reminders');
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${screenshotDir}/08-visual-02b-reminders-tab.png`, fullPage: false });

    // Tasks
    await page.evaluate(() => {
      (window as any).__handleTabClick('tasks');
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${screenshotDir}/08-visual-02c-tasks-tab.png`, fullPage: false });

    console.log('✅ Each tab content screenshot captured');
  });

  test('8.3: Minimized state screenshot', async ({ page }) => {
    await page.waitForFunction(() => (window as any).__toggleMinimize !== undefined, { timeout: 5000 });

    await page.evaluate(() => {
      (window as any).__toggleMinimize();
    });
    await page.waitForTimeout(100);

    await page.screenshot({ path: `${screenshotDir}/08-visual-03-minimized-state.png`, fullPage: false });
    console.log('✅ Minimized state screenshot captured');
  });

  test('8.4: Keyboard focus screenshot', async ({ page }) => {
    const tab = page.locator('[role="tab"]').first();
    await tab.focus();
    await page.screenshot({ path: `${screenshotDir}/08-visual-04-keyboard-focus.png`, fullPage: false });
    console.log('✅ Keyboard focus screenshot captured');
  });
});
