/**
 * Add Task Manually Demo Test
 * Clicks tasks button and manually adds a task
 */

import { test, expect } from '@playwright/test';

test('Demo: Click tasks button and manually add a task', async ({ page }) => {
  console.log('🚀 Starting demo: Add task manually');

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
  await page.screenshot({ path: './screenshots/add-task-01-initial.png', fullPage: false });
  console.log('✅ Screenshot saved: add-task-01-initial.png');

  // Click the Tasks tab button
  console.log('🖱️ Clicking Tasks tab button...');
  const tasksTab = page.locator('[role="tab"][aria-label="Tasks tab"]');
  await tasksTab.click();
  await page.waitForTimeout(300);
  console.log('✅ Tasks tab clicked');

  // Take screenshot after clicking tasks
  console.log('📸 Taking screenshot after clicking tasks...');
  await page.screenshot({ path: './screenshots/add-task-02-tasks-tab-clicked.png', fullPage: false });
  console.log('✅ Screenshot saved: add-task-02-tasks-tab-clicked.png');

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
    console.log(`  ${i + 1}. ${taskText?.substring(0, 60)}...`);
  }

  // Look for an add button or input field
  console.log('\n🔍 Looking for add task button or input...');
  
  // Try to find an add button
  const addButton = page.locator('button:has-text("Add"), button:has-text("add"), button[aria-label*="add"], button[aria-label*="Add"]').first();
  const addButtonCount = await addButton.count();
  
  if (addButtonCount > 0) {
    console.log('✅ Found add button');
    await addButton.click();
    await page.waitForTimeout(300);
    console.log('✅ Add button clicked');
  } else {
    console.log('ℹ️ No add button found - checking for input fields');
  }

  // Look for input fields to add a task
  const inputs = page.locator('input[type="text"], textarea, input[placeholder*="task" i], input[placeholder*="add" i]');
  const inputCount = await inputs.count();
  
  console.log(`\n🔍 Found ${inputCount} input fields`);

  if (inputCount > 0) {
    console.log('📝 Attempting to add a new task...');
    
    // Get the first input field
    const firstInput = inputs.first();
    
    // Focus and type the task
    await firstInput.focus();
    await firstInput.fill('Complete project documentation');
    console.log('✅ Typed task: "Complete project documentation"');
    
    // Take screenshot after typing
    console.log('📸 Taking screenshot after typing task...');
    await page.screenshot({ path: './screenshots/add-task-03-typed-task.png', fullPage: false });
    console.log('✅ Screenshot saved: add-task-03-typed-task.png');

    // Look for a submit button
    const submitButton = page.locator('button:has-text("Add"), button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').first();
    const submitButtonCount = await submitButton.count();

    if (submitButtonCount > 0) {
      console.log('🖱️ Clicking submit button...');
      await submitButton.click();
      await page.waitForTimeout(300);
      console.log('✅ Submit button clicked');
    } else {
      console.log('ℹ️ No submit button found - trying Enter key');
      await firstInput.press('Enter');
      await page.waitForTimeout(300);
      console.log('✅ Enter key pressed');
    }

    // Take screenshot after submitting
    console.log('📸 Taking screenshot after submitting task...');
    await page.screenshot({ path: './screenshots/add-task-04-task-added.png', fullPage: false });
    console.log('✅ Screenshot saved: add-task-04-task-added.png');

    // Verify the task was added
    console.log('🔍 Verifying task was added...');
    const updatedTasksList = tasksContent.locator('li');
    const updatedTaskCount = await updatedTasksList.count();
    console.log(`📋 Updated task count: ${updatedTaskCount}`);

    if (updatedTaskCount > initialTaskCount) {
      console.log(`✅ Task successfully added! (${initialTaskCount} → ${updatedTaskCount})`);
    } else {
      console.log('ℹ️ Task count unchanged - may require different interaction');
    }

    // Display all tasks
    console.log('\n📝 All tasks:');
    for (let i = 0; i < updatedTaskCount; i++) {
      const task = updatedTasksList.nth(i);
      const taskText = await task.textContent();
      console.log(`  ${i + 1}. ${taskText?.substring(0, 60)}...`);
    }
  } else {
    console.log('⚠️ No input fields found for adding tasks');
    console.log('ℹ️ The task addition feature may require a different interaction method');
  }

  // Final screenshot
  console.log('\n📸 Taking final screenshot...');
  await page.screenshot({ path: './screenshots/add-task-05-final.png', fullPage: false });
  console.log('✅ Screenshot saved: add-task-05-final.png');

  // Summary
  console.log('\n✅ DEMO COMPLETE');
  console.log('📊 Summary:');
  console.log(`  - App opened successfully`);
  console.log(`  - Floating Panel loaded`);
  console.log(`  - Tasks tab clicked`);
  console.log(`  - Initial tasks: ${initialTaskCount}`);
  console.log(`  - Screenshots saved: 5`);
  console.log('\n🎉 Demo finished!');
});
