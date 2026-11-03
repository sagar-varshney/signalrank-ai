import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bikes, type BikeReport } from './Bikes';

const metric={id:'logistic',name:'Logistic regression · calibrated',average_precision:.6,brier_score:.1,count:100,positives:20,prevalence:.2,budget:10,captured:8,missed:12,selected_negatives:2,precision:.8,recall:.4};
const report:BikeReport={status:'available',warning:'Original fictional test evidence.',threshold:800,source:{title:'Original fixture',dataset_url:'#bikes',doi:'#bikes',license_url:'#bikes',license:'Original fixture'},attribution:'Original test fixture, not measured real-data results.',
  partitions:Object.fromEntries(['train','calibration','development','final'].map(name=>[name,{count:100,positives:20,first:'2018-01-01',last:'2018-01-31',last_target_at:'2018-02-01'}])),
  comparisons:Object.fromEntries(['development','final'].map(part=>[part,[{...metric,average_precision:part==='final'?.6:.5},{...metric,id:'boosted',name:'Histogram boosting · calibrated',average_precision:.7},{...metric,id:'weekly',name:'Same target hour last week',average_precision:.65,brier_score:null},{...metric,id:'latest',name:'Latest-hour demand',brier_score:null},{...metric,id:'prevalence',name:'Training prevalence'}]])),
  timeline:[{day:'2018-10-01',hours:24,observed_fraction:.3,logistic:.2,boosted:.25},{day:'2018-10-02',hours:24,observed_fraction:.2,logistic:.3,boosted:.25}],
  calibration:{logistic:[{lower:0,upper:.1,count:0,predicted:null,observed:null}],boosted:[{lower:0,upper:.1,count:5,predicted:.05,observed:.1}]},slices:[],errors:[],limitations:['No causal claim.']};
function mount(hash='bikes'){location.hash=hash;render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><Bikes/></QueryClientProvider>);}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('keeps the primary fixed even when another candidate has higher AP',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>report})));
  mount();await screen.findByText('Which hours will be busy tomorrow?');
  expect(screen.getByText('-0.050')).toBeTruthy();
  expect(screen.getByText('Prespecified primary')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Comparison table interval'),{target:{value:'development'}});
  expect(screen.getByText('-0.150')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Displayed probability model'),{target:{value:'boosted'}});
  expect(screen.getByRole('img',{name:'Daily high-demand frequency and mean forecast probability'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Export benchmark report'}).getAttribute('href')).toBe('/api/bikes/export');
  expect(vi.mocked(fetch).mock.calls).toHaveLength(1);
});
it('does not fetch inactive workspaces and supports an explicit error retry',async()=>{
  const f=vi.fn().mockResolvedValueOnce({ok:false,status:500}).mockResolvedValue({ok:true,json:async()=>report});vi.stubGlobal('fetch',f);
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
