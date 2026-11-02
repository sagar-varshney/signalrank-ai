import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Study, type StudyReport } from './Study';

const report: StudyReport = {
  status: 'blocked', decision: 'Resolve the scientific gates first.', warning: 'Local byte checks do not validate historical outcomes.',
  cohort: { available: true, selected: 500, processed: 500, candidates: 428, candidate_labels: { 'provisional negative': 428 }, missing_metrics: 98, unknown_metrics: 0, candidate_publication_years: { '2024': 428 }, timestamp_checks: 428, replayed_candidates: 428 },
  archive: { verified_payloads: 20, unique_payloads: 20, references: 30, verified_metadata: 30, unique_metadata: 30, catalog_verified: true, notices: [{ source: 'cve', status: 'verified' }, { source: 'cisa_kev', status: 'verified' }] },
  read_budget: { limit_bytes: 33554432, bytes_read: 1024, exhausted: false, network_requests: 0, bytes_written: 0 },
  gates: [{ id: 'archive', name: 'Archived byte integrity', status: 'verified', finding: 'Recorded bytes match.' }, { id: 'classes', name: 'Candidate outcome support', status: 'blocked', finding: 'No positive candidates.' }, { id: 'history', name: 'Historical outcome validity', status: 'unresolved', finding: 'Catalog history is unaudited.' }],
  issues: [], issue_count: 0, limitations: ['No first-availability proof.'],
};
function mount(hash = 'data') {
  location.hash = hash;
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><Study/></QueryClientProvider>);
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('keeps fitting blocked even when all archived payloads match', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => report })));
  mount();
  await screen.findByText('Can this cohort support an evaluation?');
  expect(screen.getByText('Fitting blocked')).toBeTruthy();
  expect(screen.getByText('Verified local check')).toBeTruthy();
  expect(screen.getByText('428 provisional negatives; not verified negatives')).toBeTruthy();
  expect(screen.getByText('Catalog history is unaudited.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Export local review' }).getAttribute('href')).toBe('/api/study-readiness');
  expect(screen.queryByRole('button', { name: /train|acquire|download/i })).toBeNull();
});

it('does not fetch an inactive view, handles failure and supports explicit recheck', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValue({ ok: true, json: async () => report });
  vi.stubGlobal('fetch', fetcher);
  mount('overview');
  await waitFor(() => expect(fetcher).not.toHaveBeenCalled());
  location.hash = 'data'; window.dispatchEvent(new Event('signalrank:view'));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Retry local review' }));
  await screen.findByText('Can this cohort support an evaluation?');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('public unavailability and missing cohort evidence do not appear as observed zeros', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ status: 'unavailable', reason: 'Archived real-data feasibility is local-only' }) })));
  mount();
  await screen.findByText('Archived real-data feasibility is local-only');
  expect(screen.queryByText('Positive candidates')).toBeNull();
  cleanup();
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ ...report, cohort: { ...report.cohort, available: false } }) })));
  mount();
  await screen.findByText('Can this cohort support an evaluation?');
  expect(screen.getAllByText('Unavailable')).toHaveLength(3);
  expect(screen.getByText('Outcome support is unknown')).toBeTruthy();
});
