import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Comparison, Experiments } from './Experiments';
import { incompatibilities } from './comparison';
import type { Snapshot } from './types';

const a: Snapshot = {
  id: 'a'.repeat(64), created_at: '2026-10-06T10:00:00Z', forecasts: [],
  report: { mode: 'synthetic', target: 'Simulated catalog inclusion', dataset_sha256: 'd'.repeat(64), seed:42, horizon_days:30,
    splits: { train: {count:2000,first:'2022-01-01',last:'2023-01-01'}, calibration:{count:600,first:'2023-03-01',last:'2023-07-01'},test:{count:600,first:'2023-09-01',last:'2024-01-01'} },
    model:{ average_precision:.3,brier_score:.06,recall_at_50:.4 }, warning:'Synthetic development benchmark.', test_prevalence:.07, configuration:{seed:42,count:3600,regularization_c:1,source:'synthetic'} },
  provenance:{core_sha256:'c'.repeat(64),python:'3.13',numpy:'2.5',scikit_learn:'1.9',model:'Combined calibrated model',forecast_scope:'Top 100 synthetic test records'}
};
const b: Snapshot = structuredClone(a); b.id = 'b'.repeat(64); b.report.model.average_precision=.32; b.report.configuration!.regularization_c=.5;
const summaries = [a,b].map(x => ({id:x.id,created_at:x.created_at,mode:x.report.mode,dataset_sha256:x.report.dataset_sha256,core_sha256:x.provenance.core_sha256,model:x.report.model,seed:42,configuration:x.report.configuration,temporal_windows:0}));
function response(value: unknown, status=200) { return {ok:status===200,status,json:async()=>value} as Response; }
function route(hash: string) { act(() => { location.hash=hash; window.dispatchEvent(new Event('hashchange')); }); }
function mount() { const client=new QueryClient({defaultOptions:{queries:{retry:false, gcTime:0}}}); render(<QueryClientProvider client={client}><Experiments /></QueryClientProvider>); return client; }
beforeEach(() => {
  location.hash='#experiments';
  vi.stubGlobal('fetch',vi.fn(async (url: string) => {
    if(url.startsWith('/api/comparison?'))return response({status:'unavailable',reason:'Older snapshot lacks complete evaluation records.',metrics:[]});
    if (url.startsWith('/api/experiments?')) { const search=new URLSearchParams(url.split('?')[1]).get('search'); return response({current_id:a.id,total:search?0:2,items:search?[]:summaries}); }
    return response(url.endsWith(a.id)?a:b);
  }));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();vi.useRealTimers();});

describe('experiment comparison integrity',()=>{
  it.each([false,true])('exports comparison evidence with incompatible=%s', incompatible=>{
    vi.useFakeTimers();
    const right=structuredClone(b);
    if(incompatible) right.report.dataset_sha256='different';
    let exported='';
    vi.stubGlobal('Blob',class { constructor(parts:string[]) { exported=parts.join(''); } });
    vi.stubGlobal('URL', {createObjectURL:vi.fn(()=> 'blob:test'),revokeObjectURL:vi.fn()});
    const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
    render(<Comparison left={a} right={right}/>);
    fireEvent.click(screen.getByRole('button',{name:'Export comparison'}));
    const payload=JSON.parse(exported);
    expect(payload.snapshot_a).toBe(a.id);
    expect(payload.snapshot_b).toBe(b.id);
    expect(payload.comparable).toBe(!incompatible);
    if(incompatible) expect(payload.metrics.every((metric:{delta_b_minus_a:number|null})=>metric.delta_b_minus_a===null)).toBe(true);
    else expect(payload.metrics[0].delta_b_minus_a).toBeCloseTo(.02);
    expect(click).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
  it('allows configuration changes on matching datasets and partitions',()=>{
    expect(incompatibilities(a.report,b.report)).toEqual([]);
    render(<Comparison left={a} right={b}/>);
    expect(screen.getByText('+0.0200')).toBeTruthy();
  });
  it('hides deltas for a changed dataset or evaluation boundary',()=>{
    const changed=structuredClone(b); changed.report.dataset_sha256='different'; changed.report.splits.test.last='2025-01-01';
    expect(incompatibilities(a.report,changed.report)).toEqual(['Dataset fingerprint','test partition']);
    render(<Comparison left={a} right={changed}/>);
    expect(screen.queryByText('+0.0200')).toBeNull();
    expect(screen.getAllByText('Unavailable')).toHaveLength(3);
  });
});

describe('experiment workspace',()=>{
  it('selects two archived snapshots and preserves the selection in the URL',async()=>{
    mount();
    fireEvent.click(await screen.findByLabelText('Compare snapshot '+a.id.slice(0,10)));
    await waitFor(()=>expect(new URLSearchParams(location.hash.split('?')[1]).get('compare')).toBe(a.id));
    fireEvent.click(screen.getByLabelText('Compare snapshot '+b.id.slice(0,10)));
    expect(await screen.findByText('+0.0200')).toBeTruthy();
    expect(location.hash).toContain(encodeURIComponent(a.id+','+b.id));
  });
  it('opens saved evidence and links forecasts to the same snapshot',async()=>{
    mount(); fireEvent.click(await screen.findByLabelText('Inspect snapshot '+b.id.slice(0,10)));
    expect(await screen.findByText('Experiment evidence')).toBeTruthy();
    expect(screen.getByRole('link',{name:'Inspect saved forecasts →'}).getAttribute('href')).toBe('#forecasts/'+b.id);
    expect(screen.getByText('0.5')).toBeTruthy();
  });
  it('searches the whole history and provides an explicit empty state',async()=>{
    mount(); await screen.findByText('Saved experiments');
    fireEvent.change(screen.getByLabelText('Search snapshots'),{target:{value:'missing'}});
    fireEvent.click(screen.getByText('Apply search'));
    expect(await screen.findByText('No snapshots match this search.')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('search=missing'),expect.objectContaining({signal:expect.any(AbortSignal)}));
  });
  it('recovers from a list request failure',async()=>{
    vi.mocked(fetch).mockResolvedValueOnce(response({},503)); mount();
    fireEvent.click(await screen.findByText('Try again'));
    expect(await screen.findByLabelText('Inspect snapshot '+a.id.slice(0,10))).toBeTruthy();
  });
  it('does not show a late response under a different snapshot route',async()=>{
    let finish!: (value: Response)=>void;
    vi.stubGlobal('fetch',vi.fn((url:string)=>url.endsWith(a.id)?new Promise<Response>(resolve=>{finish=resolve;}):Promise.resolve(response(url.startsWith('/api/experiments?')?{current_id:a.id,total:2,items:summaries}:b))));
    route('#experiments/'+a.id); mount();
    await waitFor(()=>expect(finish).toBeTypeOf('function'));
    route('#experiments/'+b.id);
    await screen.findByText('Experiment evidence');
    await act(async()=>finish(response(a)));
    expect(screen.getByRole('link',{name:'Inspect saved forecasts →'}).getAttribute('href')).toBe('#forecasts/'+b.id);
    expect(screen.getByText('0.5')).toBeTruthy();
  });
});
