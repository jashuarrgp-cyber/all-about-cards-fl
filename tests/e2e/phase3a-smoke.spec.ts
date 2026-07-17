import { expect, test, type Page } from '@playwright/test';
const testIdentityCookieName = 'aacfl_test_identity';
const seededCatalogProductName = 'Synthetic Electric Mouse';
const seededInventorySearchTerm = 'Electric';

async function signInAs(page: Page, identity: 'owner' | 'employee' | 'vendor') {
  await page.context().addCookies([
    {
      name: testIdentityCookieName,
      value: identity,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);
}

test('public user is redirected away from /app', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/sign-in$/);
});

test('authorized owner can open dashboard, catalog, inventory, and details', async ({
  page,
}) => {
  await signInAs(page, 'owner');
  await page.goto('/app');
  await expect(
    page.getByRole('heading', { name: 'Internal dashboard' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Open Catalog' }).click();
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  await expect(page.getByText(seededCatalogProductName)).toBeVisible();
  await page.getByLabel('Keyword').fill(seededInventorySearchTerm);
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/q=Electric/);
  await page
    .getByRole('link', { name: new RegExp(seededCatalogProductName) })
    .click();
  await expect(
    page.getByRole('heading', { name: seededCatalogProductName }),
  ).toBeVisible();

  await page.goto('/app/inventory');
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  await expect(page.getByText('Unit cost')).toBeVisible();
  await page.getByLabel('Keyword').fill(seededInventorySearchTerm);
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/q=Electric/);
  await page
    .getByRole('link', { name: new RegExp(seededCatalogProductName) })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'Quantity lot' }),
  ).toBeVisible();
});

test('authorized vendor can open catalog and inventory without cost', async ({
  page,
}) => {
  await signInAs(page, 'vendor');
  await page.goto('/app/catalog');
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  await page.goto('/app/inventory');
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  await expect(page.getByText('Unit cost')).toHaveCount(0);
  await expect(page.getByText(/^Cost \$/)).toHaveCount(0);
});

test('employee cannot see costs while owner can', async ({ page }) => {
  await signInAs(page, 'employee');
  await page.goto('/app/inventory');
  await expect(page.getByText('Unit cost')).toHaveCount(0);
  await expect(page.getByText(/^Cost \$/)).toHaveCount(0);

  await page.context().clearCookies();
  await signInAs(page, 'owner');
  await page.goto('/app/inventory');
  await expect(page.getByText('Unit cost').first()).toBeVisible();
});

test('mobile bottom navigation works and primary content does not overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAs(page, 'owner');
  await page.goto('/app');
  await page
    .locator('nav.md\\:hidden')
    .getByRole('link', { name: 'Catalog' })
    .click();
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  await page
    .locator('nav.md\\:hidden')
    .getByRole('link', { name: 'Inventory' })
    .click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
