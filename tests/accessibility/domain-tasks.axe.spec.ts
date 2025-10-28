/**
 * domain-tasks.axe.spec.ts
 * Accessibility audit for domain management, list, and board interactions (US2)
 * Axe rules: keyboard navigation, ARIA labels, focus management, color contrast.
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/domains');
  await injectAxe(page);
});

test.describe('Domain & Task Management Accessibility', () => {
  test('should not have automatically detectable violations on domains page', async ({ page }) => {
    await checkA11y(page, null, { detailedReport: true });
  });

  test('should support keyboard navigation through domain list', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /create domain/i })).toBeFocused();
    await page.keyboard.press('Tab');
    // Continue through list items
  });

  test('should provide ARIA labels for form inputs in domain creation', async ({ page }) => {
    await page.getByRole('button', { name: /create domain/i }).click();
    const nameInput = page.getByLabel(/domain name/i);
    await expect(nameInput).toHaveAttribute('aria-label');
    const visibilitySelect = page.getByLabel(/visibility/i);
    await expect(visibilitySelect).toHaveAttribute('aria-label');
  });

  test('should announce live region updates when tasks are added', async ({ page }) => {
    await page.goto('/tasks/list');
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByLabel(/title/i).fill('New task');
    await page.getByRole('button', { name: /create/i }).click();
    const liveRegion = page.getByRole('status');
    await expect(liveRegion).toBeVisible();
  });

  test('should maintain focus trap in task detail drawer', async ({ page }) => {
    await page.goto('/tasks/list');
    await page.locator('[data-testid="task-item"]').first().click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    // Tab should stay within drawer
    await page.keyboard.press('Tab');
    await expect(drawer.locator(':focus')).toBeVisible();
    // Escape closes
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('should support screen reader text for kanban board lanes', async ({ page }) => {
    await page.goto('/tasks/board');
    const lanes = page.locator('[data-testid="lane"]');
    const count = await lanes.count();
    for (let i = 0; i < count; i++) {
      const lane = lanes.nth(i);
      await expect(lane).toHaveAttribute('aria-label');
    }
  });
});
