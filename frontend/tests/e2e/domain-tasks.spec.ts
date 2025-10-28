/**
 * domain-tasks.spec.ts
 * Playwright e2e for domain administration and task board flows (US2)
 * Tests domain creation, role assignment, task CRUD, and board interactions.
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // TODO: sign in as test user
  await page.goto('/domains');
});

test.describe('Domain & Task Management', () => {
  test('should create a new domain with visibility settings', async ({ page }) => {
    await page.getByRole('button', { name: /create domain/i }).click();
    await page.getByLabel(/domain name/i).fill('Engineering');
    await page.getByLabel(/visibility/i).selectOption('shared');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText('Engineering')).toBeVisible();
  });

  test('should assign roles to domain members', async ({ page }) => {
    // TODO: navigate to domain, open member management, add user with role
    await page.getByTestId('domain-members-btn').click();
    await page.getByRole('button', { name: /invite/i }).click();
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/role/i).selectOption('admin');
    await page.getByRole('button', { name: /send invite/i }).click();
    await expect(page.getByText(/invite sent/i)).toBeVisible();
  });

  test('should create and manage tasks in a list view', async ({ page }) => {
    await page.goto('/tasks/list');
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByLabel(/title/i).fill('Implement auth');
    await page.getByLabel(/priority/i).selectOption('1');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText('Implement auth')).toBeVisible();
  });

  test('should drag and drop tasks on kanban board', async ({ page }) => {
    await page.goto('/tasks/board');
    const task = page.locator('[data-testid="task-card"]').first();
    const backlogLane = page.locator('[data-testid="lane-backlog"]');
    await task.dragTo(backlogLane);
    await expect(task).toBeVisible();
  });

  test('should open task detail drawer with dependencies and attachments', async ({ page }) => {
    await page.goto('/tasks/list');
    await page.locator('[data-testid="task-item"]').first().click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByLabel(/dependencies/i)).toBeVisible();
    await expect(drawer.getByLabel(/attachments/i)).toBeVisible();
  });

  test('should persist and apply saved filters', async ({ page }) => {
    await page.goto('/tasks/list');
    await page.getByLabel(/status/i).selectOption('in-progress');
    await page.getByRole('button', { name: /save view/i }).click();
    await page.getByLabel(/view name/i).fill('In Progress');
    await page.getByRole('button', { name: /save/i }).click();
    await page.reload();
    await expect(page.getByText('In Progress')).toBeVisible();
  });
});
