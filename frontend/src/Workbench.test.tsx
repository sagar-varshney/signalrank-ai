import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Studio, Recovery, Decisions, Showcase, Guide, type RecoveryReport, type DecisionReport } from './Workbench';

const identifier = 'a'.repeat(64);
const model = { artifact_id: identifier, run_id: 'run', dataset_sha256: 'b'.repeat(64), configuration: { seed: 42, regularization_c: 1 }, runtime: {}, code_sha256: {} };
const metric = { average_precision: .2, brier_score: .08, count: 360, positives: 30 };
const recovery: RecoveryReport = { status: 'available', warning: 'Synthetic fixed schedule, no automatic promotion.', protocol: 'recovery-v1', configuration: { seeds: [2718, 3141], update_days: [84], horizon_days: 30, weekly_budget: 15 }, runs: ['stable', 'concept_shift'].flatMap(scenario => [2718, 3141].map(seed => ({ scenario, name: scenario === 'stable' ? 'No-shift control' : 'Outcome relationship shift', seed, start: '2030-01-01', end: '2030-06-30', change_at: scenario === 'stable' ? null : '2030-04-01', updates: [{ day: 84, at: '2030-03-26', status: 'fitted', fit_seconds: .01, model_version: 'c'.repeat(64), training_sha256: 'd'.repeat(64), calibration_sha256: 'e'.repeat(64), training: { count: 900, first: '2028-01-01', last: '2029-12-01' }, calibration: { count: 360, first: '2030-01-01', last: '2030-01-30' } }], checkpoints: [{ as_of: '2030-01-07', mature: 0, window_first: null, frozen: null, scheduled: null }, { as_of: '2030-06-30', mature: 360, window_first: '2030-05-01', frozen: metric, scheduled: { ...metric, average_precision: .3 } }], results: { postchange_mature: { frozen: metric, scheduled: { ...metric, average_precision: .3 } }, all_mature: { frozen: metric, scheduled: metric } }, policies: [{ policy: 'frozen', reviewed: 30, population: 168, captured: 5, positives: 10 }, { policy: 'scheduled', reviewed: 30, population: 168, captured: 6, positives: 10 }] }))) };
const points = [{ budget: 0, captured: 0, missed: 5, selected_negatives: 0, precision: null, recall: 0 }, { budget: 5, captured: 3, missed: 2, selected_negatives: 2, precision: .6, recall: .6 }, { budget: 10, captured: 5, missed: 0, selected_negatives: 5, precision: .5, recall: 1 }];
const decision: DecisionReport = { status: 'available', warning: 'Hypothetical units, validation only.', protocol: 'decision-v1', selection_rule: 'Minimum validation cost, not evaluation.', budgets: [0, 5, 10], configuration: { missed_costs: [1, 5], negative_costs: [0, 1], review_costs: [0, .1] }, partitions: { validation: { count: 50, positives: 5, first: '2030-01-01', last: '2030-01-31', dataset_sha256: 'd'.repeat(64) }, evaluation: { count: 60, positives: 5, first: '2030-03-03', last: '2030-04-01', dataset_sha256: 'e'.repeat(64) } }, curves: { validation: { model: points, severity: points }, evaluation: { model: points, severity: points } }, profiles: [1, 5].flatMap(missed_cost => ['model', 'severity'].map(policy => ({ missed_cost, negative_cost: 1, review_cost: .1, policy, chosen_budget: 5, validation_cost: 12.5, evaluation_cost: 12.5 }))) };
function response(value: unknown, status = 200) { return { ok: status === 200, status, json: async () => value } as Response; }
function mount(view: string, element: React.ReactNode) { location.hash = '#' + view; const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }); render(<QueryClientProvider client={client}>{element}</QueryClientProvider>); }
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn(async (path: string) => {
    if (path === '/api/studio/options') return response({ models: [model], categories: ['Parser', 'Gateway', 'Local', 'Remote command', 'Decoder'] });
    if (path === '/api/recovery') return response(recovery);
    if (path === '/api/decision') return response(decision);
    const params = new URLSearchParams(path.split('?')[1]), severity = Number(params.get('severity'));
    return response({ model, snapshot_id: 'f'.repeat(64), input_sha256: '0'.repeat(64), intercept: -3, logit: -2, raw_probability: severity / 20, calibrated_probability: severity / 25, calibration: { slope: 1, intercept: .2 }, reconstruction_error: 0, warning: 'Not causal.', contributions: Array.from({ length: 6 }, (_, i) => ({ feature: 'text__factor' + i, value: .1, start: -3 + i * .1, end: -2.9 + i * .1 })) });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('final interactive workbench', () => {
  it('compares fictional inputs and shows all factors plus the calibration bridge', async () => {
    mount('studio', <Studio/>); await screen.findByText('From intercept to score.');
    const chart = screen.getByRole('img', { name: /Intercept plus all feature/ });
    expect(chart.querySelectorAll('rect')).toHaveLength(8);
    fireEvent.change(screen.getByRole('slider', { name: 'Severity' }), { target: { value: '9' } });
    await waitFor(() => expect(screen.getByText(/Calibrated change:/).textContent).toContain('+16.000'));
    expect(screen.getByText(/Calibration is a separate transform/)).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls.every(([, init]) => !init || !('method' in init) || init.method !== 'POST')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Save comparison locally' }));
    const rows = JSON.parse(localStorage.getItem('signalrank-studio-examples-v1')!);
    expect(rows[0].model_id).toBe(identifier); expect(rows[0].modified.severity).toBe(9);
    expect(rows[0].original.severity).toBe(5);
  });
  it('does not silently reassign a saved comparison whose model is unavailable', async () => {
    localStorage.setItem('signalrank-studio-examples-v1', JSON.stringify([{ original: { category: 1, severity: 5, remote: true, authentication_required: false }, modified: { category: 1, severity: 9, remote: true, authentication_required: false }, model_id: 'b'.repeat(64) }]));
    mount('studio', <Studio/>); await screen.findByText('From intercept to score.');
    fireEvent.click(screen.getByRole('button', { name: /Restore example 1/ }));
    expect(screen.getByText(/not reassigned to another model/)).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Severity' }).getAttribute('value')).toBe('5');
  });
  it('remains usable if browser-local storage is denied', async () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); } });
    mount('studio', <Studio/>); await screen.findByText('From intercept to score.');
    fireEvent.click(screen.getByRole('button', { name: 'Save comparison locally' }));
    expect(screen.getByText(/storage is unavailable/)).toBeTruthy();
  });
  it('switches recovery scenario, seed and metric without fitting', async () => {
    mount('recovery', <Recovery/>); await screen.findByText('Does updating actually help?');
    fireEvent.change(screen.getByLabelText('Recovery scenario'), { target: { value: 'stable' } });
    fireEvent.change(screen.getByLabelText('Recovery seed'), { target: { value: '3141' } });
    fireEvent.change(screen.getByLabelText('Recovery chart metric'), { target: { value: 'average_precision' } });
    expect(screen.getByRole('img', { name: /Rolling mature average precision/ })).toBeTruthy();
    expect(screen.getByText(/No change scheduled/)).toBeTruthy();
    expect(within(screen.getByRole('region', { name: /All recovery seeds/ })).getAllByRole('row')).toHaveLength(3);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1);
  });
  it('keeps validation-selected budgets fixed when displaying a different decision cohort', async () => {
    mount('decisions', <Decisions/>); await screen.findByText('Make the trade-off explicit.');
    expect(screen.getAllByText('5 reviews')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Displayed decision cohort'), { target: { value: 'validation' } });
    expect(screen.getAllByText('5 reviews')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Decision curve metric'), { target: { value: 'cost' } });
    expect(screen.getByRole('img', { name: /Hypothetical cost across/ })).toBeTruthy();
    fireEvent.change(screen.getByRole('slider', { name: 'Inspect a fixed review budget' }), { target: { value: '0' } });
    expect(within(screen.getByRole('region', { name: /Selected decision budget/ })).getAllByText('Unavailable')).toHaveLength(2);
    expect(screen.getByText(/Evaluation results never change this recommendation/)).toBeTruthy();
  });
  it('provides a complete five-step tour and can end it cleanly', async () => {
    mount('showcase', <><Guide/><Showcase/></>);
    fireEvent.click(screen.getByRole('button', { name: /Start guided walkthrough/ }));
    const guide = screen.getByRole('region', { name: 'Guided synthetic showcase' });
    expect(location.hash).toBe('#studio');
    expect(within(guide).getByText(/STEP 1 OF 5/)).toBeTruthy();
    for (let i = 0; i < 4; i++) fireEvent.click(within(guide).getByRole('button', { name: 'Next step' }));
    expect(location.hash).toBe('#decisions');
    fireEvent.click(within(guide).getByRole('button', { name: 'Finish walkthrough' }));
    expect(location.hash).toBe('#showcase');
    expect(screen.queryByRole('region', { name: 'Guided synthetic showcase' })).toBeNull();
  });
  it('does not fetch inactive workspaces and handles missing/error evidence explicitly', async () => {
    mount('overview', <><Studio/><Recovery/><Decisions/></>);
    await waitFor(() => expect(vi.mocked(fetch).mock.calls).toHaveLength(0));
    cleanup(); vi.mocked(fetch).mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response({ status: 'unavailable', warning: 'Recovery evidence not loaded.' }));
    mount('recovery', <Recovery/>); await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Recovery evidence not loaded.');
  });
});
