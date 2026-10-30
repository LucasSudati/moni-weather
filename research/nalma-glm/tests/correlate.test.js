import test from "node:test";
import assert from "node:assert/strict";
import { correlate, distanceKm } from "../processors/correlate.js";
const c = [{nalma_cluster_id:"n1",latitude:34.7,longitude:-86.6,start_time_utc:"2026-05-01T00:00:00.000Z",end_time_utc:"2026-05-01T00:00:00.200Z"}];
const f = [{flash_id:"g1",latitude:34.71,longitude:-86.61,start_time_utc:"2026-05-01T00:00:00.100Z",end_time_utc:"2026-05-01T00:00:00.300Z"}];
test("distância nula",()=>assert.equal(distanceKm(c[0],c[0]),0));
test("sobreposição e classificação desconhecida",()=>{
 const m=correlate(c,f);assert.equal(m.length,1);assert.equal(m[0].time_overlap_ms,100);assert.equal(m[0].classification,"unknown");
});
test("rejeita distância excessiva",()=>assert.equal(correlate(c,[{...f[0],latitude:36}]).length,0));
test("rejeita intervalo distante",()=>assert.equal(correlate(c,[{...f[0],start_time_utc:"2026-05-01T00:01:00Z",end_time_utc:"2026-05-01T00:01:01Z"}]).length,0));
test("permite muitos para muitos",()=>assert.equal(correlate(c,[f[0],{...f[0],flash_id:"g2"}]).length,2));
test("rejeita intervalo inválido",()=>assert.throws(()=>correlate(c,[{...f[0],end_time_utc:"2026-04-30T00:00:00Z"}])));
