const el = id => document.getElementById(id);
const pct = x => (x * 100).toFixed(1) + '%';
const state = { validation: [], forecasts: [], page: 0 };
function node(tag, text, className) { const n = document.createElement(tag); n.textContent = text; if (className) n.className = className; return n; }
async function get(path) { const r = await fetch(path); if (!r.ok) throw new Error(path + ': HTTP ' + r.status); return r.json(); }
function failure(e) { el('status').hidden = false; el('status').textContent = 'Some workspace data could not load. ' + e.message; }
function metric(label, value, note = '') { const n = node('div', '', 'metric'); n.append(node('span', label, 'metric-label'), node('strong', String(value), 'metric-value'), node('span', note, 'metric-note')); return n; }
function showView(name) { if (!['overview', 'build', 'data', 'models', 'forecasts'].includes(name)) name = 'overview'; document.querySelectorAll('.view').forEach(v => { v.hidden = v.id !== name; }); document.querySelectorAll('nav button').forEach(b => { if (b.dataset.view === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); history.replaceState(null, '', '#' + name); }
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  showView(b.dataset.view);
  const heading = el(b.dataset.view).querySelector('h1');
  heading.tabIndex = -1;
  heading.focus();
}));
showView(location.hash.slice(1));
window.addEventListener('hashchange', () => { if (location.hash !== '#main-content') showView(location.hash.slice(1)); });
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); el('main-content').focus(); });
document.querySelectorAll('.table-wrap').forEach(wrap => {
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', (wrap.closest('.panel').querySelector('h2')?.textContent || 'Records') + ' table, scroll horizontally if needed');
});

function auditRows() { const q = el('audit-search').value.trim().toLowerCase(), status = el('audit-filter').value; const rows = state.validation.filter(r => r.id.toLowerCase().includes(q) && (!status || r.label_status === status)); el('audit-rows').replaceChildren(); for (const r of rows) { const tr = node('tr', ''); tr.append(node('td', r.id), node('td', r.timestamp_checks_passed ? 'Passed' : 'Unavailable / failed'), node('td', r.label_status), node('td', r.issues.join('; ') || 'No timestamp inconsistency found')); el('audit-rows').append(tr); } if (!rows.length) { const tr = node('tr', ''); const td = node('td', 'No records match these filters.', 'empty'); td.colSpan = 4; tr.append(td); el('audit-rows').append(tr); } el('audit-count').textContent = rows.length + ' of ' + state.validation.length + ' records'; }
for (const id of ['audit-search', 'audit-filter']) el(id).addEventListener(id === 'audit-search' ? 'input' : 'change', auditRows);

function forecastRows() { const q = el('forecast-search').value.trim().toLowerCase(); const rows = state.forecasts.filter(r => (r.id + ' ' + r.description).toLowerCase().includes(q)).sort((a, b) => el('forecast-sort').value === 'asc' ? a.probability - b.probability : b.probability - a.probability); const pages = Math.max(1, Math.ceil(rows.length / 15)); state.page = Math.min(state.page, pages - 1); el('forecast-rows').replaceChildren(); for (const r of rows.slice(state.page * 15, (state.page + 1) * 15)) { const tr = node('tr', ''); tr.append(node('td', r.id), node('td', r.description), node('td', pct(r.probability), 'numeric')); const td = node('td', ''), details = node('details', ''); details.append(node('summary', 'Inspect factors')); for (const c of r.contributions) details.append(node('p', c.feature + ': ' + (c.value > 0 ? '+' : '') + c.value.toFixed(3))); td.append(details); tr.append(td); el('forecast-rows').append(tr); } if (!rows.length) { const tr = node('tr', ''), td = node('td', 'No records match your search.', 'empty'); td.colSpan = 4; tr.append(td); el('forecast-rows').append(tr); } el('forecast-count').textContent = rows.length + ' matching records'; el('page-number').textContent = 'Page ' + (state.page + 1) + ' of ' + pages; el('previous').disabled = state.page === 0; el('next').disabled = state.page >= pages - 1; }
for (const id of ['forecast-search', 'forecast-sort']) el(id).addEventListener(id === 'forecast-search' ? 'input' : 'change', () => { state.page = 0; forecastRows(); });
el('previous').addEventListener('click', () => { state.page--; forecastRows(); }); el('next').addEventListener('click', () => { state.page++; forecastRows(); });
let budgetRequest = 0;
async function budget() { const request = ++budgetRequest; const r = await get('/api/simulate?budget=' + el('budget').value); if (request !== budgetRequest) return; el('simulation').replaceChildren(...r.strategies.map(s => metric(s.name, s.captured + ' / ' + r.total_positives, pct(s.recall) + ' recall · ' + s.false_positives + ' false positives')), metric('Random selection', r.random_expected_captured.toFixed(1), 'Expected positives, not an observed run')); }
el('budget').addEventListener('input', () => { el('budget-count').textContent = el('budget').value; }); el('budget').addEventListener('change', () => budget().catch(failure));

async function models() { const r = await get('/api/report'); el('overview-metrics').append(metric('Average precision', r.model.average_precision.toFixed(3), 'Synthetic test set'), metric('Recall at 50', pct(r.model.recall_at_50), 'Synthetic test set'), metric('Brier score', r.model.brier_score.toFixed(3), 'Lower is better')); for (const [name, s] of Object.entries(r.splits)) { const div = node('div', ''); div.append(node('strong', name.toUpperCase() + ' · ' + s.count), node('p', s.first + ' → ' + s.last)); el('splits').append(div); } el('split-note').textContent = r.excluded_unmatured_or_embargoed + ' records excluded by time-window rules. Severity-only average precision: ' + r.severity_baseline.average_precision.toFixed(3); for (const m of r.comparisons) { const tr = node('tr', ''); tr.append(node('td', m.name), node('td', m.average_precision.toFixed(3), 'numeric'), node('td', m.brier_score.toFixed(3), 'numeric'), node('td', pct(m.recall_at_50), 'numeric')); el('comparisons').append(tr); } for (const b of r.calibration_bins) { const tr = node('tr', ''); tr.append(node('td', pct(b.lower) + '–' + pct(b.upper)), node('td', b.count, 'numeric'), node('td', b.predicted === null ? '—' : pct(b.predicted), 'numeric'), node('td', b.observed === null ? '—' : pct(b.observed), 'numeric')); el('calibration').append(tr); } el('evaluation-note').textContent = r.evaluation_note; el('dataset-hash').textContent = 'Dataset SHA-256 · ' + r.dataset_sha256.slice(0, 16); el('dataset-hash').title = r.dataset_sha256; await budget(); }
async function evidence() { const [a, v, c, sources] = await Promise.all([get('/api/feasibility'), get('/api/validation'), get('/api/cohort'), get('/api/sources')]); state.validation = v.rows; auditRows(); el('pilot-summary').textContent = v.timestamp_checks_passed + ' of ' + v.checked + ' records pass timestamp checks. The sample is selection-biased.'; el('pilot-count').textContent = v.checked + ' observations'; el('cohort-summary').textContent = c.sample_count.toLocaleString() + ' identifiers selected from ' + c.frame_count.toLocaleString() + ' pinned record paths. Historical reconstruction pending.'; el('frame-status').textContent = c.frame_complete ? 'Inventory complete' : 'Pending'; el('frame-metrics').append(metric('Identifier-year frame', c.frame_count.toLocaleString(), 'CVE-2024 record paths'), metric('Selected for reconstruction', c.sample_count.toLocaleString(), 'No outcome-based selection'), metric('Real-data training', 'Not enabled', 'Historical checks pending')); updateBuildOverview(); el('frame-scope').textContent = c.scope; el('frame-revision').textContent = c.revision ? 'Pinned revision: ' + c.revision + ' · Seed: ' + c.seed : 'No pinned revision'; el('frame-revision').style.overflowWrap = 'anywhere'; el('frame-next').textContent = c.next_gate ?? 'Acquire an identifier frame before sampling.'; el('selected-ids').textContent = c.selected_ids.join('\n'); const years = Object.entries(a.additions_by_year ?? {}), max = Math.max(1, ...years.map(x => x[1])); for (const [year, count] of years) { const row = node('div', '', 'year'), bar = node('div', '', 'bar'), fill = node('span', ''); fill.style.width = count / max * 100 + '%'; bar.append(fill); row.append(node('span', year), bar, node('span', count)); el('years').append(row); } for (const [name, source] of Object.entries(sources)) { const row = node('div', '', 'source-row'); row.append(node('strong', name), node('span', source.status, 'badge'), node('p', source.scope ?? source.purpose ?? source.reason ?? '')); el('sources').append(row); } }
models().catch(failure); evidence().catch(failure); get('/api/forecasts?limit=100').then(r => { state.forecasts = r.items; forecastRows(); }).catch(failure);
// The build is run explicitly from the CLI, never from a browser request.
let buildOffset = 0, buildRequest = 0, detailRequest = 0;
let evidenceTrigger = null;
async function buildRows() {
  const request = ++buildRequest;
  const query = new URLSearchParams({search: el('build-search').value.trim(), state: el('build-filter').value, offset: String(buildOffset), limit: '25'});
  const result = await get('/api/dataset/records?' + query);
  if (request !== buildRequest) return;
  el('build-rows').replaceChildren();
  for (const record of result.items) {
    const row = node('tr', '');
    const td = node('td', ''), button = node('button', 'View evidence', 'button');
    button.setAttribute('aria-label', 'View evidence for ' + record.id);
    button.addEventListener('click', () => { evidenceTrigger = button; openEvidence(record.id).catch(failure); });
    td.append(button); row.append(node('td', record.id), node('td', record.state), node('td', record.label_status), td);
    el('build-rows').append(row);
  }
  if (!result.items.length) { const row = node('tr', ''), cell = node('td', 'No reconstructed records match these filters.', 'empty'); cell.colSpan = 4; row.append(cell); el('build-rows').append(row); }
  el('build-count').textContent = result.total + ' matching records';
  el('build-page').textContent = 'Page ' + (Math.floor(buildOffset / 25) + 1) + ' of ' + Math.max(1, Math.ceil(result.total / 25));
  el('build-previous').disabled = buildOffset === 0;
  el('build-next').disabled = buildOffset + 25 >= result.total;
}
async function refreshBuild() {
  const r = await get('/api/dataset');
  state.buildReport = r;
  updateBuildOverview();
  el('build-metrics').replaceChildren(metric('Processed selection', r.processed + ' / ' + r.selected, r.pending + ' records pending'), metric('Candidates', r.states.candidate ?? 0, 'Passed current checks; not training-ready'), metric('Excluded / retryable', (r.states.excluded ?? 0) + ' / ' + (r.states['retryable error'] ?? 0), 'No silent replacements'));
  el('build-updated').textContent = r.generated_at ? 'Last checkpoint: ' + new Date(r.generated_at).toLocaleString() + ' · Policy: ' + r.policy : 'No build started';
  el('build-labels').replaceChildren();
  for (const [label, count] of Object.entries(r.candidate_labels)) { const part = node('div', ''); part.append(node('strong', String(count)), node('p', label + ' candidates')); el('build-labels').append(part); }
  el('build-blockers').replaceChildren(...r.blockers.map(b => node('li', b)));
  await buildRows();
}
async function openEvidence(identifier) {
  const request = ++detailRequest, r = await get('/api/dataset/records/' + encodeURIComponent(identifier));
  if (request !== detailRequest) return;
  el('record-title').textContent = r.id + ' · Evidence';
  el('record-facts').replaceChildren();
  for (const [label, value] of [['Build status', r.state], ['Record state', r.record_state], ['Publication timestamp', r.published_at], ['Forecast cutoff', r.forecast_at], ['Outcome maturity', r.maturity_at], ['Historical commit', r.historical_revision], ['Commit timestamp', r.commit_at], ['Timestamp checks', r.timestamp_checks_passed ? 'Passed' : 'Not passed / unavailable'], ['Provisional label', r.label_status], ['Catalog date added', Object.hasOwn(r, 'catalog_date_added') ? (r.catalog_date_added ?? 'Not observed in pinned current catalog') : 'Not assessed for this excluded record'], ['English text characters', r.features?.english_text_characters], ['Historical metrics present', r.features ? (r.features.has_metrics ? 'Yes' : 'No') : undefined]]) {
    el('record-facts').append(node('dt', label), node('dd', value === undefined ? 'Unavailable' : String(value)));
  }
  el('record-issues').replaceChildren(...(r.issues.length ? r.issues : ['No inconsistency detected by implemented checks. Remaining dataset-level gates still apply.']).map(x => node('li', x)));
  el('record-sources').replaceChildren();
  for (const [index, source] of r.evidence.entries()) {
    const div = node('div', '', 'source-evidence');
    const a = node('a', 'Source ' + (index + 1) + ' ↗');
    if (source.url.startsWith('https://api.github.com/repos/CVEProject/cvelistV5/') || source.url.startsWith('https://raw.githubusercontent.com/CVEProject/cvelistV5/')) { a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    div.append(a, node('p', source.url, 'caption'), node('p', 'SHA-256: ' + source.sha256, 'caption'), node('p', 'Retrieved: ' + source.retrieved_at, 'caption'));
    el('record-sources').append(div);
  }
  el('record-evidence').hidden = false; el('record-title').focus();
}
el('refresh-build').addEventListener('click', () => refreshBuild().catch(failure));
function filterBuild() { buildOffset = 0; buildRows().catch(failure); }
el('apply-build-filter').addEventListener('click', filterBuild);
el('build-search').addEventListener('keydown', e => { if (e.key === 'Enter') filterBuild(); });
el('build-previous').addEventListener('click', () => { buildOffset = Math.max(0, buildOffset - 25); buildRows().catch(failure); });
el('build-next').addEventListener('click', () => { buildOffset += 25; buildRows().catch(failure); });
el('close-evidence').addEventListener('click', () => { ++detailRequest; el('record-evidence').hidden = true; if (evidenceTrigger?.isConnected) evidenceTrigger.focus(); else el('apply-build-filter').focus(); });
refreshBuild().catch(failure);

function updateBuildOverview() {
  const r = state.buildReport;
  if (!r) return;
  el('cohort-summary').textContent = r.selected + ' identifiers selected without consulting outcomes. ' + r.processed + ' processed.';
  const note = document.querySelector('.checklist li:last-child p');
  note.textContent = (r.states.candidate ?? 0) + ' candidates; ' + (r.candidate_labels.positive ?? 0) + ' positive candidate outcomes. Training remains disabled. Review Dataset build for evidence.';
}
