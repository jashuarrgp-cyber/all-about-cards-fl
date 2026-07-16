import { expect, test } from '@playwright/test';
test('public home renders', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'All About Cards FL' }),
  ).toBeVisible();
});
test('sign in renders', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
