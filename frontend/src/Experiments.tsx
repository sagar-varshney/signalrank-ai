import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { get } from './api';
import { delta, incompatibilities, metricLabels } from './comparison';
import { navigate, readRoute } from './route';
import type { History, Snapshot } from './types';
import { SnapshotUncertainty } from './Lab';

function Table({ label, children }: { label: string; children: ReactNode }) {
  return <div className="table-wrap" tabIndex={0} role="region" aria-label={label + ', scroll horizontally if needed'}>{children}</div>;
}
function ErrorState({ error, retry }: { error: Error; retry: () => void }) {
  return <div className="experiment-error" role="alert"><div><strong>Unable to load experiment data</strong><p>{error.message}</p></div><button className="button" onClick={retry}>Try again</button></div>;
}
function StateMessage({ children }: { children: ReactNode }) {
  return <p className="experiment-empty" role="status">{children}</p>;
}

export function Comparison({ left, right }: { left: Snapshot; right: Snapshot }) {
  const reasons = incompatibilities(left.report, right.report);
  function exportComparison() {
    const output = { snapshot_a: left.id, snapshot_b: right.id, comparable: !reasons.length, incompatibilities: reasons,
      metrics: metricLabels.map(([key]) => ({ metric: key, a: left.report.model[key], b: right.report.model[key], delta_b_minus_a: reasons.length ? null : right.report.model[key] - left.report.model[key] })),
      interpretation: 'Descriptive synthetic development results; deltas are not statistical evidence of improvement.' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'signalrank-comparison.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    <div className={'comparison-verdict ' + (reasons.length ? 'incompatible' : '')}>
      <span className="badge warning">{reasons.length ? 'Different evaluation conditions' : 'Matched evaluation conditions'}</span>
      <p>{reasons.length ? 'Differences: ' + reasons.join(', ') + '. Metric deltas are unavailable.' : 'The dataset, target, horizon and temporal partitions match. Configurations and code may differ.'}</p>
    </div>
    <Table label="Selected experiment comparison"><table><thead><tr><th>Metric</th><th className="numeric">A · {left.id.slice(0, 8)}</th><th className="numeric">B · {right.id.slice(0, 8)}</th><th className="numeric">B − A</th></tr></thead>
      <tbody>{metricLabels.map(([key, label, direction]) => <tr key={key}><td>{label}<span className="caption">{direction}</span></td><td className="numeric">{left.report.model[key].toFixed(4)}</td><td className="numeric">{right.report.model[key].toFixed(4)}</td><td className="numeric">{reasons.length ? 'Unavailable' : delta(right.report.model[key] - left.report.model[key])}</td></tr>)}</tbody></table></Table>
    <div className="comparison-foot"><p className="caption">A delta is descriptive. These explored synthetic results do not establish real-world predictive value or statistical significance.</p><button className="button" onClick={exportComparison}>Export comparison</button></div>
  </>;
}

function ComparePanel({ selected, active }: { selected: string[]; active: boolean }) {
  const results = useQueries({ queries: selected.map(id => ({ queryKey: ['snapshot', id], queryFn: ({ signal }: { signal: AbortSignal }) => get<Snapshot>('/api/experiments/' + encodeURIComponent(id), signal), enabled: active, staleTime: Infinity })) });
  const error = results.find(q => q.error)?.error;
  return <article className="panel comparison-panel"><div className="panel-head"><div><p className="overline">COMPARE / {selected.length} OF 2 SELECTED</p><h2>Compare experiments</h2></div>{selected.length > 0 && <button className="button" onClick={() => navigate({ selected: [] })}>Clear selection</button>}</div>
    <div className="selection-slots">{[0, 1].map(i => <div className={selected[i] ? 'filled' : ''} key={i}><span>{i === 0 ? 'A' : 'B'}</span>{selected[i] ? <><div><code>{selected[i].slice(0, 12)}</code>{results[i]?.data && <p className="caption">Seed {results[i].data!.report.seed} · C {results[i].data!.report.configuration?.regularization_c ?? 'unrecorded'}</p>}</div><button aria-label={'Remove selection ' + (i === 0 ? 'A' : 'B')} onClick={() => navigate({ selected: selected.filter((_, index) => index !== i) })}>×</button></> : <p>Choose a snapshot from the table</p>}</div>)}</div>
    {error ? <ErrorState error={error} retry={() => results.forEach(q => void q.refetch())} /> : selected.length === 2 ? results.every(q => q.data) ? <Comparison left={results[0].data!} right={results[1].data!} /> : <StateMessage>Loading selected experiments…</StateMessage> : <p className="caption">Select any two snapshots, including snapshots on different pages. The selection is saved in the page URL.</p>}
    {active && selected.length===2 && results.every(q=>q.data) && !error && <SnapshotUncertainty a={selected[0]} b={selected[1]}/>}
  </article>;
}

function SnapshotDetail({ id, active }: { id: string; active: boolean }) {
  const query = useQuery({ queryKey: ['snapshot', id], queryFn: ({ signal }) => get<Snapshot>('/api/experiments/' + encodeURIComponent(id), signal), enabled: active && !!id, staleTime: Infinity });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (active && query.data) heading.current?.focus(); }, [active, query.data]);
  if (!id) return null;
  return <article className="panel snapshot-detail" aria-label="Snapshot details">
    {query.error ? <><ErrorState error={query.error} retry={() => void query.refetch()} /><button className="text-button" onClick={() => navigate({ id: '' })}>Return to experiment list →</button></> : !query.data ? <StateMessage>Loading snapshot evidence…</StateMessage> : <>
      <div className="panel-head"><div><p className="overline">SNAPSHOT / {id.slice(0, 12)}</p><h2 ref={heading} tabIndex={-1}>Experiment evidence</h2></div><button className="button" onClick={() => navigate({ id: '' })}>Close details</button></div>
      <div className="experiment-summary"><div><span className="badge warning">{query.data.report.mode} benchmark</span><h3>{query.data.report.target}</h3><p>First saved {new Date(query.data.created_at).toLocaleString()}</p></div><div className="experiment-actions"><a className="button primary" href={'#forecasts/' + id}>Inspect saved forecasts →</a><a className="button" href={'/api/experiments/' + id} download="signalrank-snapshot.json">Export snapshot</a></div></div>
      <div className="metrics">{metricLabels.map(([key, label, direction]) => <div className="metric" key={key}><span className="metric-label">{label}</span><strong className="metric-value">{key === 'recall_at_50' ? (query.data!.report.model[key] * 100).toFixed(1) + '%' : query.data!.report.model[key].toFixed(3)}</strong><span className="metric-note">{direction} · synthetic</span></div>)}</div>
      <h3>Configuration and temporal partitions</h3><div className="configuration-grid"><div><span>Seed</span><strong>{query.data.report.seed}</strong></div><div><span>Generated records</span><strong>{query.data.report.configuration?.count ?? 'Unrecorded'}</strong></div><div><span>Logistic regression C</span><strong>{query.data.report.configuration?.regularization_c ?? 'Unrecorded'}</strong></div><div><span>Forecast horizon</span><strong>{query.data.report.horizon_days} days</strong></div></div>
      <Table label="Saved temporal partitions"><table><thead><tr><th>Partition</th><th>First observation</th><th>Last observation</th><th className="numeric">Records</th></tr></thead><tbody>{(['train', 'calibration', 'test'] as const).map(name => <tr key={name}><td>{name}</td><td>{query.data!.report.splits[name].first}</td><td>{query.data!.report.splits[name].last}</td><td className="numeric">{query.data!.report.splits[name].count}</td></tr>)}</tbody></table></Table>
      {query.data.report.temporal_evaluation && <p className="caption">{query.data.report.temporal_evaluation.folds.length} archived temporal windows · {query.data.report.temporal_evaluation.protocol}. Full window results are in the snapshot export.</p>}
      <details className="provenance-details"><summary>Dataset, model and runtime provenance</summary><dl className="evidence-facts">{[
        ['Snapshot ID', query.data.id], ['Dataset SHA-256', query.data.report.dataset_sha256], ['Model code SHA-256', query.data.provenance.core_sha256], ['Model', query.data.provenance.model],
        ['Runtime', 'Python ' + query.data.provenance.python + ' · NumPy ' + query.data.provenance.numpy + ' · scikit-learn ' + query.data.provenance.scikit_learn], ['Forecast evidence', query.data.provenance.forecast_scope],
      ].map(([label, value]) => <Fragment key={label}><dt>{label}</dt><dd>{value}</dd></Fragment>)}</dl></details>
      <p className="caption">{query.data.report.warning}</p>
    </>}
  </article>;
}

export function Experiments() {
  const [route, setRoute] = useState(readRoute);
  const [draft, setDraft] = useState(route.search);
  useEffect(() => { const update = () => setRoute(readRoute()); window.addEventListener('hashchange', update); window.addEventListener('signalrank:view', update); return () => { window.removeEventListener('hashchange', update); window.removeEventListener('signalrank:view', update); }; }, []);
  useEffect(() => setDraft(route.search), [route.search]);
  const list = useQuery({ queryKey: ['experiments', route.page, route.search], queryFn: ({ signal }) => get<History>('/api/experiments?' + new URLSearchParams({ limit: '10', offset: String(route.page * 10), search: route.search }), signal), enabled: route.active, staleTime: 30000 });
  function select(id: string) { navigate({ selected: route.selected.includes(id) ? route.selected.filter(x => x !== id) : [...route.selected, id].slice(0, 2) }); }
  return <div className="react-experiments">
    <div className="experiment-intro"><span className="badge">LOCAL SNAPSHOT LIBRARY</span><p>Explore saved results, compare configurations, and follow each prediction back to its evidence.</p></div>
    <ComparePanel selected={route.selected} active={route.active} />
    <article className="panel"><div className="panel-head"><h2>Saved experiments</h2><span className="caption" role="status">{list.data ? list.data.total + ' matching snapshots' : 'Loading library…'}</span></div>
      <form className="filters experiment-filters" onSubmit={e => { e.preventDefault(); navigate({ search: draft.trim(), page: 0 }); }}><label>Search snapshots<input type="search" maxLength={128} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Snapshot, dataset hash, seed or date" /></label><button className="button" type="submit">Apply search</button>{route.search && <button className="text-button" type="button" onClick={() => navigate({ search: '', page: 0 })}>Clear search</button>}<button className="button refresh-library" type="button" disabled={list.isFetching} onClick={() => void list.refetch()}>{list.isFetching ? 'Refreshing…' : 'Refresh library'}</button></form>
      {list.error ? <ErrorState error={list.error} retry={() => void list.refetch()} /> : !list.data ? <StateMessage>Loading saved experiments…</StateMessage> : <>
        <Table label="Saved experiments"><table><thead><tr><th>Compare</th><th>Snapshot / first saved</th><th>Configuration</th><th className="numeric">AP ↑</th><th className="numeric">Brier ↓</th><th>Evidence</th></tr></thead><tbody>{list.data.items.map(item => <tr key={item.id} className={route.selected.includes(item.id) ? 'selected-row' : ''}><td><input type="checkbox" aria-label={'Compare snapshot ' + item.id.slice(0, 10)} checked={route.selected.includes(item.id)} disabled={!route.selected.includes(item.id) && route.selected.length === 2} onChange={() => select(item.id)} /></td><td><code>{item.id.slice(0, 10)}</code>{item.id === list.data!.current_id && <span className="badge current-badge">Current</span>}<span className="caption">{new Date(item.created_at).toLocaleString()}</span></td><td>Seed {item.seed} · C {item.configuration?.regularization_c ?? 'unrecorded'}<span className="caption">{item.configuration?.count?.toLocaleString() ?? 'Unknown count'} records · {item.temporal_windows} temporal windows</span></td><td className="numeric">{item.model.average_precision.toFixed(3)}</td><td className="numeric">{item.model.brier_score.toFixed(3)}</td><td><button className="row-link" aria-label={'Inspect snapshot ' + item.id.slice(0, 10)} onClick={() => navigate({ id: item.id })}>Inspect →</button></td></tr>)}</tbody></table></Table>
        {!list.data.items.length && <StateMessage>{route.search ? 'No snapshots match this search.' : route.page ? 'This page has no snapshots. Return to the first page.' : 'No snapshots have been saved yet.'}</StateMessage>}
        <div className="pagination"><button className="button" disabled={route.page === 0} onClick={() => navigate({ page: Math.max(0, route.page - 1) })}>Previous</button><span className="caption">Page {route.page + 1} of {Math.max(1, Math.ceil(list.data.total / 10))}</span><button className="button" disabled={(route.page + 1) * 10 >= list.data.total} onClick={() => navigate({ page: route.page + 1 })}>Next</button>{route.page > 0 && !list.data.items.length && <button className="button" onClick={() => navigate({ page: 0 })}>First page</button>}</div>
      </>}
    </article>
    <SnapshotDetail id={route.id} active={route.active} />
    <p className="caption">Snapshots preserve their first-save time. Identical payloads are saved once; each offline training execution has its own run record.</p>
  </div>;
}
