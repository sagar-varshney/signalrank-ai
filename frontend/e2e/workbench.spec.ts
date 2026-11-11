import { test, expect, type Page } from '@playwright/test';

async function navigate(page: Page, name: string) {
  const button = page.getByRole('navigation').getByRole('button', { name, exact: true, includeHidden: true });
  if (!await button.isVisible()) await page.getByText('Research tools', { exact: true }).click();
  await button.click();
}


test('source-use gates remain distinct and changed dataset versions block local predictions', async ({ page }) => {
  await page.goto('/#data');
  await expect(page.getByRole('heading', { name: 'Audit is not training approval.' })).toBeVisible();
  const sourceRow = page.locator('#scope-permissions tr').filter({ hasText: 'cve' });
  await expect(sourceRow.getByText('Allowed scope', { exact: true })).toHaveCount(1);
  await expect(sourceRow.getByText('Blocked', { exact: true })).toHaveCount(4);
  await expect(page.getByText('No permissions are granted by this screen.', { exact: false })).toBeVisible();
  await navigate(page, 'Batch inference');
  await expect(page.getByRole('heading', { name: 'Catch changes before prediction.' })).toBeVisible();
  await expect(page.locator('.contract-check')).toHaveCount(7);
  await expect(page.locator('#contract-version')).toContainText('Dataset version reused');
  const editor = page.getByLabel('Fictional input JSON');
  await expect(page.getByRole('button', { name: 'Run & save predictions →' })).toBeEnabled();
  const payload = JSON.parse(await editor.inputValue());
  payload.dataset_version = 'browser-contract-v1';
  await editor.fill(JSON.stringify(payload));
  await page.getByRole('button', { name: 'Run & save predictions →' }).click();
  await expect(page.getByRole('heading', { name: 'Saved batch predictions' })).toBeVisible();
  await expect(page.locator('.batch-result .notice')).toContainText('browser-contract-v1');
  payload.records[0].severity = 9.99;
  await editor.fill(JSON.stringify(payload));
  await page.getByRole('button', { name: 'Run & save predictions →' }).click();
  await expect(page.getByRole('alert')).toContainText('choose a new version');
  const receipts = await page.request.get('/api/batches');
  expect((await receipts.json()).total).toBe(1);
});

test('Overview is the landing page and sharp corners persist across themes and workspaces', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.getByRole('heading', { name: 'Know your model. Beyond the score.', level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation').locator('[data-view]').first()).toHaveAttribute('data-view', 'overview');
  await expect(page.getByRole('region', { name: 'Guided synthetic showcase' })).toHaveCount(0);
  await expect(page.locator('#overview-metrics .metric')).toHaveCount(4);
  await expect(page.locator('#overview-comparison .comparison-line')).toHaveCount(4);
  await expect(page.locator('#bike-overview-evidence')).toContainText('Original browser fixture · no measured real-data result.');
  for (const theme of ['light', 'dark', 'system']) {
    await page.getByRole('combobox', { name: 'Appearance' }).selectOption(theme);
    for (const selector of ['#overview .notice', '#overview .metric', '#overview .panel', '.theme-control select', '.command-trigger']) {
      expect(await page.locator(selector).evaluateAll(elements => elements.map(element => getComputedStyle(element).borderRadius))).toEqual(expect.arrayContaining(['0px']));
      expect(await page.locator(selector).evaluateAll(elements => elements.every(element => getComputedStyle(element).borderRadius === '0px'))).toBe(true);
    }
  }
  await navigate(page, 'Prediction Studio');
  await expect(page.getByText('From intercept to score.', { exact: true })).toBeVisible();
  expect(await page.locator('.prediction-card, .waterfall-scroll').evaluateAll(elements => elements.every(element => getComputedStyle(element).borderRadius === '0px'))).toBe(true);
  await navigate(page, 'Guided showcase');
  await expect(page.getByRole('button', { name: /Start guided walkthrough/ })).toBeVisible();
});

test('Overview reports local real-data evidence separately from the blocked 2019 gate', async ({ page }) => {
  await page.route(/\/api\/bikes$/, route => route.fulfill({ json: {
    status: 'available', fixture: false, comparisons: { final: [
      { id: 'logistic', count: 1441, positives: 388, average_precision: 0.680 },
      { id: 'weekly', count: 1441, positives: 388, average_precision: 0.645 },
    ] },
  } }));
  await page.route(/\/api\/bikes\/external$/, route => route.fulfill({ json: { status: 'available', gate: 'blocked' } }));
  await page.goto('/#overview');
  const evidence = page.locator('#bike-overview-evidence');
  await expect(evidence).toContainText('2018 fixed test · 1,441 hours · 388 high-demand hours');
  await expect(evidence).toContainText('primary logistic 0.680 · weekly baseline 0.645');
  await expect(evidence).toContainText('2019 external check: blocked before model scoring.');
  await expect(evidence).not.toContainText('Original browser fixture');
});

test('Prediction Studio reconstructs scores and restores a browser-local comparison', async ({ page }) => {
  await page.goto('/#studio');
  await expect(page.getByText('From intercept to score.', { exact: true })).toBeVisible();
  await page.getByRole('slider', { name: 'Severity', exact: true }).fill('9');
  await expect(page.getByText(/Calibrated change:/)).not.toContainText('+0.000');
  await page.getByRole('button', { name: 'Save comparison locally', exact: true }).click();
  await expect(page.getByText(/Saved on this browser only/)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Restore example 1/ }).click();
  await expect(page.getByRole('slider', { name: 'Severity', exact: true })).toHaveValue('9');
  await expect(page.getByText(/Calibrated change:/)).not.toContainText('+0.000');
  await page.getByRole('button', { name: 'Export explanation', exact: true }).click();
  const response = await page.request.get('/api/studio/predict?category=1&severity=9');
  const value = await response.json();
  expect(value.contributions.length).toBeGreaterThan(4);
  expect(value.reconstruction_error).toBeLessThan(1e-12);
});

test('decision controls keep earlier selection separate from the displayed cohort', async ({ page }) => {
  await page.goto('/#decisions');
  await expect(page.getByText('Make the trade-off explicit.', { exact: true })).toBeVisible();
  const chosen = await page.locator('.prediction-card strong').allTextContents();
  await page.getByRole('combobox', { name: 'Displayed decision cohort' }).selectOption('validation');
  expect(await page.locator('.prediction-card strong').allTextContents()).toEqual(chosen);
  await page.getByRole('combobox', { name: 'Decision curve metric' }).selectOption('cost');
  await expect(page.getByRole('img', { name: /Hypothetical cost across/ })).toBeVisible();
  await page.getByRole('slider', { name: 'Inspect a fixed review budget' }).fill('0');
  await expect(page.getByRole('region', { name: /Selected decision budget/ }).getByText('Unavailable')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Missed positive cost' }).selectOption('10');
  await expect(page.getByText(/Evaluation results never change this recommendation/)).toBeVisible();
});

test('guided showcase connects all five workspaces and recovery retains all seeds', async ({ page }) => {
  await page.goto('/#showcase');
  await page.getByRole('button', { name: /Start guided walkthrough/ }).click();
  const guide = page.getByRole('region', { name: 'Guided synthetic showcase' });
  await expect(guide).toContainText('STEP 1 OF 5');
  for (const view of ['diagnostics', 'replay', 'recovery', 'decisions']) {
    await guide.getByRole('button', { name: 'Next step' }).click();
    await expect(page).toHaveURL(new RegExp('#' + view + '$'));
  }
  await guide.getByRole('button', { name: 'Finish walkthrough' }).click();
  await expect(guide).toHaveCount(0);
  await navigate(page, 'Retraining comparison');
  await expect(page.getByText('Does updating actually help?', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Recovery scenario' }).selectOption('stable');
  await page.getByRole('combobox', { name: 'Recovery chart metric' }).selectOption('average_precision');
  await expect(page.getByRole('region', { name: /All recovery seeds/ }).locator('tbody tr')).toHaveCount(3);
  await expect(page.getByRole('region', { name: /Retraining cutoff evidence/ }).locator('tbody tr')).toHaveCount(4);
});

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
    ['Overview', 'Know your model. Beyond the score.'], ['Evidence summary', 'The result and its limits.'], ['Bike demand', 'Historical demand. Measurable results.'], ['Experiments', 'Experiment workspace'],
    ['Batch inference', 'From model to prediction.'], ['Forecast explorer', 'Forecast explorer'],
    ['Model evaluation', 'Model evaluation'], ['Model diagnostics', 'Understand the failures.'],
    ['Model reliability', 'Beyond a single score.'], ['Time replay', 'Watch the evidence arrive.'],
    ['Synthetic challenges', 'Different assumptions. Same discipline.'], ['Dataset build', 'Dataset reconstruction'],
    ['Data & validation', 'Data & validation'],
    ['Prediction Studio', 'A prediction you can inspect.'], ['Retraining comparison', 'Test the update, not the assumption.'],
    ['Decision trade-offs', 'A score is not a decision.'], ['Guided showcase', 'The story behind the model.'],
  ]) {
    await navigate(page, route);
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
  await navigate(page, 'Time replay');
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Watch the evidence arrive.' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});


test('main workflow stays compact and evidence exports preserve the saved results', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#research-navigation')).not.toHaveAttribute('open', '');
  await expect(page.locator('#workspace-navigation > .nav-group [data-view]')).toHaveCount(6);
  const steps = page.getByLabel('Main prediction workflow').getByRole('link');
  await expect(steps).toHaveCount(4);
  await steps.nth(3).click();
  await expect(page.getByRole('heading', { name: 'What does this experiment establish?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Keep the workbench small.' })).toBeVisible();
  const result = await (await page.request.get('/api/evidence')).json();
  const raw = await (await page.request.get('/api/report')).json();
  expect(result.comparisons[0].average_precision).toBe(raw.model.average_precision);
  expect(result.support.count).toBe(raw.splits.test.count);
  expect(result.support.captured + result.support.missed).toBe(result.support.positives);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Export concise report' }).click()]);
  expect(download.suggestedFilename()).toBe('signalrank-evidence.md');
  for (const theme of ['dark', 'light']) {
    await page.getByRole('combobox', { name: 'Appearance' }).selectOption(theme);
    await expect(page.getByRole('region', { name: /Evidence model comparisons/ })).toBeVisible();
  }
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#replay');
  await expect(page.locator('#research-navigation')).toHaveAttribute('open', '');
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Time replay', exact: true })).toHaveAttribute('aria-current', 'page');
});


test('local feasibility separates archive checks from scientific readiness across themes', async ({ page }) => {
  await page.goto('/#data');
  await expect(page.getByRole('heading', { name: 'Can this cohort support an evaluation?' })).toBeVisible();
  const panel = page.locator('.study-panel');
  await expect(panel.getByText('Fitting blocked', { exact: true })).toBeVisible();
  const result = await (await page.request.get('/api/study-readiness')).json();
  expect(result.training_enabled).toBe(false);
  expect(result.acquisition_enabled).toBe(false);
  expect(result.cohort.candidates).toBe(428);
  expect(result.cohort.candidate_labels['provisional negative']).toBe(428);
  expect(result.gates.find((g: { id: string }) => g.id === 'history').status).toBe('unresolved');
  await expect(panel.getByRole('region', { name: /Real-data feasibility gates/ }).locator('tbody tr')).toHaveCount(9);
  for (const theme of ['dark', 'light', 'system']) {
    await page.getByRole('combobox', { name: 'Appearance' }).selectOption(theme);
    await expect(panel.getByText('Historical outcome validity', { exact: true })).toBeVisible();
  }
  const [download] = await Promise.all([page.waitForEvent('download'), panel.getByRole('link', { name: 'Export local review' }).click()]);
  expect(download.suggestedFilename()).toBe('signalrank-study-review.json');
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});


test('bike benchmark renders labelled fixture evidence, comparisons and exports across themes',async({page})=>{
  await page.goto('/#bikes');
  await expect(page.getByRole('heading',{name:'Which hours will be busy tomorrow?'})).toBeVisible();
  await expect(page.getByText('Original test fixture',{exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:/Real-data model comparisons/}).locator('tbody tr')).toHaveCount(5);
  const primary = await page.locator('.bike-delta').textContent();
  await page.getByLabel('Displayed probability model').selectOption('boosted');
  expect(await page.locator('.bike-delta').textContent()).toBe(primary);
  await page.getByLabel('Comparison table interval').selectOption('development');
  await expect(page.getByRole('img',{name:'Daily high-demand frequency and mean forecast probability'})).toBeVisible();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('link',{name:'Export benchmark report'}).click()]);
  expect(download.suggestedFilename()).toBe('signalrank-bike-benchmark.md');
  for(const theme of ['dark','light','system']) await page.getByRole('combobox',{name:'Appearance'}).selectOption(theme);
  await page.setViewportSize({width:320,height:720});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
