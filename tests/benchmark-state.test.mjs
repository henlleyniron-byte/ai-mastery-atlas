import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {createServer} from 'vite';
const vite=await createServer({appType:'custom',configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
after(()=>vite.close());
const {sanitizePublicLabState}=await vite.ssrLoadModule('/lib/v5-state.ts');
test('unmeasured benchmark values remain absent rather than becoming zero',()=>{
 const base={id:'run',date:'2026-10-07',task:'Frozen task',model:'Test model'};
 const runs=sanitizePublicLabState({benchmarks:[base,{...base,id:'two',score:null,estimatedCost:'',latencySeconds:0}]}).benchmarks;
 assert.equal(runs.length,2);assert.equal(runs[0].score,undefined);assert.equal(runs[1].estimatedCost,undefined);assert.equal(runs[1].latencySeconds,0);
 assert.equal(sanitizePublicLabState({benchmarks:[{...base,date:'2026-02-31'}]}).benchmarks.length,0);
});
