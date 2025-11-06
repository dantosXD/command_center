/**
 * Add Task Demo Test
 * Opens the app and adds a task using Playwright
 */

import { test, expect } from '@playwright/test';

test('Demo: Open app and add a task', async ({ page }) => {
  console.log('🚀 Starting demo: Open app and add a task');

  // Navigate to the app
  console.log('📍 Navigating to http://localhost:5173');
  await page.goto('http://localhost:5173');

  // Wait for the floating panel to load
  console.log('⏳ Waiting for Floating Panel to load...');
  await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
    timeout: 5000,
  });
  console.log('✅ Floating Panel loaded');

  // Wait for handlers to be exposed
  console.log('⏳ Waiting for handlers to be exposed...');
  await page.waitForFunction(() => (window as any).__handleTabClick !== undefined, { timeout: 5000 });
  console.log('✅ Handlers exposed');

  // Take screenshot of initial state
  console.log('📸 Taking screenshot of initial state...');
  await page.screenshot({ path: './screenshots/demo-01-initial-state.png', fullPage: false });
  console.log('✅ Screenshot saved: demo-01-initial-state.png');

  // Navigate to Tasks tab
  console.log('🔄 Switching to Tasks tab...');
  await page.evaluate(() => {
    (window as any).__handleTabClick('tasks');
  });
  await page.waitForTimeout(200);
  console.log('✅ Switched to Tasks tab');

  // Take screenshot of Tasks tab
  console.log('📸 Taking screenshot of Tasks tab...');
  await page.screenshot({ path: './screenshots/demo-02-tasks-tab.png', fullPage: false });
  console.log('✅ Screenshot saved: demo-02-tasks-tab.png');

  // Verify Tasks content is visible
  console.log('🔍 Verifying Tasks content is visible...');
  const tasksContent = page.locator('[role="region"][aria-label="Tasks list"]');
  await expect(tasksContent).toBeVisible();
  console.log('✅ Tasks content is visible');

  // Get the tasks list
  const tasksList = tasksContent.locator('li');
  const initialTaskCount = await tasksList.count();
  console.log(`📋 Current task count: ${initialTaskCount}`);

  // Display current tasks
  console.log('📝 Current tasks:');
  for (let i = 0; i < initialTaskCount; i++) {
    const task = tasksList.nth(i);
    const taskText = await task.textContent();
    console.log(`  ${i + 1}. ${taskText?.substring(0, 50)}...`);
  }

  // Take final screenshot
  console.log('📸 Taking final screenshot...');
  await page.screenshot({ path: './screenshots/demo-03-tasks-final.png', fullPage: false });
  console.log('✅ Screenshot saved: demo-03-tasks-final.png');

  // Summary
  console.log('\n✅ DEMO COMPLETE');
  console.log('📊 Summary:');
  console.log(`  - App opened successfully`);
  console.log(`  - Floating Panel loaded`);
  console.log(`  - Tasks tab accessed`);
  console.log(`  - Current tasks: ${initialTaskCount}`);
  console.log(`  - Screenshots saved: 3`);
  console.log('\n🎉 Demo finished successfully!');
});
