// MONI Weather — NOAA GOES-19 GLM -> JSON, executado no Supabase Edge Functions.
// Endpoint público de leitura para o GitHub Pages. Não usa Python nem servidor local.
import h5wasm from "npm:h5wasm@0.10.3";

const BUCKET = "https://noaa-goes19.s3.amazonaws.com/";
const PRODUCT = "GLM-L2-LCFA";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Cache-Control": "public, max-age=45, s-maxage=45",
};

type Flash = { lat:number; lon:number; time:string };
let memoryCache:{ at:number; flashes:Flash[]; latest:string|null }|null = null;

function prefixFor(d:Date){
  const y=d.getUTCFullYear();
  const start=Date.UTC(y,0,0), doy=Math.floor((d.getTime()-start)/86400000);
  return `${PRODUCT}/${y}/${String(doy).padStart(3,"0")}/${String(d.getUTCHours()).padStart(2,"0")}/`;
}
function startFromKey(k:string){
  const m=k.match(/_s(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})/); if(!m)return null;
  const [,ys,ds,hs,ms,ss]=m; const y=+ys,doy=+ds;
  return new Date(Date.UTC(y,0,doy,+hs,+ms,+ss));
}
async function listKeys(d:Date){
  const u=`${BUCKET}?list-type=2&prefix=${encodeURIComponent(prefixFor(d))}`;
  const r=await fetch(u); if(!r.ok)throw new Error(`NOAA list HTTP ${r.status}`);
  const xml=await r.text();
  return [...xml.matchAll(/<Key>([^<]+\.nc)<\/Key>/g)].map(x=>x[1].replaceAll("&amp;","&"));
}
function numeric(a:any):number[]{
  if(a==null)return [];
  if(ArrayBuffer.isView(a))return Array.from(a as any, Number);
  if(Array.isArray(a))return a.map(Number);
  return [Number(a)];
}
function datasetValues(f:any,name:string){
  const d=f.get(name); if(!d) return [];
  // h5wasm aplica a leitura do dataset; GLM guarda scale/offset nos atributos.
  let a=numeric(d.value);
  const attrs=d.attrs||{};
  const sf=Number(attrs.scale_factor?.value ?? attrs.scale_factor ?? 1);
  const off=Number(attrs.add_offset?.value ?? attrs.add_offset ?? 0);
  if(Number.isFinite(sf)&&Number.isFinite(off)&&(sf!==1||off!==0)) a=a.map(v=>v*sf+off);
  return a;
}
async function readGlmFile(key:string):Promise<Flash[]>{
  const r=await fetch(BUCKET+key); if(!r.ok)throw new Error(`NOAA file HTTP ${r.status}`);
  const bytes=new Uint8Array(await r.arrayBuffer());
  const mod=await h5wasm.ready; const {FS}=mod;
  const fn=`/tmp/glm-${crypto.randomUUID()}.nc`; FS.writeFile(fn,bytes);
  try{
    const f=new h5wasm.File(fn,"r");
    try{
      const lat=datasetValues(f,"flash_lat"), lon=datasetValues(f,"flash_lon");
      const sec=datasetValues(f,"flash_time_offset_of_last_event");
      const q=datasetValues(f,"flash_quality_flag");
      const base=startFromKey(key); if(!base)return [];
      const out:Flash[]=[];
      for(let i=0;i<Math.min(lat.length,lon.length,sec.length);i++){
        if(q.length && Number(q[i])!==0)continue;
        if(!Number.isFinite(lat[i])||!Number.isFinite(lon[i])||!Number.isFinite(sec[i]))continue;
        out.push({lat:lat[i],lon:lon[i],time:new Date(base.getTime()+sec[i]*1000).toISOString()});
      }
      return out;
    }finally{f.close();}
  }finally{try{FS.unlink(fn);}catch{}}
}
async function loadRecent(){
  if(memoryCache && Date.now()-memoryCache.at<45000)return memoryCache;
  const now=new Date(), prev=new Date(now.getTime()-3600000);
  const keys=[...(await listKeys(now)),...(await listKeys(prev))];
  const cutoff=Date.now()-17*60000;
  const recent=[...new Set(keys)].map(k=>({k,d:startFromKey(k)})).filter(x=>x.d&&x.d.getTime()>=cutoff).sort((a,b)=>a.d!.getTime()-b.d!.getTime()).slice(-54);
  const flashes:Flash[]=[];
  // pequenos lotes evitam abrir dezenas de downloads simultâneos no Edge Runtime.
  for(let i=0;i<recent.length;i+=6){
    const batch=await Promise.allSettled(recent.slice(i,i+6).map(x=>readGlmFile(x.k)));
    for(const x of batch)if(x.status==="fulfilled")flashes.push(...x.value);
  }
  const latest=flashes.reduce<string|null>((m,x)=>!m||x.time>m?x.time:m,null);
  memoryCache={at:Date.now(),flashes,latest}; return memoryCache;
}

export default {
  async fetch(req:Request){
    if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
    if(req.method!=="GET")return Response.json({error:"method not allowed"},{status:405,headers:CORS});
    try{
      const u=new URL(req.url);
      const south=Math.max(-54,Number(u.searchParams.get("south")??-54));
      const north=Math.min(54,Number(u.searchParams.get("north")??15));
      const west=Number(u.searchParams.get("west")??-90), east=Number(u.searchParams.get("east")??-30);
      const minutes=Math.max(5,Math.min(20,Number(u.searchParams.get("minutes")??15)));
      const data=await loadRecent(), cutoff=Date.now()-minutes*60000;
      const flashes=data.flashes.filter(f=>Date.parse(f.time)>=cutoff&&f.lat>=south&&f.lat<=north&&f.lon>=west&&f.lon<=east);
      return Response.json({source:"NOAA GOES-19 GLM-L2-LCFA",source_ok:true,latest:data.latest,generated:new Date().toISOString(),flashes},{headers:CORS});
    }catch(e){
      console.error(e);
      return Response.json({source:"NOAA GOES-19 GLM-L2-LCFA",source_ok:false,error:String(e),flashes:[]},{status:503,headers:{...CORS,"Cache-Control":"no-store"}});
    }
  }
};
