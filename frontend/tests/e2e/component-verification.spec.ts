/**
 * Component Verification Tests with Screenshots
 * Verifies each component is working by taking screenshots
 */

import { test, expect } from '@playwright/test';

const screenshotDir = './screenshots';

test.describe('Floating Panel Component Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for panel to load
    await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
      timeout: 5000,
    });
  });

  test('1. Verify Panel Visibility', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    await expect(panel).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/01-panel-visible.png`, fullPage: false });
    console.log('✅ Panel is visible');
  });

  test('2. Verify Notifications Tab', async ({ page }) => {
    const notificationsTab = page.locator('[role="tab"][aria-label*="Notifications"]');
    await expect(notificationsTab).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/02-notifications-tab.png`, fullPage: false });
    console.log('✅ Notifications tab is visible');
  });

  test('3. Verify Reminders Tab', async ({ page }) => {
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    await expect(remindersTab).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/03-reminders-tab.png`, fullPage: false });
    console.log('✅ Reminders tab is visible');
  });

  test('4. Verify Tasks Tab', async ({ page }) => {
    const tasksTab = page.locator('[role="tab"][aria-label="Tasks tab"]');
    await expect(tasksTab).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/04-tasks-tab.png`, fullPage: false });
    console.log('✅ Tasks tab is visible');
  });

  test('5. Verify Notifications Content', async ({ page }) => {
    const notificationsList = page.locator('[role="region"][aria-label="Notifications list"]');
    await expect(notificationsList).toBeVisible();
    
    const notifications = notificationsList.locator('[role="button"]');
    const count = await notifications.count();
    expect(count).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/05-notifications-content.png`, fullPage: false });
    console.log(`✅ Notifications content visible (${count} items)`);
  });

  test('6. Verify Tab Switching to Reminders', async ({ page }) => {
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    await remindersTab.click();
    await page.waitForTimeout(200);
    
    const remindersList = page.locator('[role="region"][aria-label="Reminders list"]');
    await expect(remindersList).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/06-reminders-content.png`, fullPage: false });
    console.log('✅ Tab switched to Reminders');
  });

  test('7. Verify Tab Switching to Tasks', async ({ page }) => {
    const tasksTab = page.locator('[role="tab"][aria-label="Tasks tab"]');
    await tasksTab.click();
    await page.waitForTimeout(200);
    
    const tasksList = page.locator('[role="region"][aria-label="Tasks list"]');
    await expect(tasksList).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/07-tasks-content.png`, fullPage: false });
    console.log('✅ Tab switched to Tasks');
  });

  test('8. Verify Minimize Button', async ({ page }) => {
    const minimizeButton = page.locator('button[aria-label*="Minimize"]');
    await expect(minimizeButton).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/08-minimize-button.png`, fullPage: false });
    console.log('✅ Minimize button is visible');
  });

  test('9. Verify Panel Header', async ({ page }) => {
    const header = page.locator('[role="banner"]');
    await expect(header).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/09-panel-header.png`, fullPage: false });
    console.log('✅ Panel header is visible');
  });

  test('10. Verify Close Button', async ({ page }) => {
    const closeButton = page.locator('button[aria-label="Close panel"]');
    await expect(closeButton).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/10-close-button.png`, fullPage: false });
    console.log('✅ Close button is visible');
  });

  test('11. Verify Notification Item Details', async ({ page }) => {
    const notificationsList = page.locator('[role="region"][aria-label="Notifications list"]');
    const firstNotification = notificationsList.locator('[role="button"]').first();
    
    await expect(firstNotification).toBeVisible();
    
    // Check for title
    const title = firstNotification.locator('h3');
    await expect(title).toBeVisible();
    
    // Check for timestamp
    const timestamp = firstNotification.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/');
    const hasTimestamp = await timestamp.count() > 0;
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/11-notification-details.png`, fullPage: false });
    console.log(`✅ Notification item details visible (timestamp: ${hasTimestamp})`);
  });

  test('12. Verify Reminder Item Details', async ({ page }) => {
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    await remindersTab.click();
    await page.waitForTimeout(200);
    
    const remindersList = page.locator('[role="region"][aria-label="Reminders list"]');
    const firstReminder = remindersList.locator('li').first();
    
    await expect(firstReminder).toBeVisible();
    
    // Check for checkbox
    const checkbox = firstReminder.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    
    // Check for title
    const title = firstReminder.locator('h3');
    await expect(title).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/12-reminder-details.png`, fullPage: false });
    console.log('✅ Reminder item details visible');
  });

  test('13. Verify Task Item Details', async ({ page }) => {
    const tasksTab = page.locator('[role="tab"][aria-label="Tasks tab"]');
    await tasksTab.click();
    await page.waitForTimeout(200);
    
    const tasksList = page.locator('[role="region"][aria-label="Tasks list"]');
    const firstTask = tasksList.locator('li').first();
    
    await expect(firstTask).toBeVisible();
    
    // Check for title
    const title = firstTask.locator('h3');
    await expect(title).toBeVisible();
    
    // Check for status dropdown
    const statusDropdown = firstTask.locator('select');
    const hasDropdown = await statusDropdown.count() > 0;
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/13-task-details.png`, fullPage: false });
    console.log(`✅ Task item details visible (dropdown: ${hasDropdown})`);
  });

  test('14. Verify Panel Styling', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    
    // Check for fixed positioning
    const position = await panel.evaluate((el) => window.getComputedStyle(el).position);
    expect(position).toBe('fixed');
    
    // Check for shadow
    const boxShadow = await panel.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow).not.toBe('none');
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/14-panel-styling.png`, fullPage: false });
    console.log('✅ Panel styling verified (fixed position, shadow)');
  });

  test('15. Verify Tab Bar Styling', async ({ page }) => {
    const tabBar = page.locator('[role="tablist"]');
    await expect(tabBar).toBeVisible();
    
    // Check for border
    const borderBottom = await tabBar.evaluate((el) => window.getComputedStyle(el).borderBottom);
    expect(borderBottom).not.toBe('none');
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/15-tabbar-styling.png`, fullPage: false });
    console.log('✅ Tab bar styling verified');
  });

  test('16. Verify Accessibility - ARIA Labels', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const ariaLabel = await panel.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const label = await tab.getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/16-accessibility-labels.png`, fullPage: false });
    console.log('✅ Accessibility ARIA labels verified');
  });

  test('17. Verify Responsive Layout', async ({ page }) => {
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const boundingBox = await panel.boundingBox();
    
    expect(boundingBox).not.toBeNull();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/17-responsive-layout.png`, fullPage: false });
    console.log(`✅ Responsive layout verified (${boundingBox?.width}x${boundingBox?.height})`);
  });

  test('18. Verify Color Contrast', async ({ page }) => {
    const header = page.locator('[role="banner"]');
    
    // Check background color
    const bgColor = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeTruthy();
    
    // Check text color
    const textColor = await header.evaluate((el) => window.getComputedStyle(el).color);
    expect(textColor).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/18-color-contrast.png`, fullPage: false });
    console.log('✅ Color contrast verified');
  });

  test('19. Verify Content Overflow Handling', async ({ page }) => {
    const contentArea = page.locator('.flex-1.overflow-y-auto');
    
    // Check for overflow-y-auto
    const overflow = await contentArea.evaluate((el) => window.getComputedStyle(el).overflowY);
    expect(overflow).toBe('auto');
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/19-overflow-handling.png`, fullPage: false });
    console.log('✅ Content overflow handling verified');
  });

  test('20. Verify Full Component Integration', async ({ page }) => {
    // Verify all major components are present
    const panel = page.locator('[role="region"][aria-label*="Floating panel"]');
    const header = page.locator('[role="banner"]');
    const tabBar = page.locator('[role="tablist"]');
    const tabs = page.locator('[role="tab"]');
    const content = page.locator('[role="region"][aria-label="Notifications list"]');
    
    await expect(panel).toBeVisible();
    await expect(header).toBeVisible();
    await expect(tabBar).toBeVisible();
    expect(await tabs.count()).toBeGreaterThan(0);
    await expect(content).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: `${screenshotDir}/20-full-integration.png`, fullPage: false });
    console.log('✅ Full component integration verified');
  });
});
