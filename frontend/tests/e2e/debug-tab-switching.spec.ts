/**
 * Debug Tab Switching Issue
 * Tests to identify why tab switching isn't working
 */

import { test, expect } from '@playwright/test';

test.describe('Debug Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err));

    // Navigate to the app
    await page.goto('/');
    // Wait for panel to load
    await page.waitForSelector('[role="region"][aria-label*="Floating panel"]', {
      timeout: 5000,
    });
  });

  test('Debug 1: Verify Initial State', async ({ page }) => {
    console.log('=== Debug 1: Initial State ===');

    // Check initial activeTab
    const activeTab = await page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.getAttribute('aria-label');
    });
    console.log('Initial active tab:', activeTab);

    // Check if Notifications tab is selected
    const notificationsTab = page.locator('[role="tab"][aria-label="Notifications tab"]');
    const isSelected = await notificationsTab.getAttribute('aria-selected');
    console.log('Notifications tab aria-selected:', isSelected);

    expect(isSelected).toBe('true');
  });

  test('Debug 2: Check Tab Click Handler', async ({ page }) => {
    console.log('=== Debug 2: Tab Click Handler ===');

    // Add debugging to the page
    await page.evaluate(() => {
      console.log('Adding debug logging...');
      // Log when tabs are clicked
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.getAttribute('role') === 'tab') {
          console.log('Tab clicked:', target.getAttribute('aria-label'));
        }
      });
    });

    // Click Reminders tab
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    console.log('Clicking Reminders tab...');
    await remindersTab.click();

    // Wait a bit
    await page.waitForTimeout(500);

    // Check if tab is selected
    const isSelected = await remindersTab.getAttribute('aria-selected');
    console.log('Reminders tab aria-selected after click:', isSelected);

    // Check page console for any errors
    const logs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    console.log('Page logs:', logs);
  });

  test('Debug 3: Check Content Rendering', async ({ page }) => {
    console.log('=== Debug 3: Content Rendering ===');

    // Get initial content
    const initialContent = await page.locator('[role="region"][aria-label="Notifications list"]').count();
    console.log('Initial Notifications content count:', initialContent);

    // Click Reminders tab
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    console.log('Clicking Reminders tab...');
    await remindersTab.click();

    // Wait for content to potentially render
    await page.waitForTimeout(500);

    // Check if Reminders content exists
    const remindersContent = await page.locator('[role="region"][aria-label="Reminders list"]').count();
    console.log('Reminders content count after click:', remindersContent);

    // Check all regions
    const allRegions = await page.locator('[role="region"]').count();
    console.log('Total regions:', allRegions);

    // Get all region labels
    const regionLabels = await page.evaluate(() => {
      const regions = document.querySelectorAll('[role="region"]');
      return Array.from(regions).map((r) => r.getAttribute('aria-label'));
    });
    console.log('Region labels:', regionLabels);
  });

  test('Debug 4: Check DOM Structure', async ({ page }) => {
    console.log('=== Debug 4: DOM Structure ===');

    // Get the entire panel HTML
    const panelHTML = await page.evaluate(() => {
      const panel = document.querySelector('[role="region"][aria-label*="Floating panel"]');
      return panel?.outerHTML.substring(0, 500);
    });
    console.log('Panel HTML (first 500 chars):', panelHTML);

    // Check if tabs have click handlers
    const tabInfo = await page.evaluate(() => {
      const tabs = document.querySelectorAll('[role="tab"]');
      return Array.from(tabs).map((tab) => ({
        label: tab.getAttribute('aria-label'),
        selected: tab.getAttribute('aria-selected'),
        hasClickListener: (tab as any).onclick !== null,
      }));
    });
    console.log('Tab info:', tabInfo);
  });

  test('Debug 5: Manually Trigger State Change', async ({ page }) => {
    console.log('=== Debug 5: Manual State Change ===');

    // Try to manually change the state
    const result = await page.evaluate(() => {
      // Find the component instance
      const panel = document.querySelector('[role="region"][aria-label*="Floating panel"]');
      console.log('Panel found:', !!panel);

      // Try to access Svelte component
      const svelteComponent = (panel as any).__svelte_component;
      console.log('Svelte component:', !!svelteComponent);

      return {
        panelFound: !!panel,
        svelteComponent: !!svelteComponent,
      };
    });
    console.log('Manual state change result:', result);
  });

  test('Debug 6: Check Reactive Variables', async ({ page }) => {
    console.log('=== Debug 6: Reactive Variables ===');

    // Check if activeTab is changing
    const activeTabBefore = await page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.getAttribute('aria-label');
    });
    console.log('Active tab before:', activeTabBefore);

    // Click Reminders tab
    await page.locator('[role="tab"][aria-label="Reminders tab"]').click();
    await page.waitForTimeout(100);

    const activeTabAfter = await page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.getAttribute('aria-label');
    });
    console.log('Active tab after:', activeTabAfter);

    // Check if it changed
    if (activeTabBefore === activeTabAfter) {
      console.log('WARNING: Active tab did not change!');
    } else {
      console.log('SUCCESS: Active tab changed');
    }
  });

  test('Debug 7: Check Event Listeners', async ({ page }) => {
    console.log('=== Debug 7: Event Listeners ===');

    // Check if buttons have event listeners
    const eventInfo = await page.evaluate(() => {
      const remindersTab = document.querySelector('[role="tab"][aria-label="Reminders tab"]');
      // getEventListeners is only available in DevTools, so we'll check the HTML instead
      return {
        html: remindersTab?.outerHTML.substring(0, 300),
        hasOnClick: remindersTab?.outerHTML.includes('on:click') || false,
      };
    }).catch((err) => {
      console.log('Error checking listeners:', err);
      return { hasListeners: false, listenerCount: 0 };
    });
    console.log('Event listener info:', eventInfo);
  });

  test('Debug 8: Check Svelte Binding', async ({ page }) => {
    console.log('=== Debug 8: Svelte Binding ===');

    // Check if the click handler is properly bound
    const bindingInfo = await page.evaluate(() => {
      const remindersTab = document.querySelector('[role="tab"][aria-label="Reminders tab"]');
      const html = remindersTab?.outerHTML;
      return {
        hasOnClick: html?.includes('on:click') || false,
        html: html?.substring(0, 200),
      };
    });
    console.log('Binding info:', bindingInfo);
  });

  test('Debug 9: Test Direct Click', async ({ page }) => {
    console.log('=== Debug 9: Direct Click ===');

    // Try different click methods
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');

    console.log('Method 1: Regular click');
    await remindersTab.click();
    await page.waitForTimeout(100);

    let isSelected = await remindersTab.getAttribute('aria-selected');
    console.log('After click - aria-selected:', isSelected);

    if (isSelected !== 'true') {
      console.log('Method 2: Force click');
      await remindersTab.click({ force: true });
      await page.waitForTimeout(100);

      isSelected = await remindersTab.getAttribute('aria-selected');
      console.log('After force click - aria-selected:', isSelected);
    }

    if (isSelected !== 'true') {
      console.log('Method 3: Dispatch click event');
      await page.evaluate(() => {
        const tab = document.querySelector('[role="tab"][aria-label="Reminders tab"]');
        tab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(100);

      isSelected = await remindersTab.getAttribute('aria-selected');
      console.log('After dispatch - aria-selected:', isSelected);
    }
  });

  test('Debug 10: Full Flow Analysis', async ({ page }) => {
    console.log('=== Debug 10: Full Flow Analysis ===');

    // Log everything
    console.log('Step 1: Check initial state');
    let activeTab = await page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.getAttribute('aria-label');
    });
    console.log('Active tab:', activeTab);

    console.log('Step 2: Get Reminders tab element');
    const remindersTab = page.locator('[role="tab"][aria-label="Reminders tab"]');
    const isVisible = await remindersTab.isVisible();
    console.log('Reminders tab visible:', isVisible);

    console.log('Step 3: Click Reminders tab');
    await remindersTab.click();

    console.log('Step 4: Wait for potential state change');
    await page.waitForTimeout(200);

    console.log('Step 5: Check new active tab');
    activeTab = await page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.getAttribute('aria-label');
    });
    console.log('Active tab after click:', activeTab);

    console.log('Step 6: Check Reminders content');
    const remindersContent = await page.locator('[role="region"][aria-label="Reminders list"]').count();
    console.log('Reminders content found:', remindersContent);

    console.log('Step 7: Summary');
    if (activeTab === 'Reminders tab' && remindersContent > 0) {
      console.log('✅ Tab switching WORKS');
    } else {
      console.log('❌ Tab switching FAILED');
      console.log('  - Active tab changed:', activeTab === 'Reminders tab');
      console.log('  - Content rendered:', remindersContent > 0);
    }
  });
});
