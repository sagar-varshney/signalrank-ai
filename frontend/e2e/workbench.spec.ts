import { test, expect } from '@playwright/test';

test('all routes and Light/Dark/System against the running Python app', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', e => failures.push(e.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const control = page.getByRole('combobox', { name: 'Appearance' });
  await expect(control).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await control.selectOption('light'); await page.reload();
  await expect(control).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await control.selectOption('dark'); await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await control.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  for (const [route, heading] of [
    ['Overview', 'Know your model. Beyond the score.'], ['Experiments', 'Experiment workspace'],
    ['Batch inference', 'From model to prediction.'], ['Forecast explorer', 'Forecast explorer'],
    ['Model evaluation', 'Model evaluation'], ['Model diagnostics', 'Understand the failures.'],
    ['Model reliability', 'Beyond a single score.'], ['Time replay', 'Watch the evidence arrive.'],
    ['Synthetic challenges', 'Different assumptions. Same discipline.'], ['Dataset build', 'Dataset reconstruction'],
    ['Data & validation', 'Data & validation'],
  ]) {
    await page.getByRole('navigation').getByRole('button', { name: route, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible();
  }
  expect(failures).toEqual([]);
});

test('replay rewinds labels, exports checkpoint and switches scenarios', async ({ page }) => {
  await page.goto('/#replay');
  await expect(page.getByText('Rewind the evidence.', { exact: true })).toBeVisible();
  const slider = page.getByRole('slider', { name: 'Simulated checkpoint' });
  await slider.fill('0');
  const ledger = page.getByRole('region', { name: /As-of prediction ledger/ });
  await expect(ledger.locator('tbody tr')).toHaveCount(25);
  await expect(ledger.locator('tbody tr').first()).toContainText('Pending');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Export this checkpoint' }).click()]);
  expect(download.suggestedFilename()).toBe('signalrank-replay-checkpoint.json');
  const response = await page.request.get('/api/replay/export?checkpoint=0');
  const exportData = await response.json();
  expect(exportData.records).toHaveLength(84);
  expect(exportData.records.every((r: {outcome: null}) => r.outcome === null)).toBe(true);
  await page.getByRole('combobox', { name: 'Replay scenario' }).selectOption('concept_shift');
  await expect(page.getByText(/scheduled generator change/)).toBeVisible();
  await slider.fill('25');
  await expect(ledger.locator('tbody tr').first()).not.toContainText('Pending');
  await page.getByRole('combobox', { name: 'Simulation seed' }).selectOption('3141');
  await expect(ledger.locator('tbody tr').first()).toContainText('SYN-REPLAY-3141');
  await page.getByRole('combobox', { name: 'Timeline metric' }).selectOption('brier');
  await expect(page.getByRole('img', { name: /Cumulative Brier/ })).toBeVisible();
});

test('challenge cases preserve all seeds and candidates', async ({ page }) => {
  await page.goto('/#challenge');
  await expect(page.getByText('Challenge the assumptions.', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Challenge case' }).selectOption('interaction');
  const summary = page.getByRole('region', { name: /Challenge seed summary/ });
  await expect(summary.locator('tbody tr')).toHaveCount(3);
  for (const seed of [101, 202, 303]) await expect(page.getByRole('heading', { name: 'Seed ' + seed, exact: true })).toBeVisible();
  await expect(summary).toContainText('Histogram boosted trees');
  await expect(summary).toContainText('Training prevalence');
});

test('320px navigation keeps the appearance control accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeHidden();
  await page.getByRole('button', { name: 'Browse workspace' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Time replay', exact: true }).click();
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Watch the evidence arrive.' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
