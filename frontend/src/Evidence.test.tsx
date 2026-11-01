import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Evidence, type EvidenceReport } from './Evidence';

const report: EvidenceReport = {
  warning: 'Synthetic development evidence only.', target: 'Simulated catalog inclusion', dataset_sha256: 'b'.repeat(64),
  support: { count: 500, positives: 40, prevalence: .08, budget: 50, captured: 20, missed: 20, selected_negatives: 30 },
  comparisons: [{ name: 'Combined · calibrated', average_precision: .3, brier_score: .06, recall_at_50: .5 }, { name: 'Severity ranking', average_precision: .4, recall_at_50: .6 }],
  average_precision_delta_vs_severity: -.1, splits: { test: { count: 500, first: '2025-01-01', last: '2025-05-01' } },
  temporal_windows: 3, evaluated_temporal_windows: 2, lowest_ap_slices: [],
  provenance: { snapshot_id: 'a'.repeat(64) }, limitations: ['No demonstrated real-world performance.'],
};
function mount(hash = 'evidence') {
  location.hash = hash;
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><Evidence/></QueryClientProvider>);
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('keeps negative baseline differences and unavailable metrics visible', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url === '/api/evidence' ? report : { status: 'unavailable' } })));
  mount();
  await screen.findByText('What does this experiment establish?');
  expect(screen.getByText('-0.100')).toBeTruthy();
  expect(screen.getByText('Unavailable')).toBeTruthy();
  expect(screen.getByText('2 of 3 saved temporal windows evaluable.')).toBeTruthy();
  expect(screen.queryByText('Keep the workbench small.')).toBeNull();
  expect(screen.getByRole('link', { name: 'Export concise report' }).getAttribute('href')).toBe('/api/export/evidence');
});

it('does not fetch an inactive view and recovers from an evidence failure', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({ ok: true, json: async () => report }).mockResolvedValue({ ok: true, json: async () => ({ status: 'unavailable' }) });
  vi.stubGlobal('fetch', fetcher);
  mount('overview');
  await waitFor(() => expect(fetcher).not.toHaveBeenCalled());
  location.hash = 'evidence'; window.dispatchEvent(new Event('signalrank:view'));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await screen.findByText('What does this experiment establish?');
});

it('shows a read-only local storage preview and reports refresh failures', async () => {
  const fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => url === '/api/evidence' ? report : { status: 'available', root: '/local/demo', bytes: 1048576, reclaimable_bytes: 0, runs: [], warning: 'Preview only.' } }));
  vi.stubGlobal('fetch', fetcher);
  mount();
  await screen.findByText('Keep the workbench small.');
  expect(screen.getByText('1.0 MiB')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /delete|apply|remove/i })).toBeNull();
  fetcher.mockResolvedValueOnce({ ok: false, json: async () => report });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh storage' }));
  await screen.findByText(/Storage inventory unavailable/);
});
