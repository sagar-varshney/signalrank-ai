import { test, expect, type Page } from '@playwright/test';

async function navigate(page: Page, name: string) {
  const button = page.getByRole('navigation').getByRole('button', { name, exact: true, includeHidden: true });
  if (!await button.isVisible()) await page.getByText('Research tools', { exact: true }).click();
  await button.click();
}


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
  await navigate(page, 'Batch inference');
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
  const bikeRequests: string[] = [];
  page.on('request', request => { if (/\/api\/bikes(?:\/|$)/.test(request.url())) bikeRequests.push(request.url()); });
  await page.goto('/');
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.getByRole('navigation').locator('[data-view]').first()).toHaveAttribute('data-view', 'overview');
  await expect(page.getByText('Historical pilot validated', { exact: true })).not.toBeVisible();
  await expect(page.locator('.bike-entry')).toBeHidden();
  expect(bikeRequests).toEqual([]);
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


test('public evidence includes synthetic results but no filesystem inventory', async ({ page }) => {
  await page.goto('/#evidence');
  await expect(page.getByRole('heading', { name: 'What does this experiment establish?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Keep the workbench small.' })).toHaveCount(0);
  const response = await (await page.request.get('/api/storage')).json();
  expect(response).toEqual({ status: 'unavailable', reason: 'Storage inventory is local-only' });
  const evidence = await (await page.request.get('/api/evidence')).json();
  expect(evidence.mode).toBe('synthetic');
  expect(evidence.provenance.release_profile).toBe('public_synthetic');
  expect(JSON.stringify(evidence)).not.toContain('/Users/');
  expect((await page.request.post('/api/storage')).status()).toBe(403);
});


test('public profile never exposes the archived cohort review', async ({ page }) => {
  await page.goto('/#data');
  await expect(page.getByText('Archived real-data feasibility is local-only', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can this cohort support an evaluation?' })).toHaveCount(0);
  const value = await (await page.request.get('/api/study-readiness')).json();
  expect(value).toEqual({ status: 'unavailable', reason: 'Archived real-data feasibility is local-only', training_enabled: false });
  expect(JSON.stringify(value)).not.toContain('CVE-');
  expect(JSON.stringify(value)).not.toContain('428');
});


test('public profile keeps the independent real benchmark local-only',async({page})=>{
  await page.goto('/#bikes');
  await expect(page.getByRole('heading',{name:'No saved bike benchmark loaded.'})).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('button',{name:'Bike demand',exact:true})).toHaveCount(0);
  const result=await(await page.request.get('/api/bikes')).json();
  expect(result.status).toBe('unavailable');
  expect(JSON.stringify(result)).not.toContain('/Users/');
  const audit=await(await page.request.get('/api/bikes/audit')).json();
  expect(audit.status).toBe('unavailable');
  expect(JSON.stringify(audit)).not.toContain('/Users/');
  const external=await(await page.request.get('/api/bikes/external')).json();
  expect(external.status).toBe('unavailable');
  expect(JSON.stringify(external)).not.toContain('/Users/');
  expect((await page.request.get('/api/bikes/export')).status()).toBe(409);
  expect((await page.request.get('/api/bikes/external/export')).status()).toBe(409);
});
