import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from './api';
import { ScrollTable } from './Lab';
import './replay.css';

type Metrics = { average_precision: number; brier_score: number; count: number; positives: number; prevalence: number };
type Drift = { feature: string; distance: number | null; alert: boolean | null; current_count: number; reference_count: number };
type Policy = { name: string; reviewed: number; population: number; positives: number; captured: number; missed: number; precision: number | null; recall: number | null };
type Checkpoint = { as_of: string; window_first: string; seen: number; mature: number; pending: number; metrics: Metrics | null; closed_weeks: number; policies: Policy[]; random_expected_captured: number | null; drift: Drift[] };
type Run = { id: string; name: string; seed: number; start: string; end: string; change_at: string | null; prediction_sha256: string; checkpoints: Checkpoint[]; alert_evidence: { prechange_windows: number; prechange_input_alerts: number; detection_delay_days: number | null; interpretation: string } };
export type ReplayReport = { status: string; warning: string; snapshot_id?: string; protocol?: string; configuration?: { seeds: number[]; weekly_budget: number; drift_threshold: number; minimum_support: number; horizon_days: number }; runs?: Run[] };
type Receipt = { total: number; checkpoint: Checkpoint; records: { id: string; observed_at: string; probability: number; outcome_available_at: string; outcome: number | null }[] };
const fixed = (value: number | null | undefined) => value == null ? 'Unavailable' : value.toFixed(4);
const pct = (value: number | null) => value == null ? 'Unavailable' : (value * 100).toFixed(1) + '%';
const featureNames: Record<string, string> = { severity: 'Severity', description: 'Description category', remote: 'Remote', authentication_required: 'Authentication required', prediction: 'Predicted probability' };

function useActive(name: string) {
  const matches = () => location.hash.slice(1).split(/[/?]/)[0] === name;
  const [active, setActive] = useState(matches);
  useEffect(() => { const update = () => setActive(matches()); window.addEventListener('hashchange', update); window.addEventListener('signalrank:view', update); return () => { window.removeEventListener('hashchange', update); window.removeEventListener('signalrank:view', update); }; }, [name]);
  return active;
}

function Timeline({ run, metric, index, threshold }: { run: Run; metric: 'drift' | 'brier'; index: number; threshold: number }) {
  const values = run.checkpoints.map((p, i) => ({ i, value: i > index ? null : metric === 'brier' ? p.metrics?.brier_score ?? null : Math.max(...p.drift.filter(d => d.feature !== 'prediction' && d.distance !== null).map(d => d.distance!), 0) }));
  const x = (i: number) => 55 + i / Math.max(1, values.length - 1) * 545;
  const y = (v: number) => 240 - v * 200;
  return <svg className="replay-chart" viewBox="0 0 640 295" role="img" aria-label={metric === 'drift' ? 'Maximum input distance by simulated week' : 'Cumulative Brier score on mature outcomes by simulated week'}>
    {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1="55" x2="600" y1={y(v)} y2={y(v)} stroke="var(--line)"/><text x="42" y={y(v) + 4} textAnchor="end">{v}</text></g>)}
    {metric === 'drift' && <line x1="55" x2="600" y1={y(threshold)} y2={y(threshold)} stroke="var(--muted)" strokeDasharray="5 4"/>}
    {run.change_at && run.change_at <= run.checkpoints[index].as_of && <line x1={x(run.checkpoints.findIndex(p => p.as_of >= run.change_at!))} x2={x(run.checkpoints.findIndex(p => p.as_of >= run.change_at!))} y1="30" y2="240" stroke="var(--control)" strokeDasharray="2 4"/>}
    <polyline points={values.filter(p => p.value !== null).map(p => `${x(p.i)},${y(p.value!)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2"/>
    {values.filter(p => p.value !== null).map(p => <circle key={p.i} cx={x(p.i)} cy={y(p.value!)} r={p.i === index ? 6 : 3} fill={p.i === index ? 'var(--hero-accent)' : 'var(--accent)'}><title>{run.checkpoints[p.i].as_of}: {fixed(p.value)}</title></circle>)}
    <text x="55" y="267">{run.checkpoints[0].as_of}</text><text x="600" y="267" textAnchor="end">{run.checkpoints.at(-1)!.as_of}</text><text x="325" y="290" textAnchor="middle">Simulated checkpoint date · not wall-clock time</text>
  </svg>;
}

export function Replay() {
  const active = useActive('replay');
  const query = useQuery({ queryKey: ['replay'], queryFn: ({ signal }) => get<ReplayReport>('/api/replay', signal), enabled: active });
  const [scenario, setScenario] = useState('stable'), [seed, setSeed] = useState(2718), [position, setPosition] = useState(-1), [page, setPage] = useState(0);
  const [chart, setChart] = useState<'drift' | 'brier'>('drift');
  const data = query.data, run = data?.runs?.find(r => r.id === scenario && r.seed === seed);
  const index = run ? position < 0 ? run.checkpoints.length - 1 : Math.min(position, run.checkpoints.length - 1) : 0;
  const params = new URLSearchParams({ scenario, seed: String(seed), checkpoint: String(index) });
  const receipt = useQuery({ queryKey: ['replay-checkpoint', scenario, seed, index, page], queryFn: ({ signal }) => get<Receipt>('/api/replay/checkpoint?' + params + '&offset=' + page * 25 + '&limit=25', signal), enabled: active && !!run });
  if (query.error) return <ReadError message={query.error.message} retry={() => void query.refetch()}/>;
  if (!data) return <p className="experiment-empty" role="status">Loading saved replay evidence…</p>;
  if (data.status !== 'available' || !run || !data.configuration) return <p className="notice subtle">{data.warning} <code>python -m signalrank.demo</code></p>;
  const point = run.checkpoints[index];
  return <div className="lab-workspace replay-workspace"><p className="notice subtle">{data.warning}</p>
    <article className="panel"><div className="panel-head"><div><p className="overline">FROZEN MODEL / SIMULATED CLOCK</p><h2>Rewind the evidence.</h2></div><a className="button" href={'/api/replay/export?' + params} download>Export this checkpoint</a></div>
      <div className="replay-controls"><label>Replay scenario<select value={scenario} onChange={e => { setScenario(e.target.value); setPage(0); }}>{Array.from(new Map(data.runs!.map(r => [r.id, r.name]))).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Simulation seed<select value={seed} onChange={e => { setSeed(Number(e.target.value)); setPage(0); }}>{data.configuration.seeds.map(s => <option key={s}>{s}</option>)}</select></label><label>Timeline metric<select value={chart} onChange={e => setChart(e.target.value as typeof chart)}><option value="drift">Maximum input distance</option><option value="brier">Mature cumulative Brier ↓</option></select></label></div>
      <Timeline run={run} metric={chart} index={index} threshold={data.configuration.drift_threshold}/>
      <label className="replay-slider" htmlFor="replay-position">Simulated checkpoint <output>{point.as_of}</output><input id="replay-position" type="range" min="0" max={run.checkpoints.length - 1} value={index} onChange={e => { setPosition(Number(e.target.value)); setPage(0); }}/></label>
      <p className="caption">{chart === 'drift' ? 'Dashed horizontal line: illustrative input-alert threshold. Prediction drift is reported separately below.' : 'Only matured outcomes contribute. Cumulative scores can hide or lag recent degradation; they are not a performance alarm.'} {run.change_at ? `Dotted vertical line: scheduled generator change at ${run.change_at}.` : 'No generator change is scheduled in this control.'}</p>
      <div className="metrics replay-metrics"><Stat label="Records seen" value={point.seen}/><Stat label="Mature outcomes" value={point.mature}/><Stat label="Pending outcomes" value={point.pending}/><Stat label="Mature average precision" value={fixed(point.metrics?.average_precision)}/></div>
      <p className="caption">Labels are withheld for {data.configuration.horizon_days} days, including early positives. No future records or immature outcomes appear in the checkpoint ledger. Metrics require {data.configuration.minimum_support} mature records and both classes—a display guard, not proof of statistical adequacy.</p>
    </article>
    <article className="panel"><div className="panel-head"><div><p className="overline">FIXED REFERENCE / CURRENT WEEK</p><h2>A shift is a question, not a verdict.</h2></div><span className="badge">{point.window_first} → {point.as_of}</span></div>
      <ScrollTable label="Checkpoint distribution drift"><table><thead><tr><th>Distribution</th><th className="numeric">Reference / current n</th><th className="numeric">JS distance</th><th>Indicator</th></tr></thead><tbody>{point.drift.map(d => <tr key={d.feature}><td>{featureNames[d.feature]}</td><td className="numeric">{d.reference_count} / {d.current_count}</td><td className="numeric">{fixed(d.distance)}</td><td>{d.alert === null ? 'Insufficient support' : d.alert ? 'Distribution warning' : 'Below threshold'}</td></tr>)}</tbody></table></ScrollTable>
      <p className="caption">Training inputs are the fixed reference. Severity uses nine fixed bins; probabilities use ten. Jensen-Shannon distance uses base 2. Threshold {data.configuration.drift_threshold.toFixed(2)} is prespecified for this demonstration; it is not a calibrated false-alarm guarantee. Unchanged inputs can coexist with a changed outcome relationship.</p>
      <details><summary>Full-run alert accounting — retrospective simulation evidence</summary><p className="caption">{run.alert_evidence.prechange_input_alerts} input-warning windows out of {run.alert_evidence.prechange_windows} no-change/pre-change windows. Input-warning delay: {run.alert_evidence.detection_delay_days === null ? 'Not detected / not applicable' : run.alert_evidence.detection_delay_days + ' simulated days'}. {run.alert_evidence.interpretation} This accounting uses the whole saved run, not only the selected checkpoint.</p></details>
    </article>
    <article className="panel"><div className="panel-head"><div><p className="overline">WEEK-CLOSE RANKING / MATURE COHORTS ONLY</p><h2>What did the review budget capture?</h2></div><span className="badge">{point.closed_weeks} mature weeks</span></div>
      <p className="caption">Up to {data.configuration.weekly_budget} records per seven-day replay cohort, selected at week close without outcomes. A cohort enters this table only when its final record has matured. This is a simulated weekly policy—not the older whole-test top-50 metric.</p>
      <ScrollTable label="Mature weekly review policies"><table><thead><tr><th>Policy</th><th className="numeric">Reviewed / population</th><th className="numeric">Captured / positives</th><th className="numeric">Missed</th><th className="numeric">Precision</th><th className="numeric">Recall</th></tr></thead><tbody>{point.policies.map(p => <tr key={p.name}><td>{p.name === 'model' ? 'Frozen model' : 'Severity baseline'}</td><td className="numeric">{p.reviewed} / {p.population}</td><td className="numeric">{point.closed_weeks ? p.captured + ' / ' + p.positives : 'Pending'}</td><td className="numeric">{point.closed_weeks ? p.missed : 'Pending'}</td><td className="numeric">{pct(p.precision)}</td><td className="numeric">{pct(p.recall)}</td></tr>)}</tbody></table></ScrollTable><p className="caption">Random selection expected captured positives: {point.random_expected_captured === null ? 'Pending' : point.random_expected_captured.toFixed(2)}. Analytical expectation over the same mature weeks, not an observed run.</p>
    </article>
    <article className="panel"><div className="panel-head"><h2>Prediction ledger at this checkpoint</h2><span className="caption">Saved before label disclosure</span></div>
      {receipt.error ? <ReadError message={receipt.error.message} retry={() => void receipt.refetch()}/> : !receipt.data ? <p role="status">Loading checkpoint ledger…</p> : <><ScrollTable label="As-of prediction ledger"><table><thead><tr><th>Fictional record</th><th>Predicted at</th><th className="numeric">Probability</th><th>Label available at</th><th>As-of outcome</th></tr></thead><tbody>{receipt.data.records.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.observed_at}</td><td className="numeric">{pct(r.probability)}</td><td>{r.outcome_available_at}</td><td>{r.outcome === null ? 'Pending' : r.outcome ? 'Positive' : 'Negative'}</td></tr>)}</tbody></table></ScrollTable><div className="pagination"><button className="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous records</button><span className="caption">{receipt.data.total} seen · page {page + 1}</span><button className="button" disabled={(page + 1) * 25 >= receipt.data.total} onClick={() => setPage(page + 1)}>Next records</button></div></>}
      <p className="caption replay-fingerprint">Prediction ledger SHA-256: {run.prediction_sha256}. Fingerprint covers the whole input-only prediction run, not authenticity or tamper-proof storage. Snapshot: {data.snapshot_id}.</p>
    </article>
  </div>;
}
function Stat({ label, value }: { label: string; value: number | string }) { return <div className="metric"><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong></div>; }
function ReadError({ message, retry }: { message: string; retry: () => void }) { return <div className="experiment-error" role="alert"><div><strong>Saved evidence unavailable</strong><p>{message}</p></div><button className="button" onClick={retry}>Try again</button></div>; }

type ChallengeMetrics = { average_precision: number; brier_score: number; recall_at_50: number };
type Summary = { case: string; name: string; candidate: string; evaluated_seeds: number; metrics: Record<keyof ChallengeMetrics, { mean: number; seed_sd: number | null }> | null };
type ChallengeRun = { case: string; name: string; seed: number; status: string; reason?: string; dataset_sha256: string; splits: Record<string, { count: number; positives: number; first: string; last: string }>; items: { candidate: string; calibrated: ChallengeMetrics }[] };
export type ChallengeReport = { status: string; warning: string; protocol?: string; configuration?: { definitions: Record<string, string>; features: string[]; parameters: Record<string, unknown> }; summary?: Summary[]; items?: ChallengeRun[] };
const candidateNames: Record<string, string> = { logistic: 'Standardized logistic', trees: 'Histogram boosted trees', prevalence: 'Training prevalence' };
export function Challenges() {
  const active = useActive('challenge');
  const query = useQuery({ queryKey: ['challenge'], queryFn: ({ signal }) => get<ChallengeReport>('/api/challenge', signal), enabled: active });
  const [selected, setSelected] = useState('linear');
  if (query.error) return <ReadError message={query.error.message} retry={() => void query.refetch()}/>;
  if (!query.data) return <p className="experiment-empty" role="status">Loading offline challenge evidence…</p>;
  const data = query.data;
  if (data.status !== 'available' || !data.configuration || !data.items || !data.summary) return <p className="notice subtle">{data.warning} <code>python -m signalrank.demo</code></p>;
  return <div className="lab-workspace"><p className="notice subtle">{data.warning}</p><article className="panel"><div className="panel-head"><div><p className="overline">FOUR CASES / THREE SEEDS / FIXED CANDIDATES</p><h2>Challenge the assumptions.</h2></div><a className="button" href="/api/challenge" download="signalrank-challenges.json">Export all evidence</a></div><label>Challenge case<select value={selected} onChange={e => setSelected(e.target.value)}>{Array.from(new Map(data.items.map(r => [r.case, r.name]))).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><p className="caption">{data.configuration.definitions[selected]}</p>
    <ScrollTable label="Challenge seed summary"><table><thead><tr><th>Candidate</th><th className="numeric">Seeds</th><th className="numeric">Mean AP</th><th className="numeric">AP seed SD</th><th className="numeric">Mean Brier ↓</th><th className="numeric">Mean recall@50</th></tr></thead><tbody>{data.summary.filter(s => s.case === selected).map(s => <tr key={s.candidate}><td>{candidateNames[s.candidate]}</td><td className="numeric">{s.evaluated_seeds} / 3</td><td className="numeric">{fixed(s.metrics?.average_precision.mean)}</td><td className="numeric">{fixed(s.metrics?.average_precision.seed_sd)}</td><td className="numeric">{fixed(s.metrics?.brier_score.mean)}</td><td className="numeric">{s.metrics ? pct(s.metrics.recall_at_50.mean) : 'Unavailable'}</td></tr>)}</tbody></table></ScrollTable><p className="caption">Every seed is retained. Seed SD is variability over three fictional datasets, not a confidence interval. No best-model badge or automatic promotion. These numeric categories do not test natural-language generalization.</p></article>
    {data.items.filter(r => r.case === selected).map(r => <article className="panel" key={r.seed}><div className="panel-head"><h2>Seed {r.seed}</h2><span className="badge">{r.status}</span></div><div className="replay-splits">{Object.entries(r.splits).map(([name, s]) => <div key={name}><span className="overline">{name}</span><strong>{s.count} records · {s.positives} positives</strong><p className="caption">{s.first} → {s.last}</p></div>)}</div>{r.reason ? <p className="notice subtle">{r.reason}</p> : <ScrollTable label={'Challenge seed ' + r.seed}><table><thead><tr><th>Candidate</th><th className="numeric">Calibrated AP</th><th className="numeric">Calibrated Brier ↓</th><th className="numeric">Recall@50</th></tr></thead><tbody>{r.items.map(i => <tr key={i.candidate}><td>{candidateNames[i.candidate]}</td><td className="numeric">{fixed(i.calibrated.average_precision)}</td><td className="numeric">{fixed(i.calibrated.brier_score)}</td><td className="numeric">{pct(i.calibrated.recall_at_50)}</td></tr>)}</tbody></table></ScrollTable>}<p className="caption replay-fingerprint">Dataset SHA-256: {r.dataset_sha256}</p></article>)}
    <details className="panel"><summary>Fixed inputs, candidate parameters and protocol</summary><p className="caption">Both learned candidates receive {data.configuration.features.join(', ')}. Preprocessing/classifiers fit on earlier training rows; separate sigmoid calibration fits on later calibration rows. Thirty-day maturity gaps separate partitions. Budget 50 applies to the entire mature evaluation cohort.</p><pre>{JSON.stringify(data.configuration.parameters, null, 2)}</pre><p className="caption">Protocol: {data.protocol}. This public explored suite is development evidence, not a final untouched test.</p></details>
  </div>;
}
