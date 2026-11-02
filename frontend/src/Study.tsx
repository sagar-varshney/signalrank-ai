import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from './api';
import { ScrollTable } from './Lab';
import './study.css';

export type StudyReport = {
  status: string; reason?: string; warning?: string; decision?: string;
  cohort?: { available: boolean; selected: number; processed: number; candidates: number; candidate_labels: Record<string, number>; missing_metrics: number; unknown_metrics: number; candidate_publication_years: Record<string, number>; timestamp_checks: number; replayed_candidates: number };
  archive?: { verified_payloads: number; unique_payloads: number; references: number; verified_metadata: number; unique_metadata: number; catalog_verified: boolean; notices: { source: string; status: string }[] };
  read_budget?: { limit_bytes: number; bytes_read: number; exhausted: boolean; network_requests: number; bytes_written: number };
  gates?: { id: string; name: string; status: string; finding: string }[];
  issues?: { file: string; status: string; reason: string }[]; issue_count?: number; limitations?: string[];
};
export function Study() {
  const matches = () => location.hash.slice(1).split(/[/?]/)[0] === 'data';
  const [active, setActive] = useState(matches);
  useEffect(() => { const update = () => setActive(matches()); window.addEventListener('hashchange', update); window.addEventListener('signalrank:view', update); return () => { window.removeEventListener('hashchange', update); window.removeEventListener('signalrank:view', update); }; }, []);
  const query = useQuery({ queryKey: ['study-readiness'], queryFn: ({ signal }) => get<StudyReport>('/api/study-readiness', signal), enabled: active, staleTime: Infinity });
  if (!active) return null;
  if (query.error) return <article className="panel" role="alert"><h2>Local evidence review unavailable</h2><p>{query.error.message}</p><button className="button" onClick={() => void query.refetch()}>Retry local review</button></article>;
  if (!query.data) return <p role="status">Checking existing local evidence…</p>;
  const r = query.data;
  if (r.status === 'unavailable') return <p className="notice subtle">{r.reason}</p>;
  if (!r.cohort || !r.archive || !r.read_budget) return <p className="error" role="alert">The local review is incomplete. No readiness decision can be inferred.</p>;
  const c = r.cohort, a = r.archive, b = r.read_budget;
  return <article className="panel study-panel"><div className="panel-head"><div><p className="overline">REAL DATA / EXISTING EVIDENCE ONLY</p><h2>Can this cohort support an evaluation?</h2></div><div className="study-actions"><button className="button" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Reviewing…' : 'Recheck local evidence'}</button><a className="button" href="/api/study-readiness" download="signalrank-study-review.json">Export local review</a></div></div>
    <p className="study-decision"><span className="badge warning">Fitting blocked</span> {r.decision}</p>
    <div className="metrics study-metrics">{[
      ['Selected records', c.available ? String(c.selected) : 'Unavailable', c.available ? `${c.processed} processed · ${c.candidates} candidates` : 'Local cohort evidence could not be read'],
      ['Positive candidates', c.available ? String(c.candidate_labels.positive ?? 0) : 'Unavailable', c.available ? `${c.candidate_labels['provisional negative'] ?? 0} provisional negatives; not verified negatives` : 'Outcome support is unknown'],
      ['Missing historical metrics', c.available ? String(c.missing_metrics) : 'Unavailable', c.available ? `Of ${c.candidates} candidates · ${c.unknown_metrics} unknown flags` : 'Feature availability is unknown'],
    ].map(([label, value, note]) => <div className="metric" key={label}><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></div>)}</div>
    <p className="caption">{r.warning}</p>
    <ScrollTable label="Real-data feasibility gates"><table><thead><tr><th>Check</th><th>Finding</th><th>Status</th></tr></thead><tbody>{r.gates?.map(gate => <tr key={gate.id}><td>{gate.name}</td><td>{gate.finding}</td><td><span className={'badge' + (gate.status === 'verified' ? '' : ' warning')}>{gate.status === 'verified' ? 'Verified local check' : gate.status === 'blocked' ? 'Blocked' : 'Unresolved'}</span></td></tr>)}</tbody></table></ScrollTable>
    <div className="study-details"><div><h3>What was checked locally</h3><ul><li>{a.verified_payloads} / {a.unique_payloads} unique payload files match their hashes.</li><li>{a.verified_metadata} / {a.unique_metadata} cache metadata entries agree with their references.</li><li>{a.references} reference entries reviewed; {a.catalog_verified ? 'catalog checksum matches' : 'catalog evidence unresolved'}.</li><li>{a.notices.filter(n => n.status === 'verified').length} / {a.notices.length} archived source notices match recorded hashes.</li></ul></div><div><h3>Publication years in candidate rows</h3>{Object.keys(c.candidate_publication_years).length ? <dl className="study-years">{Object.entries(c.candidate_publication_years).map(([year, count]) => <div key={year}><dt>{year}</dt><dd>{count} candidates</dd></div>)}</dl> : <p>Publication-year evidence unavailable.</p>}<p className="caption">A CVE identifier year does not define the publication year. This is an exploratory selection, not a new representative cohort.</p></div></div>
    <details><summary>Read budget, missing evidence and limitations</summary><p>{(b.bytes_read / 1048576).toFixed(2)} / {(b.limit_bytes / 1048576).toFixed(0)} MiB read · {b.network_requests} network requests · {b.bytes_written} bytes written. {b.exhausted ? 'Read limit reached; evidence remains unresolved.' : 'No acquisition or repair performed.'}</p><p>{r.issue_count ?? 0} local file issues. Up to 20 are shown; export the input fingerprints for reproducibility.</p>{!!r.issues?.length && <ScrollTable label="Local archive issues"><table><thead><tr><th>File</th><th>Status</th><th>Reason</th></tr></thead><tbody>{r.issues.map((issue, i) => <tr key={i}><td><code>{issue.file}</code></td><td>{issue.status}</td><td>{issue.reason}</td></tr>)}</tbody></table></ScrollTable>}<ul>{r.limitations?.map(note => <li key={note}>{note}</li>)}</ul></details>
  </article>;
}
