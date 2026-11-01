import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from './api';
import { ScrollTable } from './Lab';
import './evidence.css';

type Metrics = { name: string; average_precision: number; brier_score?: number; recall_at_50: number };
export type EvidenceReport = {
  warning: string; target: string; dataset_sha256: string;
  support: { count: number | null; positives: number | null; prevalence: number; budget: number | null; captured: number | null; missed: number | null; selected_negatives: number | null };
  splits: Record<string, { count: number; first: string; last: string }>;
  comparisons: Metrics[]; average_precision_delta_vs_severity: number;
  temporal_windows: number; evaluated_temporal_windows: number;
  lowest_ap_slices: { dimension: string; group: string; count: number; positives: number; metrics: { average_precision: number } }[];
  limitations: string[]; provenance: { snapshot_id?: string; artifact_id?: string; run_id?: string };
};
type StorageReport = { status: string; root?: string; bytes?: number; reclaimable_bytes?: number; measurement?: string; warning?: string; runs?: { run_id: string; bytes: number; eligible: boolean; reason: string }[] };
const fixed = (v: number | undefined | null) => v == null ? 'Unavailable' : v.toFixed(3);
const percent = (v: number) => (100 * v).toFixed(1) + '%';
const bytes = (v = 0) => (v / 1024 / 1024).toFixed(1) + ' MiB';

export function Evidence() {
  const matches = () => location.hash.slice(1).split(/[/?]/)[0] === 'evidence';
  const [active, setActive] = useState(matches);
  useEffect(() => {
    const update = () => setActive(matches());
    window.addEventListener('hashchange', update); window.addEventListener('signalrank:view', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('signalrank:view', update); };
  }, []);
  const query = useQuery({ queryKey: ['evidence'], queryFn: ({ signal }) => get<EvidenceReport>('/api/evidence', signal), enabled: active });
  const storage = useQuery({ queryKey: ['storage'], queryFn: ({ signal }) => get<StorageReport>('/api/storage', signal), enabled: active && !!query.data });
  if (!active) return null;
  if (query.error) return <div className="error" role="alert"><p>{query.error.message}</p><button className="button" onClick={() => void query.refetch()}>Try again</button></div>;
  if (!query.data) return <p role="status">Loading saved experiment evidence…</p>;
  const r = query.data, s = r.support;
  return <div className="lab-workspace evidence-workspace">
    <p className="notice subtle">{r.warning}</p>
    <article className="panel evidence-summary"><div className="panel-head"><div><p className="overline">RESULT / BASELINE / LIMITS</p><h2>What does this experiment establish?</h2></div><div className="evidence-actions"><a className="button" href="/api/export/evidence" download="signalrank-evidence.md">Export concise report</a><a href="/api/evidence" download="signalrank-evidence.json">Evidence JSON ↗</a></div></div>
      <p>SignalRank ranks fictional records for review. This summary brings the existing evaluation together; opening it does not train or select a model.</p>
      <div className="metrics">{[
        ['Evaluation records', s.count ?? 'Unavailable', `${s.positives ?? 'Unavailable'} positive outcomes`],
        ['Model average precision', fixed(r.comparisons[0].average_precision), `Severity baseline ${fixed(r.comparisons[1].average_precision)}`],
        ['Positives captured', s.captured ?? 'Unavailable', `Global review budget ${s.budget ?? 'unavailable'}`],
      ].map(([label, value, note]) => <div className="metric" key={label}><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></div>)}</div>
      <p className="evidence-result">AP difference versus severity: <strong>{r.average_precision_delta_vs_severity >= 0 ? '+' : ''}{fixed(r.average_precision_delta_vs_severity)}</strong>. Descriptive difference on this cohort; no significance claim.</p>
      <p className="caption">Prevalence {percent(s.prevalence)} · {s.missed ?? 'Unavailable'} missed positives · {s.selected_negatives ?? 'Unavailable'} selected negatives. The budget applies once across the entire evaluation cohort.</p>
    </article>
    <article className="panel"><div className="panel-head"><h2>Compare on the same observations.</h2><a href="#models">Full model evaluation →</a></div><ScrollTable label="Evidence model comparisons"><table><thead><tr><th>Candidate</th><th>Average precision ↑</th><th>Brier ↓</th><th>Recall at 50 ↑</th></tr></thead><tbody>{r.comparisons.map(row => <tr key={row.name}><td>{row.name}</td><td>{fixed(row.average_precision)}</td><td>{fixed(row.brier_score)}</td><td>{percent(row.recall_at_50)}</td></tr>)}</tbody></table></ScrollTable><p className="caption">Severity is a ranking score, so it has no Brier score. Other candidates use different inputs or calibration; this is not a controlled architecture comparison.</p></article>
    <div className="evidence-grid"><article className="panel"><p className="overline">TIME / SUPPORT</p><h2>Where the evidence comes from.</h2><dl className="evidence-splits">{['train', 'calibration', 'test'].filter(name => r.splits[name]).map(name => { const split = r.splits[name]; return <div key={name}><dt>{name} · {split.count} records</dt><dd>{split.first} → {split.last}</dd></div>; })}</dl><p>{r.evaluated_temporal_windows} of {r.temporal_windows} saved temporal windows evaluable.</p><p className="caption">Thirty-day label-maturity gaps separate the chronological partitions. These are explored synthetic development windows.</p></article>
      <article className="panel"><p className="overline">ERRORS / SUPPORT</p><h2>Inspect the weaker slices.</h2>{r.lowest_ap_slices.length ? <ul className="evidence-slices">{r.lowest_ap_slices.map(row => <li key={row.dimension + row.group}><strong>{row.group}</strong><span>{row.dimension} · AP {fixed(row.metrics.average_precision)}</span><span>{row.count} records · {row.positives} positives</span></li>)}</ul> : <p>No supported slice metrics saved.</p>}<p className="caption">Up to three lowest-AP slices that pass the existing display gate. Groups overlap; the gate does not establish statistical adequacy.</p><a href="#diagnostics">Inspect all slices and errors →</a></article></div>
    <article className="panel"><h2>What we can explain—and what remains unproven.</h2><ul>{r.limitations.map(note => <li key={note}>{note}</li>)}</ul><details><summary>Dataset and snapshot identifiers</summary><p className="replay-fingerprint">Dataset {r.dataset_sha256}</p><p className="replay-fingerprint">Snapshot {r.provenance.snapshot_id ?? 'Unavailable'}</p><p className="replay-fingerprint">Model artifact {r.provenance.artifact_id ?? 'Unavailable — startup baseline has no saved artifact'}</p><p className="replay-fingerprint">Training run {r.provenance.run_id ?? 'Unavailable'}</p></details></article>
    {storage.data?.status === 'available' && <article className="panel"><div className="panel-head"><div><p className="overline">LOCAL / STORAGE</p><h2>Keep the workbench small.</h2></div><button className="button" onClick={() => void storage.refetch()}>Refresh storage</button></div><div className="metrics"><div className="metric"><span className="metric-label">Current artifact root</span><strong className="metric-value">{bytes(storage.data.bytes)}</strong></div><div className="metric"><span className="metric-label">Retention preview</span><strong className="metric-value">{bytes(storage.data.reclaimable_bytes)}</strong><span className="metric-note">Potential removal, keeping three newest runs and selected/trusted runs</span></div></div><p className="caption replay-fingerprint">{storage.data.root}</p><p>{storage.data.measurement}</p><details><summary>Runs and retention decisions</summary><ScrollTable label="Storage retention preview"><table><thead><tr><th>Run</th><th>Size</th><th>Retention decision</th></tr></thead><tbody>{storage.data.runs?.map(run => <tr key={run.run_id}><td><code>{run.run_id.slice(0, 12)}</code></td><td>{bytes(run.bytes)}</td><td>{run.eligible ? 'Eligible for reviewed cleanup' : run.reason}</td></tr>)}</tbody></table></ScrollTable></details><p className="caption">{storage.data.warning}</p><p>No deletion control is exposed in the browser. Use the documented local storage CLI to create and review an exact cleanup plan.</p></article>}
    {storage.error && <p className="error" role="alert">Storage inventory unavailable. <button className="button" onClick={() => void storage.refetch()}>Retry storage</button></p>}
  </div>;
}
