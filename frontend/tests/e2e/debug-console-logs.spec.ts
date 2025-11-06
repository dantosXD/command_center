/**
 * Debug Console Logs Test
 * Captures console logs to debug tab switching
 */

import { test, expect } from '@playwright/test';

test('Debug: Capture console logs during tab click', async ({ page }) => {
  const consoleLogs: string[] = [];
  
  // Capture all console messages
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('PAGE LOG:', text);
  });

  // Navigate to the app
  await page.goto('/');
  
  // Wait for panel to load
  await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
    timeout: 5000,
  });

  console.log('=== Initial Console Logs ===');
  consoleLogs.forEach(log => console.log(log));
  
  // Clear logs
  consoleLogs.length = 0;

  console.log('\n=== Clicking Reminders Tab ===');
  const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
  await remindersTab.click();

  // Wait a bit for any async logs
  await page.waitForTimeout(500);

  console.log('\n=== Console Logs After Click ===');
  consoleLogs.forEach(log => console.log(log));

  // Check if handleTabClick was called
  const handleTabClickCalled = consoleLogs.some(log => log.includes('handleTabClick called'));
  console.log('\nhandleTabClick called:', handleTabClickCalled);

  // Check if activeTab was set
  const activeTabSet = consoleLogs.some(log => log.includes('activeTab set to'));
  console.log('activeTab set:', activeTabSet);

  // Check if event listener was triggered
  const tabClicked = consoleLogs.some(log => log.includes('Tab clicked'));
  console.log('Tab clicked event fired:', tabClicked);

  if (!handleTabClickCalled) {
    console.log('\n❌ PROBLEM: handleTabClick was NOT called');
    console.log('This means the event listener is not working');
  }

  if (handleTabClickCalled && !activeTabSet) {
    console.log('\n❌ PROBLEM: handleTabClick was called but activeTab was not set');
    console.log('This means there is a reactivity issue');
  }

  if (handleTabClickCalled && activeTabSet) {
    console.log('\n✅ SUCCESS: Both handleTabClick and activeTab were called');
    
    // Check if content is visible
    const remindersContent = page.locator('[role="region"][aria-label="Reminders list"]');
    const isVisible = await remindersContent.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✅ Reminders content is visible');
    } else {
      console.log('❌ Reminders content is NOT visible');
    }
  }
});
