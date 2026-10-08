import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Replay, Challenges, type ReplayReport, type ChallengeReport } from './Replay';

const drift = [{ feature: 'severity', distance: .1, alert: false, reference_count: 900, current_count: 84 }];
const policy = { name: 'model', reviewed: 0, population: 0, positives: 0, captured: 0, missed: 0, precision: null, recall: null };
const early = { as_of: '2030-01-07', window_first: '2030-01-01', seen: 84, mature: 0, pending: 84, metrics: null, closed_weeks: 0, policies: [policy], random_expected_captured: null, drift };
const late = { ...early, as_of: '2030-03-07', mature: 60, pending: 24, metrics: { count: 60, positives: 5, prevalence: .08, average_precision: .3, brier_score: .06 } };
const replay: ReplayReport = { status: 'available', warning: 'Synthetic simulated time, not live monitoring.', snapshot_id: 'a'.repeat(64), configuration: { seeds: [2718, 3141], horizon_days: 30, weekly_budget: 15, drift_threshold: .2, minimum_support: 60 }, runs: ['stable', 'concept_shift'].flatMap(id => [2718, 3141].map(seed => ({ id, name: id === 'stable' ? 'No-shift control' : 'Outcome relationship shift', seed, start: '2030-01-01', end: '2030-03-07', change_at: id === 'stable' ? null : '2030-02-01', prediction_sha256: 'b'.repeat(64), checkpoints: [early, late], alert_evidence: { prechange_windows: 2, prechange_input_alerts: 0, detection_delay_days: null, interpretation: 'Input shift is not concept shift.' } }))) };
const measures = { average_precision: { mean: .3, seed_sd: .01 }, brier_score: { mean: .06, seed_sd: .002 }, recall_at_50: { mean: .4, seed_sd: .03 } };
const challenge: ChallengeReport = { status: 'available', warning: 'Synthetic development, no winner selection.', protocol: 'fixed-v1', configuration: { definitions: { linear: 'Linear generator.', interaction: 'XOR interaction.' }, features: ['severity'], parameters: {} }, summary: ['linear', 'interaction'].flatMap(caseId => ['logistic', 'trees', 'prevalence'].map(candidate => ({ case: caseId, name: caseId, candidate, evaluated_seeds: 3, metrics: measures }))), items: ['linear', 'interaction'].flatMap(caseId => [101, 202, 303].map(seed => ({ case: caseId, name: caseId, seed, status: 'evaluated', dataset_sha256: 'c'.repeat(64), splits: { training: { count: 300, positives: 30, first: '2028-01-01', last: '2028-06-01' } }, items: [{ candidate: 'logistic', calibrated: { average_precision: .3, brier_score: .06, recall_at_50: .4 } }] }))) };
function response(value: unknown, status = 200) { return { ok: status === 200, status, json: async () => value } as Response; }
function mount(view: 'replay' | 'challenge', hash = '#' + view) {
  location.hash = hash;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}>{view === 'replay' ? <Replay/> : <Challenges/>}</QueryClientProvider>);
}
beforeEach(() => vi.stubGlobal('fetch', vi.fn(async (path: string) => {
  if (path === '/api/replay') return response(replay);
  if (path === '/api/challenge') return response(challenge);
  const params = new URLSearchParams(path.split('?')[1]);
  const pending = params.get('checkpoint') === '0';
  return response({ total: 84, checkpoint: pending ? early : late, records: [{ id: 'SYN-REPLAY-' + params.get('seed'), observed_at: '2030-01-01', probability: .12, outcome_available_at: '2030-01-31', outcome: pending ? null : 0 }] });
})));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('offline replay and challenge views', () => {
  it('rewinds checkpoint ledger and links its matching export', async () => {
    mount('replay'); await screen.findByText('Negative');
    fireEvent.change(screen.getByRole('slider', { name: /Simulated checkpoint/ }), { target: { value: '0' } });
    await waitFor(() => expect(screen.queryByText('Negative')).toBeNull());
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Export this checkpoint' }).getAttribute('href')).toContain('checkpoint=0');
    expect(screen.getByRole('img', { name: /Maximum input distance/ }).querySelectorAll('circle')).toHaveLength(1);
    expect(screen.getByText('Synthetic simulated time, not live monitoring.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Simulation seed'), { target: { value: '3141' } });
    await screen.findByText('SYN-REPLAY-3141');
    expect(vi.mocked(fetch).mock.calls.every(([, options]) => !options || !('method' in options) || options.method !== 'POST')).toBe(true);
  });
  it('switches the metric and displays retrospective accounting explicitly', async () => {
    mount('replay'); await screen.findByText('Rewind the evidence.');
    fireEvent.change(screen.getByLabelText('Replay scenario'), { target: { value: 'concept_shift' } });
    fireEvent.change(screen.getByLabelText('Timeline metric'), { target: { value: 'brier' } });
    expect(screen.getByRole('img', { name: /Cumulative Brier/ })).toBeTruthy();
    expect(screen.getByText(/not a performance alarm/)).toBeTruthy();
    expect(screen.getByText(/Full-run alert accounting/)).toBeTruthy();
  });
  it('shows unsupported evidence without invented scores and retries failed reads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response({ status: 'unavailable', warning: 'No offline replay loaded.' }));
    mount('replay'); await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText(/No offline replay loaded/);
    expect(screen.queryByText('Rewind the evidence.')).toBeNull();
  });
  it('retains all challenge seeds and candidates while switching case', async () => {
    mount('challenge'); await screen.findByText('Challenge the assumptions.');
    fireEvent.change(screen.getByLabelText('Challenge case'), { target: { value: 'interaction' } });
    expect(screen.getByText('XOR interaction.')).toBeTruthy();
    expect(screen.getByText('Histogram boosted trees')).toBeTruthy();
    for (const seed of [101, 202, 303]) expect(screen.getByRole('heading', { name: 'Seed ' + seed })).toBeTruthy();
    expect(screen.getByText(/not a confidence interval/)).toBeTruthy();
  });
  it('does not fetch replay or challenge while inactive', async () => {
    mount('replay', '#overview');
    await waitFor(() => expect(vi.mocked(fetch).mock.calls).toHaveLength(0));
  });
});
