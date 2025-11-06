/**
 * Debug Content Rendering Test
 * Checks if content is actually being rendered
 */

import { test, expect } from '@playwright/test';

test('Debug: Check content rendering after tab switch', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Wait for panel to load
  await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
    timeout: 5000,
  });

  console.log('\n=== Initial State ===');
  
  // Check initial content
  const notificationsContent = await page.locator('[role="region"][aria-label="Notifications list"]').count();
  console.log('Notifications content found:', notificationsContent);

  const remindersContent = await page.locator('[role="region"][aria-label="Reminders list"]').count();
  console.log('Reminders content found:', remindersContent);

  console.log('\n=== Dispatching Click Event ===');
  
  // Dispatch click event
  const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
  await remindersTab.evaluate((el) => {
    console.log('Dispatching click event');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  console.log('\n=== After Click - Checking activeTab ===');
  
  // Check activeTab
  const activeTab = await page.evaluate(() => {
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    return tab?.getAttribute('aria-label');
  });
  console.log('Active tab:', activeTab);

  console.log('\n=== After Click - Checking Content ===');
  
  // Wait a bit
  await page.waitForTimeout(500);

  // Check all regions
  const allRegions = await page.locator('[role="region"]').all();
  console.log('Total regions found:', allRegions.length);

  for (let i = 0; i < allRegions.length; i++) {
    const region = allRegions[i];
    const label = await region.getAttribute('aria-label');
    const isVisible = await region.isVisible().catch(() => false);
    const html = await region.evaluate((el) => el.outerHTML.substring(0, 200));
    
    console.log(`Region ${i + 1}: ${label}`);
    console.log('  Visible:', isVisible);
    console.log('  HTML:', html);
  }

  console.log('\n=== Checking Reminders Content Specifically ===');
  
  const remindersRegion = page.locator('[role="region"][aria-label="Reminders list"]');
  const remindersCount = await remindersRegion.count();
  console.log('Reminders region count:', remindersCount);

  if (remindersCount > 0) {
    const isVisible = await remindersRegion.isVisible();
    console.log('Reminders region visible:', isVisible);
    
    const html = await remindersRegion.evaluate((el) => el.outerHTML.substring(0, 500));
    console.log('Reminders region HTML:', html);
  } else {
    console.log('❌ Reminders region NOT found in DOM');
    
    // Check if the content div exists at all
    const contentDiv = await page.evaluate(() => {
      const div = document.querySelector('.flex-1.overflow-y-auto');
      return {
        found: !!div,
        html: div?.outerHTML.substring(0, 300),
      };
    });
    console.log('Content div:', contentDiv);
  }

  console.log('\n=== Checking Svelte Reactivity ===');
  
  // Check if Svelte is detecting the change
  const svelteState = await page.evaluate(() => {
    // Try to access component state through DOM
    const panel = document.querySelector('[role="region"][aria-label*="Floating panel"]');
    
    return {
      panelFound: !!panel,
      allRegionLabels: Array.from(document.querySelectorAll('[role="region"]')).map(r => r.getAttribute('aria-label')),
      activeTabElement: document.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute('aria-label'),
    };
  });
  
  console.log('Svelte state:', svelteState);
});
