import { test, expect } from '@playwright/test';

test('public profile remains interactive under its restrictive CSP without shared receipts', async ({ page }) => {
  const failures: string[] = [];
  const rejected: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() === 429) rejected.push(response.url()); });
  await page.goto('/#studio');
  await expect(page.getByText('From intercept to score.', { exact: true })).toBeVisible();
  await page.getByRole('slider', { name: 'Severity', exact: true }).fill('9');
  await expect(page.getByText(/Calibrated change:/)).not.toContainText('+0.000');
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation').getByRole('button', { name: 'Batch inference', exact: true }).click();
  await expect(page.getByText(/public demo disables shared visitor batch receipts/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run & save predictions →' })).toBeDisabled();
  const response = await page.request.post('/api/batches', { data: {} });
  expect(response.status()).toBe(403);
  expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(failures).toEqual([]);
  expect(rejected).toEqual([]);
  await expect(page.locator('#status')).not.toBeVisible();
});

test('public walkthrough and evidence exports exclude the local official-data study', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.getByRole('navigation').locator('[data-view]').first()).toHaveAttribute('data-view', 'overview');
  await expect(page.getByText('Historical pilot validated', { exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: 'Try Prediction Studio', exact: true }).click();
  await expect(page.getByText('From intercept to score.', { exact: true })).toBeVisible();
  await page.goto('/#showcase');
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Dataset build', exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: /Start guided walkthrough/ }).click();
  const guide = page.getByRole('region', { name: 'Guided synthetic showcase' });
  for (let i = 0; i < 4; i++) await guide.getByRole('button', { name: 'Next step' }).click();
  await expect(page.getByText('Make the trade-off explicit.', { exact: true })).toBeVisible();
  await guide.getByRole('button', { name: 'Finish walkthrough' }).click();
  const health = await (await page.request.get('/api/health')).json();
  expect(health.visitor_storage).toBe(false);
  const saved = await (await page.request.get('/api/experiments/' + health.experiment_id)).json();
  expect(saved.provenance.release_profile).toBe('public_synthetic');
  expect(saved.report.recovery.runs.every((r: { ledger?: unknown }) => !('ledger' in r))).toBe(true);
  expect((await (await page.request.get('/api/validation')).json()).rows).toEqual([]);
  expect((await page.request.get('/docs')).status()).toBe(404);
});
