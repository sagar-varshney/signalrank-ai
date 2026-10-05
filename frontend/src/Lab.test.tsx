import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {BatchInference,Diagnostics,IntervalEvidence} from './Lab';

const metrics={average_precision:.3,brier_score:.06,recall_at_50:.4};
const bins=Array.from({length:10},(_,i)=>({lower:i/10,upper:(i+1)/10,count:i?0:100,predicted:i?null:.05,observed:i?null:.04}));
const diagnostic={snapshot_id:'a'.repeat(64),population:630,positives:44,budget:50,captured:15,selected_negatives:35,missed_positives:29,
  slices:[{dimension:'Severity',group:'High (7–10)',count:200,positives:20,selected:30,captured:10,missed:10,status:'descriptive',metrics,global_budget_recall:.5},
    {dimension:'Period',group:'2025 Q1',count:20,positives:1,selected:2,captured:1,missed:0,status:'insufficient evidence',metrics:null,global_budget_recall:null}],
  examples:[{id:'SYN-00001',kind:'selected negative',rank:1,probability:.4,description:'authentication bypass in gateway',outcome:0,contributions:[{feature:'numeric__severity',value:.6}]}],
  calibration:{raw:bins,calibrated:bins},missingness:[{feature:'severity',missing:0}],scope:'Full cohort; global review selection.',display_gate:'Explicit minimum display counts.',warning:'Synthetic only.'};
const model={artifact_id:'a'.repeat(64),run_id:'run-a',configuration:{seed:42,count:3600,regularization_c:1,source:'synthetic'},dataset_sha256:'d'.repeat(64),code_sha256:{'core.py':'c'.repeat(64)},runtime:{python:'3.13'}};
const records=Array.from({length:20},(_,i)=>({id:'SYN-BATCH-'+i,description:'authentication bypass in gateway',severity:7,remote:true,authentication_required:false}));
const receipt={id:'1'.repeat(32),created_at:'2026-10-06T01:00:00Z',mode:'synthetic',count:20,input_sha256:'d'.repeat(64),receipt_sha256:'e'.repeat(64),model,target:'Simulated inclusion',warning:'Fictional inference only.',items:records.map((row,i)=>({...row,rank:i+1,probability:.4-i*.01}))};
function response(value:unknown,status=200){return {ok:status>=200&&status<300,status,json:async()=>value} as Response;}
function mount(view:'diagnostics'|'inference'){location.hash='#'+view;const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0},mutations:{retry:false}}});render(<QueryClientProvider client={client}>{view==='diagnostics'?<Diagnostics/>:<BatchInference/>}</QueryClientProvider>);return client;}
beforeEach(()=>{vi.stubGlobal('fetch',vi.fn(async(url:string,options?:RequestInit)=>{
  if(url==='/api/diagnostics')return response(diagnostic);
  if(url==='/api/benchmark')return response({snapshot_id:diagnostic.snapshot_id,items:[],warning:'No offline benchmark loaded.'});
  if(url==='/api/inference/models')return response({items:[model],warning:'Explicitly trusted only.'});
  if(url==='/api/inference/sample')return response({source:'synthetic',records});
  if(url==='/api/batches'&&options?.method==='POST')return response(receipt,201);
  if(url.startsWith('/api/batches?'))return response({total:1,items:[receipt]});
  if(url.startsWith('/api/batches/'))return response(receipt);
  return response({},404);
}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});

describe('model diagnostics',()=>{
  it('filters slices and suppresses unsupported metrics',async()=>{
    mount('diagnostics');expect(await screen.findByText('High (7–10)')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Group by'),{target:{value:'Period'}});
    expect(screen.getByText('2025 Q1')).toBeTruthy();expect(screen.getAllByText('Unavailable')).toHaveLength(3);
    expect(screen.queryByText('High (7–10)')).toBeNull();
  });
  it('displays budget-error semantics, calibration support and benchmark empty state',async()=>{
    mount('diagnostics');await screen.findByText('Slice explorer');
    expect(screen.getByText(/ranking-budget errors/)).toBeTruthy();
    expect(screen.getByRole('img',{name:/Raw and calibrated/})).toBeTruthy();
    expect(await screen.findByText('No offline benchmark loaded.')).toBeTruthy();
    expect(screen.getAllByText('No support').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Example type'),{target:{value:'missed positive'}});
    expect(screen.getByText('No examples of this type in the cohort.')).toBeTruthy();
  });
  it('shows conditional intervals and explicit unavailability',()=>{
    const result={status:'exploratory',block_days:30,valid_repetitions:250,warning:'Conditional on fixed fitted models.',metrics:[{metric:'average_precision',delta_b_minus_a:.02,lower:-.01,upper:.04}]};
    const view=render(<IntervalEvidence value={result}/>);
    expect(screen.getByText('[-0.0100, +0.0400]')).toBeTruthy();
    expect(screen.getByText('Conditional on fixed fitted models.')).toBeTruthy();
    view.rerender(<IntervalEvidence value={{status:'unavailable',reason:'Old snapshot lacks complete records.',metrics:[]}}/>);
    expect(screen.queryByText('+0.0200')).toBeNull();expect(screen.getByText(/Old snapshot lacks complete/)).toBeTruthy();
  });
});

describe('versioned batch inference',()=>{
  it('submits the chosen trusted model and exposes its saved receipt',async()=>{
    mount('inference');const run=await screen.findByRole('button',{name:'Run & save predictions →'});
    await waitFor(()=>expect((run as HTMLButtonElement).disabled).toBe(false));fireEvent.click(run);
    expect(await screen.findByText('Saved batch predictions')).toBeTruthy();
    const call=vi.mocked(fetch).mock.calls.find(([,options])=>options?.method==='POST');
    expect(JSON.parse(call![1]!.body as string)).toEqual({source:'synthetic',records,model_id:model.artifact_id});
    expect(screen.getByRole('link',{name:'Export receipt'}).getAttribute('href')).toBe('/api/batches/'+receipt.id);
    expect(screen.queryByText('SYN-BATCH-19')).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Next predictions'}));expect(screen.getByText('SYN-BATCH-19')).toBeTruthy();
  });
  it('disables predictions when there are no explicitly trusted models',async()=>{
    vi.mocked(fetch).mockImplementation(async(url)=>response(String(url)==='/api/inference/models'?{items:[],warning:''}:String(url)==='/api/inference/sample'?{source:'synthetic',records}:{total:0,items:[]}));
    mount('inference');await screen.findByText(/No trusted saved model is available/);
    expect((screen.getByRole('button',{name:'Run & save predictions →'}) as HTMLButtonElement).disabled).toBe(true);
    expect(vi.mocked(fetch).mock.calls.some(([,options])=>options?.method==='POST')).toBe(false);
  });
  it('preserves an editable draft and rejects malformed JSON before submitting',async()=>{
    mount('inference');const editor=screen.getByLabelText('Fictional input JSON');
    await waitFor(()=>expect((editor as HTMLTextAreaElement).value).toContain('synthetic'));
    fireEvent.change(editor,{target:{value:''}});await act(async()=>{});expect((editor as HTMLTextAreaElement).value).toBe('');
    fireEvent.change(editor,{target:{value:'{bad'}});fireEvent.click(screen.getByRole('button',{name:'Run & save predictions →'}));
    expect(await screen.findByRole('alert')).toBeTruthy();expect(vi.mocked(fetch).mock.calls.some(([,options])=>options?.method==='POST')).toBe(false);
  });
  it('shows schema rejection without retrying a failed mutation',async()=>{
    const original=vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((url,options)=>options?.method==='POST'?Promise.resolve(response({detail:[{loc:['body','records',0,'remote'],msg:'Input should be a valid boolean'}]},422)):original(url,options));
    mount('inference');const run=await screen.findByRole('button',{name:'Run & save predictions →'});
    await waitFor(()=>expect((run as HTMLButtonElement).disabled).toBe(false));fireEvent.click(run);
    expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.getByText(/body.records.0.remote/)).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls.filter(([,options])=>options?.method==='POST')).toHaveLength(1);
    expect(screen.queryByText('Saved batch predictions')).toBeNull();
  });
});
