import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bikes, type BikeReport } from './Bikes';

const metric={id:'logistic',name:'Logistic regression · calibrated',average_precision:.6,brier_score:.1,count:100,positives:20,prevalence:.2,budget:10,captured:8,missed:12,selected_negatives:2,precision:.8,recall:.4};
const report:BikeReport={status:'available',warning:'Original fictional test evidence.',threshold:800,source:{title:'Original fixture',dataset_url:'#bikes',doi:'#bikes',license_url:'#bikes',license:'Original fixture'},attribution:'Original test fixture, not measured real-data results.',
  partitions:Object.fromEntries(['train','calibration','development','final'].map(name=>[name,{count:100,positives:20,first:'2018-01-01',last:'2018-01-31',last_target_at:'2018-02-01'}])),
  comparisons:Object.fromEntries(['development','final'].map(part=>[part,[{...metric,average_precision:part==='final'?.6:.5},{...metric,id:'boosted',name:'Histogram boosting · calibrated',average_precision:.7},{...metric,id:'weekly',name:'Same target hour last week',average_precision:.65,brier_score:null,captured:7,missed:13,selected_negatives:3,precision:.7,recall:.35},{...metric,id:'latest',name:'Latest-hour demand',brier_score:null},{...metric,id:'prevalence',name:'Training prevalence'}]])),
  timeline:[{day:'2018-10-01',hours:24,observed_fraction:.3,logistic:.2,boosted:.25},{day:'2018-10-02',hours:24,observed_fraction:.2,logistic:.3,boosted:.25}],
  calibration:{logistic:[{lower:0,upper:.1,count:0,predicted:null,observed:null}],boosted:[{lower:0,upper:.1,count:5,predicted:.05,observed:.1}]},slices:[],errors:[],limitations:['No causal claim.']};
function mount(hash='bikes'){location.hash=hash;render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><Bikes/></QueryClientProvider>);}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('keeps the primary fixed even when another candidate has higher AP',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>({ok:true,json:async()=>/\/(audit|external)$/.test(String(input))?{status:'unavailable',reason:'Local report not saved.'}:report})));
  mount();await screen.findByText('Which hours will be busy tomorrow?');
  expect(screen.getByText('-0.050')).toBeTruthy();
  expect(screen.getByText(/primary model captured 8 high-demand hours versus 7 for the weekly baseline from 10 reviewed hours/i)).toBeTruthy();
  expect(screen.getByText('Prespecified primary')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Comparison table interval'),{target:{value:'development'}});
  expect(screen.getByText('-0.150')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Displayed probability model'),{target:{value:'boosted'}});
  expect(screen.getByRole('img',{name:'Daily high-demand frequency and mean forecast probability'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Export benchmark report'}).getAttribute('href')).toBe('/api/bikes/export');
  await waitFor(()=>expect(vi.mocked(fetch).mock.calls).toHaveLength(3));
});
it('does not fetch inactive workspaces and supports an explicit error retry',async()=>{
  let benchmarkCalls=0;const f=vi.fn(async(input:RequestInfo|URL)=>{if(/\/(audit|external)$/.test(String(input)))return {ok:true,json:async()=>({status:'unavailable',reason:'Local report not saved.'})};benchmarkCalls++;return benchmarkCalls===1?{ok:false,status:500}:{ok:true,json:async()=>report};});vi.stubGlobal('fetch',f);
  mount('overview');await waitFor(()=>expect(f).not.toHaveBeenCalled());
  location.hash='bikes';window.dispatchEvent(new Event('signalrank:view'));
  await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Retry benchmark'}));
  await screen.findByText('Which hours will be busy tomorrow?');
});
it('shows unavailable evidence without inventing real results or triggering training',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({status:'unavailable',reason:'No saved report.'})})));
  mount();await screen.findByText('No saved bike benchmark loaded.');
  expect(screen.queryByText('Average precision')).toBeNull();
  expect(screen.queryByRole('button',{name:/train|fetch|download/i})).toBeNull();
});
it('shows the separate exploratory audit and its one global budget',async()=>{
  const evidence={status:'available',warning:'Final outcomes already examined; exploratory only.',selection:'One global budget.',display_gate:'Support guard.',recent_demand_cutoff:224.17,global_budget:145,global_captured:118,slices:[{dimension:'Target-hour week',group:'Weekend',count:384,positives:86,prevalence:86/384,mean_probability:.24,global_selected:37,global_captured:29,global_recall:29/86,logistic_ap:.604,weekly_ap:.629,logistic_brier:.16,display_warning:null}]};
  vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>({ok:true,json:async()=>String(input).includes('/audit')?evidence:String(input).includes('/external')?{status:'unavailable',reason:'Local report not saved.'}:report})));
  mount();await screen.findByText('Where does the fixed model struggle?');
  expect(await screen.findByText('Weekend')).toBeTruthy();
  expect(screen.getByText('Final outcomes already examined; exploratory only.')).toBeTruthy();
  expect(screen.getByRole('region',{name:'Exploratory bike demand subgroup diagnostics, scroll horizontally if needed'})).toBeTruthy();
  expect(screen.getByText('145')).toBeTruthy();
});
it('shows the 2019 source gate without manufacturing external model performance',async()=>{
  const gate={status:'available',gate:'blocked',warning:'Source compatibility failed before model scoring.',reasons:['69 hourly slots are missing.','361 daily totals differ.'],hourly:{raw_rows:14291359,expected_hours:8760,observed_hours:8691,missing_hour_spans:[{first:'2019-08-28T00:00:00+09:00',last:'2019-08-28T23:00:00+09:00',hours:24}]},daily:{published_dates:364,missing_dates:['2019-09-07'],comparable_dates:361,matched_dates:0,mismatched_dates:361,mismatch_examples:[{day:'2019-01-01',hourly_use_total:5428,daily_rental_total:8601}],unchecked_dates:[]},model_evaluation:null,source:{catalog_url:'#bikes',daily_catalog_url:'#bikes',license_url:'#bikes',license:'KOGL Type 1',modifications:'Aggregated source counts.'}};
  vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>({ok:true,json:async()=>String(input).includes('/external')?gate:String(input).includes('/audit')?{status:'unavailable',reason:'No audit.'}:report})));
  mount();await screen.findByText('Can later data validate this model?');
  expect(await screen.findByText('361 daily totals differ.')).toBeTruthy();
  expect(screen.getByText('Evaluation blocked')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Export source-gate report'}).getAttribute('href')).toBe('/api/bikes/external/export');
  expect(screen.getByText('Source compatibility failed before model scoring.')).toBeTruthy();
  expect(screen.queryByText(/2019 average precision/i)).toBeNull();
});
