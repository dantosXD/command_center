/**
 * Debug HTML Structure Test
 * Inspects the actual HTML to find issues
 */

import { test, expect } from '@playwright/test';

test('Debug: Inspect HTML structure and CSS', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Wait for panel to load
  await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
    timeout: 5000,
  });

  console.log('\n=== Inspecting Tab Buttons ===');
  
  // Get all tab buttons
  const tabs = await page.locator('[role="tab"]').all();
  console.log('Found tabs:', tabs.length);

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const label = await tab.getAttribute('aria-label');
    const html = await tab.evaluate((el) => el.outerHTML.substring(0, 300));
    const computedStyle = await tab.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        pointerEvents: style.pointerEvents,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        cursor: style.cursor,
      };
    });

    console.log(`\nTab ${i + 1}: ${label}`);
    console.log('HTML:', html);
    console.log('Computed Style:', computedStyle);
  }

  console.log('\n=== Checking Parent Elements ===');
  
  // Check tablist
  const tablist = await page.locator('[role="tablist"]').first();
  const tablistStyle = await tablist.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      pointerEvents: style.pointerEvents,
      display: style.display,
      overflow: style.overflow,
    };
  });
  console.log('Tablist computed style:', tablistStyle);

  console.log('\n=== Checking Panel Container ===');
  
  // Check panel
  const panel = await page.locator('[role="region"][aria-label*="Floating panel"]').first();
  const panelStyle = await panel.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      pointerEvents: style.pointerEvents,
      display: style.display,
      position: style.position,
    };
  });
  console.log('Panel computed style:', panelStyle);

  console.log('\n=== Testing Click Interception ===');
  
  // Try to see if clicks are being intercepted
  const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
  
  // Get the bounding box
  const box = await remindersTab.boundingBox();
  console.log('Reminders tab bounding box:', box);

  // Check if there are any overlays
  const elementAtClick = await page.evaluate((coords) => {
    const el = document.elementFromPoint(coords.x + coords.width / 2, coords.y + coords.height / 2);
    return {
      tag: el?.tagName,
      className: el?.className,
      id: el?.id,
      role: el?.getAttribute('role'),
      ariaLabel: el?.getAttribute('aria-label'),
    };
  }, box!);
  
  console.log('Element at click position:', elementAtClick);

  console.log('\n=== Testing Event Listeners ===');
  
  // Check if event listeners are attached
  const hasListeners = await remindersTab.evaluate((el) => {
    // Try to check if there are listeners (this is limited in browsers)
    const clone = el.cloneNode(true) as HTMLElement;
    const original = el as HTMLElement;
    
    // Check onclick attribute
    return {
      hasOnClick: (el as any).onclick !== null,
      hasOnMouseDown: (el as any).onmousedown !== null,
      hasOnMouseUp: (el as any).onmouseup !== null,
      htmlHasOn: el.outerHTML.includes('on:'),
    };
  });
  
  console.log('Event listener info:', hasListeners);

  console.log('\n=== Testing Manual Click ===');
  
  // Try to manually trigger a click
  await remindersTab.evaluate((el) => {
    console.log('Dispatching click event');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await page.waitForTimeout(200);

  // Check if anything changed
  const activeTab = await page.evaluate(() => {
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    return tab?.getAttribute('aria-label');
  });

  console.log('Active tab after manual dispatch:', activeTab);
});
