import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from './api';
import { ScrollTable } from './Lab';
import './reliability.css';

type Metrics = { average_precision: number; brier_score: number; recall_at_50: number };
type Support = { count: number; unique_records: number; positives: number; prevalence: number; mean_severity: number; remote_rate: number; categories: Record<string, number>; records_sha256: string };
type Bin = { lower: number; upper: number; count: number; predicted: number | null; observed: number | null };
type Scenario = { id: string; name: string; kind: string; definition: string; status: string; reason?: string; support: Support; calibrated?: Metrics; raw?: Metrics; delta_from_control?: Metrics; calibration_bins?: Bin[] };
type Factor = { feature: string; average_precision_drop: number; average_precision_drop_sd: number; brier_increase: number; brier_increase_sd: number; repeats: number };
type Point = { fraction: number; train_count: number; train_positives: number; train_first: string | null; train_last: string | null; status: string; reason?: string; training?: Metrics; evaluation?: Metrics };
type Fold = { fold: number; calibration: Support; evaluation: Support; calibration_first: string | null; evaluation_first: string | null; evaluation_last: string | null; points: Point[] };
export type ReliabilityReport = { status: string; snapshot_id: string; mode?: string; protocol?: string; warning: string; dataset_sha256?: string; configuration?: Record<string, unknown>; stress?: { seed: number; budget: number; warning: string; items: Scenario[] }; importance?: { status: string; warning?: string; reason?: string; seed?: number; population?: number; items: Factor[] }; learning_curves?: { warning: string; fractions: number[]; folds: Fold[] } };
const pct = (value: number) => (value * 100).toFixed(1) + '%';
const fixed = (value: number | undefined) => value === undefined ? 'Unavailable' : value.toFixed(4);
const signed = (value: number) => (value >= 0 ? '+' : '') + value.toFixed(4);
const featureNames: Record<string, string> = { description: 'Description category', severity: 'Severity', remote: 'Remote', authentication_required: 'Authentication required' };

function ImportanceChart({ items, metric }: { items: Factor[]; metric: 'average_precision_drop' | 'brier_increase' }) {
  const max = Math.max(.001, ...items.map(item => Math.abs(item[metric])));
  return <svg className="reliability-chart" viewBox="0 0 660 228" role="img" aria-label="Signed permutation importance; positive values mean worse performance after shuffling">
    <line x1="420" y1="15" x2="420" y2="185" stroke="var(--control)" />
    {items.map((item, i) => {
      const width = Math.abs(item[metric]) / max * 155;
      return <g key={item.feature}><text x="12" y={40 + i * 42}>{featureNames[item.feature]}</text><rect x={item[metric] >= 0 ? 420 : 420 - width} y={25 + i * 42} width={width} height="22" rx="2" fill={item[metric] >= 0 ? 'var(--accent)' : 'var(--muted)'}><title>{featureNames[item.feature]}: {signed(item[metric])}</title></rect></g>;
    })}
    <text x="250" y="211" textAnchor="middle">−{max.toFixed(4)}</text><text x="420" y="211" textAnchor="middle">0</text><text x="590" y="211" textAnchor="middle">+{max.toFixed(4)}</text>
  </svg>;
}

function ScenarioCalibration({ control, scenario }: { control: Scenario; scenario: Scenario }) {
  const series = [{ name: 'Control', bins: control.calibration_bins!, color: 'var(--muted)' }, { name: 'Selected scenario', bins: scenario.calibration_bins!, color: 'var(--accent)' }];
  return <article className="panel"><div className="panel-head"><div><p className="overline">CALIBRATION / FIXED SAVED CALIBRATOR</p><h2>Control versus selected scenario</h2></div><span className="caption">{scenario.name}</span></div>
    <svg className="reliability-chart" viewBox="0 0 540 300" role="img" aria-label="Control and selected scenario mean predicted probability versus observed positive rate">
      <path d="M55 25V240H510" fill="none" stroke="var(--control)" /><line x1="55" y1="240" x2="510" y2="25" stroke="var(--muted)" strokeDasharray="5 5" />
      {[0, .25, .5, .75, 1].map(value => <g key={value}><text x={55 + value * 455} y="259" textAnchor="middle">{value}</text><text x="42" y={244 - value * 215} textAnchor="end">{value}</text></g>)}
      {series.map(({ name, bins, color }) => bins.filter(bin => bin.count && bin.predicted !== null && bin.observed !== null).map(bin => <circle key={name + bin.lower} cx={55 + bin.predicted! * 455} cy={240 - bin.observed! * 215} r={Math.min(10, 3 + Math.log2(bin.count + 1) / 2)} fill={color} fillOpacity=".7"><title>{name}: {bin.count} records; predicted {pct(bin.predicted!)}; observed {pct(bin.observed!)}</title></circle>))}<text x="280" y="289" textAnchor="middle">Mean predicted probability</text>
    </svg><div className="plot-key"><span>● Unchanged control</span><span>● Selected scenario</span><span>Dashed: ideal calibration</span></div>
    <p className="caption">Vertical axis: observed positive rate. Dot size reflects bin support, not confidence. Both series use the same saved calibrator. Composition scenarios have different sampled cohorts; no recalibration is performed.</p>
    <ScrollTable label="Scenario calibration support"><table><thead><tr><th>Probability bin</th><th className="numeric">Control n</th><th className="numeric">Control predicted / observed</th><th className="numeric">Scenario n</th><th className="numeric">Scenario predicted / observed</th></tr></thead><tbody>{control.calibration_bins!.map((bin, i) => {
      const selected = scenario.calibration_bins![i];
      return <tr key={bin.lower}><td>{pct(bin.lower)}–{pct(bin.upper)}</td><td className="numeric">{bin.count}</td><td className="numeric">{bin.predicted === null ? 'No support' : pct(bin.predicted) + ' / ' + pct(bin.observed!)}</td><td className="numeric">{selected.count}</td><td className="numeric">{selected.predicted === null ? 'No support' : pct(selected.predicted) + ' / ' + pct(selected.observed!)}</td></tr>;
    })}</tbody></table></ScrollTable>
  </article>;
}

function LearningChart({ points, metric }: { points: Point[]; metric: keyof Metrics }) {
  const evaluated = points.filter(point => point.status === 'evaluated' && point.evaluation && point.training);
  if (!evaluated.length) return <p className="notice subtle">No supported learning-curve points in this fold.</p>;
  const maxCount = Math.max(1, ...points.map(point => point.train_count));
  const maxScore = Math.max(.05, ...evaluated.flatMap(point => [point.training![metric], point.evaluation![metric]])) * 1.1;
  const x = (point: Point) => 55 + point.train_count / maxCount * 510;
  const y = (score: number) => 235 - score / maxScore * 195;
  return <><svg className="reliability-chart" viewBox="0 0 620 300" role="img" aria-label="Temporal learning curve comparing in-sample training and later evaluation scores">
    {[0, .5, 1].map(fraction => <g key={fraction}><line x1="55" y1={y(maxScore * fraction)} x2="565" y2={y(maxScore * fraction)} stroke="var(--line)" /><text x="45" y={y(maxScore * fraction) + 4} textAnchor="end">{(maxScore * fraction).toFixed(3)}</text></g>)}
    {(['training', 'evaluation'] as const).map(variant => <g key={variant}><polyline points={evaluated.map(point => `${x(point)},${y(point[variant]![metric])}`).join(' ')} fill="none" stroke={variant === 'evaluation' ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" strokeDasharray={variant === 'training' ? '5 4' : undefined} />{evaluated.map(point => <circle key={point.fraction} cx={x(point)} cy={y(point[variant]![metric])} r="4" fill={variant === 'evaluation' ? 'var(--accent)' : 'var(--muted)'}><title>{variant}: {point.train_count} training records, {fixed(point[variant]![metric])}</title></circle>)}</g>)}
    {points.map(point => <text key={point.fraction} x={x(point)} y="260" textAnchor="middle">{point.train_count}</text>)}<text x="310" y="287" textAnchor="middle">Historical training records</text>
  </svg><div className="plot-key"><span>Dashed: retrospective training</span><span>Solid: later evaluation</span></div></>;
}

function Walkthrough() {
  return <article className="panel reliability-walkthrough"><div className="panel-head"><div><p className="overline">REPRODUCE / NO EXTERNAL DATA</p><h2>Run it. Trace it. Explain it.</h2></div><a className="button" href="/api/export/report" download="signalrank-experiment.md">Download research report</a></div>
    <p className="caption">From an installed project environment, one command trains a new fictional run, saves the model and report, and starts this loopback-only workbench. Each run has its own artifact directory; existing runs are preserved.</p>
    <pre><code>python -m signalrank.demo{ '\n' }# Export without starting a server:{ '\n' }python -m signalrank.demo --no-serve</code></pre>
    <ol className="reliability-pipeline"><li><span>01</span><strong>Generate</strong><p>Seeded original fictional records. No downloads, uploaded datasets or pretrained weights.</p></li><li><span>02</span><strong>Fit & calibrate</strong><p>Past-only TF-IDF and structured model; a later partition fits sigmoid calibration.</p></li><li><span>03</span><strong>Evaluate & probe</strong><p>Mature later labels. Fixed stress cases, raw-input shuffles and temporal learning curves.</p></li><li><span>04</span><strong>Save & inspect</strong><p>Model artifact, configuration, hashes and report. API reads offline results; the browser cannot train.</p></li></ol>
    <p className="caption">A fresh clone first needs Python 3.11+ and <code>python -m pip install -e '.[test]'</code> in a virtual environment. Compiled React assets are included; Node is needed only to change the UI. Setup can download software dependencies; the demo itself makes no data-source requests. Stop the server with Ctrl+C.</p>
  </article>;
}

export function Reliability() {
  const [active, setActive] = useState(() => location.hash.slice(1).split('/')[0].split('?')[0] === 'reliability');
  useEffect(() => { const update = () => setActive(location.hash.slice(1).split('/')[0].split('?')[0] === 'reliability'); window.addEventListener('hashchange', update); window.addEventListener('signalrank:view', update); return () => { window.removeEventListener('hashchange', update); window.removeEventListener('signalrank:view', update); }; }, []);
  const query = useQuery({ queryKey: ['reliability'], queryFn: ({ signal }) => get<ReliabilityReport>('/api/reliability', signal), enabled: active });
  const [scenarioId, setScenarioId] = useState('control');
  const [factorMetric, setFactorMetric] = useState<'average_precision_drop' | 'brier_increase'>('average_precision_drop');
  const [foldNumber, setFoldNumber] = useState(1);
  const [curveMetric, setCurveMetric] = useState<keyof Metrics>('average_precision');
  if (query.error) return <div className="experiment-error" role="alert"><div><strong>Unable to load reliability evidence</strong><p>{query.error.message}</p></div><button className="button" onClick={() => void query.refetch()}>Try again</button></div>;
  if (!query.data) return <p className="experiment-empty" role="status">Loading offline reliability evidence…</p>;
  const data = query.data;
  if (data.status === 'unavailable' || !data.stress || !data.importance || !data.learning_curves) return <div className="lab-workspace"><p className="notice subtle">{data.warning}</p><Walkthrough /></div>;
  const scenario = data.stress.items.find(item => item.id === scenarioId) ?? data.stress.items[0];
  const control = data.stress.items.find(item => item.id === 'control');
  const fold = data.learning_curves.folds.find(item => item.fold === foldNumber) ?? data.learning_curves.folds[0];
  return <div className="lab-workspace reliability-workspace">
    <div className="lab-intro"><span className="badge warning">SYNTHETIC / DEVELOPMENT</span><p>How does the model behave when the conditions change?</p><a href={'#experiments/' + data.snapshot_id}>Snapshot provenance →</a></div>
    <div className="reliability-summary"><div><span className="overline">FIXED STRESS CASES</span><strong>{data.stress.items.length}</strong><p>One seed. No adaptive tuning.</p></div><div><span className="overline">RAW INPUT GROUPS</span><strong>{data.importance.items.length}</strong><p>20 shuffles per input.</p></div><div><span className="overline">PAST-ONLY WINDOWS</span><strong>{data.learning_curves.folds.length}</strong><p>Four training sizes per fold.</p></div></div>
    <article className="panel"><div className="panel-head"><div><p className="overline">01 / STRESS TESTS</p><h2>Controlled changes. Visible consequences.</h2></div><label>Inspect scenario<select value={scenario?.id ?? ''} onChange={event => setScenarioId(event.target.value)}>{data.stress.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      <ScrollTable label="Robustness scenario metrics"><table><thead><tr><th>Scenario / type</th><th className="numeric">n / unique / positives</th><th className="numeric">Calibrated AP ↑</th><th className="numeric">Calibrated Brier ↓</th><th className="numeric">Recall@50 ↑</th><th className="numeric">AP change</th></tr></thead><tbody>{data.stress.items.map(item => <tr key={item.id} className={item.id === scenario?.id ? 'reliability-selected' : ''}><td><button className="row-link" onClick={() => setScenarioId(item.id)} aria-label={'Inspect ' + item.name}>{item.name}</button><span className="caption">{item.kind}</span></td><td className="numeric">{item.support.count} / {item.support.unique_records} / {item.support.positives}</td><td className="numeric">{fixed(item.calibrated?.average_precision)}</td><td className="numeric">{fixed(item.calibrated?.brier_score)}</td><td className="numeric">{item.calibrated ? pct(item.calibrated.recall_at_50) : 'Unavailable'}</td><td className="numeric">{item.delta_from_control ? signed(item.delta_from_control.average_precision) : 'Unavailable'}</td></tr>)}</tbody></table></ScrollTable>
      {scenario && <div className="reliability-detail"><div><span className="overline">{scenario.kind.toUpperCase()} / SEED {data.stress.seed}</span><h3>{scenario.name}</h3><p>{scenario.definition}</p>{scenario.reason && <p role="status">{scenario.reason}</p>}<p className="caption">Mean severity {scenario.support.mean_severity.toFixed(2)} · remote measurements {pct(scenario.support.remote_rate)} · positive prevalence {pct(scenario.support.prevalence)}. Outcomes are retained, never regenerated.</p><p className="caption">Raw AP {fixed(scenario.raw?.average_precision)} · raw Brier {fixed(scenario.raw?.brier_score)}.</p></div><div><span className="overline">COMPOSITION / RECORD COUNTS</span>{Object.entries(scenario.support.categories).map(([name, count]) => <div className="composition-row" key={name}><span>{name}</span><strong>{count}</strong></div>)}</div></div>}
      <p className="caption">{data.stress.warning}</p>
    </article>
    {scenario?.calibration_bins && control?.calibration_bins && <ScenarioCalibration control={control} scenario={scenario} />}
    <article className="panel"><div className="panel-head"><div><p className="overline">02 / MODEL DEPENDENCE</p><h2>Which inputs does the model rely on?</h2></div><label>Importance measure<select value={factorMetric} onChange={event => setFactorMetric(event.target.value as typeof factorMetric)}><option value="average_precision_drop">Average precision drop</option><option value="brier_increase">Brier score increase</option></select></label></div>
      {data.importance.status === 'unavailable' ? <p className="notice subtle">{data.importance.reason}</p> : <><ImportanceChart items={data.importance.items} metric={factorMetric} /><ScrollTable label="Global permutation importance"><table><thead><tr><th>Raw input group</th><th className="numeric">Mean AP drop</th><th className="numeric">Shuffle SD</th><th className="numeric">Mean Brier increase</th><th className="numeric">Shuffle SD</th><th className="numeric">Repeats</th></tr></thead><tbody>{data.importance.items.map(item => <tr key={item.feature}><td>{featureNames[item.feature]}</td><td className="numeric">{signed(item.average_precision_drop)}</td><td className="numeric">{fixed(item.average_precision_drop_sd)}</td><td className="numeric">{signed(item.brier_increase)}</td><td className="numeric">{fixed(item.brier_increase_sd)}</td><td className="numeric">{item.repeats}</td></tr>)}</tbody></table></ScrollTable></>}
      <p className="caption">{data.importance.warning}</p>
    </article>
    <article className="panel"><div className="panel-head"><div><p className="overline">03 / DATA VOLUME & TIME</p><h2>Does more history help?</h2></div><div className="reliability-controls"><label>Temporal fold<select value={fold?.fold ?? 1} onChange={event => setFoldNumber(Number(event.target.value))}>{data.learning_curves.folds.map(item => <option key={item.fold} value={item.fold}>Fold {item.fold}</option>)}</select></label><label>Curve metric<select value={curveMetric} onChange={event => setCurveMetric(event.target.value as keyof Metrics)}><option value="average_precision">Average precision ↑</option><option value="brier_score">Brier score ↓</option><option value="recall_at_50">Recall at 50 ↑</option></select></label></div></div>
      {fold && <><p className="caption">Fixed later calibration: {fold.calibration.count} records, {fold.calibration.positives} positives. Mature evaluation: {fold.evaluation_first} to {fold.evaluation_last}, {fold.evaluation.count} records, {fold.evaluation.positives} positives.</p><LearningChart points={fold.points} metric={curveMetric} /><ScrollTable label="Temporal learning curve evidence"><table><thead><tr><th>Training days / support</th><th>Training period</th><th className="numeric">In-sample score</th><th className="numeric">Later evaluation score</th><th>Evidence status</th></tr></thead><tbody>{fold.points.map(point => <tr key={point.fraction}><td>{pct(point.fraction)}<span className="caption">{point.train_count} records · {point.train_positives} positives</span></td><td>{point.train_first}<span className="caption">to {point.train_last}</span></td><td className="numeric">{fixed(point.training?.[curveMetric])}</td><td className="numeric">{fixed(point.evaluation?.[curveMetric])}</td><td>{point.status}{point.reason && <span className="caption">{point.reason}</span>}</td></tr>)}</tbody></table></ScrollTable></>}
      <p className="caption">{data.learning_curves.warning}</p>
    </article>
    <Walkthrough /><details className="panel provenance-details"><summary>Protocol, configuration and full evidence</summary><p>Protocol: <code>{data.protocol}</code></p><p className="caption">Dataset SHA-256: {data.dataset_sha256}</p><pre>{JSON.stringify(data.configuration, null, 2)}</pre><a href="/api/reliability" download="signalrank-reliability.json">Download complete reliability JSON →</a></details><p className="caption">{data.warning}</p>
  </div>;
}
