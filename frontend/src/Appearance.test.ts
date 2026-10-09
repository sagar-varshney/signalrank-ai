import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Exercise the actual shipped scripts and HTML, not a duplicate theme implementation.
const read = (name: string) => readFileSync(new URL('../../signalrank/static/' + name, import.meta.url), 'utf8');
const html = read('index.html'), theme = read('theme.js'), application = read('app.js'), css = read('editorial.css');
const opened: JSDOM[] = [];
async function setup({ preference, dark = false, mobile = false, denied = false, hash = '' }: { preference?: string; dark?: boolean; mobile?: boolean; denied?: boolean; hash?: string } = {}) {
  const dom = new JSDOM(html, { url: 'http://127.0.0.1/' + hash, runScripts: 'outside-only' });
  opened.push(dom);
  const window = dom.window;
  function media(matches: boolean) {
    const listeners: (() => void)[] = [];
    return { matches, addEventListener: (_: string, callback: () => void) => listeners.push(callback), change(value: boolean) { this.matches = value; listeners.forEach(callback => callback()); } };
  }
  const scheme = media(dark), narrow = media(mobile);
  window.matchMedia = ((query: string) => query.includes('prefers-color-scheme') ? scheme : narrow) as unknown as typeof window.matchMedia;
  if (preference) window.localStorage.setItem('signalrank-theme', preference);
  if (denied) Object.defineProperty(window, 'localStorage', { value: { getItem() { throw new Error('Storage denied'); }, setItem() { throw new Error('Storage denied'); } } });
  const fixtures: Record<string, unknown> = {
    '/api/report': { model: { average_precision: .3, recall_at_50: .4, brier_score: .06 }, splits: {}, excluded_unmatured_or_embargoed: 0, severity_baseline: { average_precision: .2 }, comparisons: [], calibration_bins: [], evaluation_note: 'Synthetic only.', dataset_sha256: 'd'.repeat(64) },
    '/api/feasibility': { additions_by_year: {} }, '/api/validation': { rows: [], timestamp_checks_passed: 0, checked: 0 },
    '/api/cohort': { frame_count: 0, sample_count: 0, selected_ids: [] }, '/api/sources': {},
    '/api/dataset': { selected: 0, processed: 0, pending: 0, states: {}, candidate_labels: {}, blockers: [] },
    '/api/dataset/records': { total: 0, items: [] }, '/api/experiments': { current_id: 'a'.repeat(64), items: [] },
    '/api/health': { status: 'ok' }, '/api/temporal': { folds: [], warning: 'No offline run.' },
    '/api/simulate': { strategies: [], total_positives: 0, random_expected_captured: 0 }, '/api/forecasts': { items: [] },
  };
  const fetch = vi.fn(async (path: string) => ({ ok: true, json: async () => fixtures[path.split('?')[0]] }));
  window.fetch = fetch as unknown as typeof window.fetch;
  window.eval(theme);
  window.eval(application);
  if (window.document.readyState === 'loading') await new Promise<void>(resolve => window.document.addEventListener('DOMContentLoaded', () => resolve(), { once: true }));
  await Promise.resolve(); await Promise.resolve();
  const control = window.document.getElementById('theme-choice') as HTMLSelectElement;
  return { window, control, scheme, narrow, fetch, choose(value: string) { control.value = value; control.dispatchEvent(new window.Event('change')); } };
}
afterEach(() => { opened.splice(0).forEach(dom => dom.window.close()); vi.restoreAllMocks(); });

describe('shipped appearance and navigation', () => {
  it('lands on Overview with the overview navigation first, retaining explicit walkthrough links', async () => {
    const root = await setup();
    expect(root.window.location.hash).toBe('#overview');
    expect(root.window.document.getElementById('overview')!.hidden).toBe(false);
    expect(root.window.document.getElementById('showcase')!.hidden).toBe(true);
    expect(root.window.document.querySelector('#workspace-navigation [data-view]')!.getAttribute('data-view')).toBe('overview');
    const walkthrough = await setup({ hash: '#showcase' });
    expect(walkthrough.window.location.hash).toBe('#showcase');
    expect(walkthrough.window.document.getElementById('showcase')!.hidden).toBe(false);
  });
  it('preserves Light, Dark and System and follows system changes without reload', async () => {
    const { window, control, scheme } = await setup();
    expect(Array.from(control.options, option => option.value)).toEqual(['system', 'light', 'dark']);
    expect(control.value).toBe('system'); expect(window.document.documentElement.dataset.theme).toBe('light');
    scheme.change(true); expect(window.document.documentElement.dataset.theme).toBe('dark');
    scheme.change(false); expect(window.document.documentElement.dataset.theme).toBe('light');
  });
  it('honors explicit choices, persists them and restores them on another page load', async () => {
    const first = await setup({ preference: 'light', dark: true });
    expect(first.window.document.documentElement.dataset.theme).toBe('light');
    first.choose('dark'); first.scheme.change(false);
    expect(first.window.document.documentElement.dataset.theme).toBe('dark');
    const saved = first.window.localStorage.getItem('signalrank-theme')!;
    const second = await setup({ preference: saved, dark: false });
    expect(second.control.value).toBe('dark'); expect(second.window.document.documentElement.dataset.theme).toBe('dark');
    second.choose('system'); expect(second.window.document.documentElement.dataset.theme).toBe('light');
    expect(second.window.localStorage.getItem('signalrank-theme')).toBe('system');
  });
  it('falls back safely for invalid preferences and unavailable browser storage', async () => {
    const invalid = await setup({ preference: 'invalid-value', dark: true });
    expect(invalid.control.value).toBe('system'); expect(invalid.window.document.documentElement.dataset.theme).toBe('dark');
    const blocked = await setup({ denied: true });
    expect(blocked.control.value).toBe('system');
    expect(() => blocked.choose('dark')).not.toThrow();
    expect(blocked.window.document.documentElement.dataset.theme).toBe('dark');
  });
  it('collapses mobile navigation, keeps every route and moves focus to the selected view', async () => {
    const { window, narrow } = await setup();
    const nav = window.document.getElementById('workspace-navigation')!;
    const toggle = window.document.getElementById('toggle-navigation')!;
    expect(nav.hidden).toBe(false);
    narrow.change(true); expect(nav.hidden).toBe(true); expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click(); expect(nav.hidden).toBe(false); expect(toggle.getAttribute('aria-expanded')).toBe('true');
    (nav.querySelector('[data-view="diagnostics"]') as HTMLButtonElement).click();
    expect(window.document.getElementById('diagnostics')!.hidden).toBe(false);
    expect(window.document.activeElement).toBe(window.document.querySelector('#diagnostics h1'));
    expect(nav.hidden).toBe(true);
    narrow.change(false); expect(nav.hidden).toBe(false);
    const routes = Array.from(nav.querySelectorAll<HTMLButtonElement>('[data-view]'), button => button.dataset.view);
    expect(new Set(routes).size).toBe(15);
    routes.forEach(route => expect(window.document.getElementById(route!)).not.toBeNull());
  });
  it('opens the intended tools from the overview without triggering inference or training', async () => {
    const { window, fetch } = await setup({ mobile: true });
    (window.document.querySelector('.hero-actions [data-view="experiments"]') as HTMLButtonElement).click();
    expect(window.location.hash).toBe('#experiments');
    (window.document.querySelector('.hero-actions [data-view="inference"]') as HTMLButtonElement).click();
    expect(window.location.hash).toBe('#inference');
    expect(fetch.mock.calls.every(([path]) => !path.startsWith('/api/batches'))).toBe(true);
    expect(window.document.querySelector('.workflow-map desc')!.textContent).toContain('not live execution activity');
  });
});

describe('editorial theme legibility', () => {
  it('keeps interface corners square while preserving circular status and chart markers', () => {
    const sheets = ['app.css', 'workspace.css', 'editorial.css'].map(read);
    for (const name of ['experiments', 'lab', 'reliability', 'replay', 'workbench']) sheets.push(readFileSync(new URL('./' + name + '.css', import.meta.url), 'utf8'));
    const radii = sheets.flatMap(sheet => Array.from(sheet.matchAll(/border-radius\s*:\s*([^;}]+)/g), match => match[1].trim()));
    expect(radii.length).toBeGreaterThan(20);
    expect(radii.every(value => value === '0' || value === '50%')).toBe(true);
    const dom = new JSDOM(html); opened.push(dom);
    dom.window.document.querySelectorAll('.workflow-node rect').forEach(rect => expect(rect.getAttribute('rx')).toBe('0'));
  });
  function luminance(hex: string) {
    const rgb = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  }
  it('keeps primary text and actions above 4.5:1 in both declared palettes', () => {
    const palettes = [css.match(/:root\s*\{([^}]+)\}/)![1], css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)![1]];
    palettes.forEach(palette => {
      const colors = Object.fromEntries(Array.from(palette.matchAll(/--([\w-]+):\s*(#[\da-f]{6})\b/g), match => [match[1], match[2]]));
      for (const [foreground, background] of [['ink', 'canvas'], ['ink', 'surface'], ['ink', 'raised'], ['muted', 'canvas'], ['muted', 'surface'], ['muted', 'sidebar'], ['muted', 'raised'], ['accent', 'surface'], ['accent', 'selected'], ['hero-accent', 'canvas'], ['ink', 'hero-glow'], ['muted', 'hero-glow'], ['ink', 'hero-glow-secondary'], ['muted', 'hero-glow-secondary'], ['warn-text', 'warn-bg'], ['primary-ink', 'primary-bg']]) {
        const values = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => a - b);
        expect((values[1] + .05) / (values[0] + .05), foreground + ' on ' + background).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
  it('uses a technical local wordmark and a two-color glow without external fonts', () => {
    const wordmark = css.match(/\.wordmark\s*\{([^}]+)\}/)![1];
    expect(wordmark).toContain('font-family:ui-monospace');
    expect(wordmark).not.toMatch(/Georgia|Times New Roman/);
    expect(css).toContain('var(--hero-glow-secondary)');
    expect(css).toContain('var(--hero-glow)');
    expect(css).not.toMatch(/@import|@font-face/);
    expect(html).not.toContain('fonts.googleapis');
  });
  it('disables illustration motion for reduced-motion preferences', () => {
    expect(css).toMatch(/@media\(prefers-reduced-motion:reduce\).*?animation:none/s);
    expect(css).toContain('nav button[aria-current=page]{border:2px solid Highlight}');
  });
});
