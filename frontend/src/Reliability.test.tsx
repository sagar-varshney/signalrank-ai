import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Reliability, type ReliabilityReport } from './Reliability';

const metrics = { average_precision: .3, brier_score: .06, recall_at_50: .4 };
const support = { count: 630, unique_records: 630, positives: 44, prevalence: .07, mean_severity: 5.5, remote_rate: .5, categories: { 'original fictional category': 630 }, records_sha256: 'd'.repeat(64) };
const bins = Array.from({ length: 10 }, (_, i) => ({ lower: i / 10, upper: (i + 1) / 10, count: i ? 0 : 630, predicted: i ? null : .07, observed: i ? null : .07 }));
const point = { fraction: 1, train_count: 900, train_positives: 60, train_first: '2022-01-01', train_last: '2022-10-27', status: 'evaluated', training: metrics, evaluation: metrics };
const report: ReliabilityReport = {
  status: 'available', snapshot_id: 'a'.repeat(64), mode: 'synthetic', protocol: 'synthetic-reliability-v1', warning: 'Synthetic development only.', dataset_sha256: 'd'.repeat(64), configuration: { seed: 42 },
  stress: { seed: 314159, budget: 50, warning: 'Composition changes prevalence; no paired causal effect.', items: [
    { id: 'control', name: 'Unchanged control', kind: 'control', definition: 'Exact copy.', status: 'evaluated', support, calibrated: metrics, raw: metrics, delta_from_control: { average_precision: 0, brier_score: 0, recall_at_50: 0 }, calibration_bins: bins },
    { id: 'severity_noise', name: 'Severity measurement noise', kind: 'measurement', definition: 'Retain outcomes; corrupt observed severity.', status: 'evaluated', support, calibrated: metrics, raw: metrics, delta_from_control: { average_precision: -.04, brier_score: .01, recall_at_50: -.02 }, calibration_bins: bins },
    { id: 'unsupported', name: 'Unsupported example', kind: 'composition', definition: 'No label repair.', status: 'unavailable', reason: 'Both classes required.', support },
  ] },
  importance: { status: 'evaluated', warning: 'Shuffle SD is not confidence; dependence is not causation.', items: [{ feature: 'severity', average_precision_drop: -.01, average_precision_drop_sd: .003, brier_increase: -.002, brier_increase_sd: .001, repeats: 20 }] },
  learning_curves: { warning: 'Fixed later calibration and evaluation; not a final holdout.', fractions: [.25, .5, .75, 1], folds: [
    { fold: 1, calibration: support, evaluation: support, calibration_first: '2023-01-01', evaluation_first: '2023-06-01', evaluation_last: '2023-08-01', points: [point] },
    { fold: 2, calibration: support, evaluation: support, calibration_first: '2023-07-01', evaluation_first: '2023-12-01', evaluation_last: '2024-02-01', points: [{ ...point, train_count: 1200 }] },
  ] },
};
function response(value: unknown, status = 200) { return { ok: status === 200, status, json: async () => value } as Response; }
function mount(hash = '#reliability') {
  location.hash = hash;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><Reliability /></QueryClientProvider>);
}
beforeEach(() => { vi.stubGlobal('fetch', vi.fn(async () => response(report))); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('model reliability workspace', () => {
  it('inspects scenarios and labels calibration series truthfully', async () => {
    mount(); await screen.findByText('Controlled changes. Visible consequences.');
    fireEvent.change(screen.getByLabelText('Inspect scenario'), { target: { value: 'severity_noise' } });
    expect(screen.getByText('Retain outcomes; corrupt observed severity.')).toBeTruthy();
    expect(screen.getByRole('img', { name: /Control and selected scenario/ })).toBeTruthy();
    expect(screen.getByText('Composition changes prevalence; no paired causal effect.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Download research report' }).getAttribute('href')).toBe('/api/export/report');
    fireEvent.change(screen.getByLabelText('Inspect scenario'), { target: { value: 'unsupported' } });
    expect(screen.getByText('Both classes required.')).toBeTruthy();
    expect(screen.queryByRole('img', { name: /Control and selected scenario/ })).toBeNull();
  });
  it('retains negative importance and swaps metrics and temporal fold evidence', async () => {
    mount(); await screen.findByText('Which inputs does the model rely on?');
    expect(screen.getByText('-0.0100')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Importance measure'), { target: { value: 'brier_increase' } });
    expect(screen.getByRole('img', { name: /Signed permutation importance/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Temporal fold'), { target: { value: '2' } });
    expect(screen.getByText(/2023-12-01 to 2024-02-01/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Curve metric'), { target: { value: 'brier_score' } });
    expect(screen.getAllByText('0.0600').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Shuffle SD is not confidence; dependence is not causation.')).toBeTruthy();
  });
  it('provides a reproducible empty state without inventing results', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ status: 'unavailable', snapshot_id: 'a'.repeat(64), warning: 'No offline run loaded.' }));
    mount(); await screen.findByText('No offline run loaded.');
    expect(screen.getByText(/python -m signalrank.demo --no-serve/)).toBeTruthy();
    expect(screen.queryByText('Does more history help?')).toBeNull();
  });
  it('supports explicit retry after a failed read', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
    mount(); await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Does more history help?')).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls).toHaveLength(2);
  });
  it('does not request offline evidence while the view is inactive', async () => {
    mount('#overview');
    await waitFor(() => expect(vi.mocked(fetch).mock.calls).toHaveLength(0));
  });
});
