const map=L.map('map',{zoomControl:true,preferCanvas:true}).setView([-29.19,-54.87],6);

// Mapa-base sem chave de API. O filtro CSS mantém a identidade visual escura.
const base=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{
  maxZoom:16,
  attribution:'Tiles © Esri',
  className:'esri-dark'
}).addTo(map);
// V6: nomes e limites vêm de uma única camada de referência para evitar rótulos duplicados.

map.createPane('satellitePane');
map.createPane('infraredPane');
map.getPane('satellitePane').style.zIndex=250;
map.getPane('satellitePane').style.pointerEvents='none';
map.getPane('infraredPane').style.zIndex=260;
map.getPane('infraredPane').style.pointerEvents='none';

const weatherLayer=L.layerGroup().addTo(map);
const stormLayer=L.layerGroup().addTo(map);
const hailLayer=L.layerGroup().addTo(map);
const detectedStormLayer=L.layerGroup().addTo(map);
let satelliteLayer=null;
let satelliteEnabled=false;
let infraredLayer=null;
let infraredEnabled=false;

const GIBS_WMS='https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi';

function clock(){const d=new Date();document.querySelector('#clock').textContent=d.toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo'})+' BRT';}
clock();setInterval(clock,1000);
map.on('mousemove',e=>document.querySelector('#coords').textContent=`LAT ${e.latlng.lat.toFixed(3)} / LON ${e.latlng.lng.toFixed(3)}`);

map.on('click',e=>{if(window._pickMode)return;inspect(e.latlng.lat,e.latlng.lng);});

document.querySelector('#rain').onchange=e=>e.target.checked?map.addLayer(rainLayer):map.removeLayer(rainLayer);
document.querySelector('#storms').onchange=e=>e.target.checked?map.addLayer(stormLayer):map.removeLayer(stormLayer);
document.querySelector('#hail').onchange=e=>e.target.checked?map.addLayer(hailLayer):map.removeLayer(hailLayer);

function roundedUtc(offsetHours=0){
  const d=new Date(Date.now()-offsetHours*3600000);
  d.setUTCSeconds(0,0);
  d.setUTCMinutes(Math.floor(d.getUTCMinutes()/10)*10);
  return d;
}
function isoMinute(d){return d.toISOString().replace(/\.000Z$/,'Z');}
function labelTime(d){return d.toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'})+' BRT';}

function buildSatellite(offsetHours=0){
  if(offsetHours<0){if(satelliteLayer)map.removeLayer(satelliteLayer);satelliteLayer=null;setSatStatus('SEM DADOS FUTUROS');return;}
  const stale=window._satStale=window._satStale||[];if(satelliteLayer)stale.push(satelliteLayer);
  const options={
    layers:'GOES-East_ABI_GeoColor',
    format:'image/png',
    transparent:true,
    opacity:Number(document.querySelector('#satOpacity')?.value||72)/100,
    pane:'satellitePane',
    attribution:'NASA GIBS / GOES-East ABI'
  };
  // Para AGORA deixamos o GIBS escolher o frame mais recente. Para o histórico enviamos TIME.
  if(offsetHours>0) options.time=isoMinute(roundedUtc(offsetHours));
  satelliteLayer=L.tileLayer.wms(GIBS_WMS,options);
  satelliteLayer.on('loading',()=>setSatStatus('CARREGANDO…'));
  const me=satelliteLayer;me.on('load',()=>{while(stale.length){const o=stale.shift();if(o!==me)map.removeLayer(o);}setSatStatus(offsetHours===0?'ÚLTIMO FRAME':labelTime(roundedUtc(offsetHours)));});
  satelliteLayer.on('tileerror',()=>setSatStatus('SEM FRAME'));
  if(satelliteEnabled) satelliteLayer.addTo(map);
}
function setSatStatus(text){const el=document.querySelector('#satStatus');if(el)el.textContent=text;}

document.querySelector('#sat').onchange=e=>{
  satelliteEnabled=e.target.checked;
  document.querySelector('#satControls').classList.toggle('visible',satelliteEnabled);
  if(satelliteEnabled){
    if(!satelliteLayer)buildSatellite(12-Number(timeline.value)); else satelliteLayer.addTo(map);
  }else if(satelliteLayer){map.removeLayer(satelliteLayer);(window._satStale||[]).splice(0).forEach(l=>map.removeLayer(l));setSatStatus('DESLIGADO');}
};

document.querySelector('#satOpacity').oninput=e=>{document.querySelector('#opacityValue').textContent=e.target.value+'%';if(satelliteLayer)satelliteLayer.setOpacity(Number(e.target.value)/100);};



// V6 — IR renderizado como uma imagem contínua da área visível.
// Evita a aparência de mosaico/quadrados dos tiles WMS quando o usuário aproxima o mapa.
let infraredRequestId=0;
function irViewportUrl(offsetHours=0){
  const b=map.getBounds(), sw=mercatorXY(b.getSouth(),b.getWest()), ne=mercatorXY(b.getNorth(),b.getEast());
  const size=map.getSize();
  const scale=Math.min(2,window.devicePixelRatio||1.5);
  const w=Math.max(800,Math.min(2048,Math.round(size.x*scale)));
  const h=Math.max(500,Math.min(2048,Math.round(size.y*scale)));
  const params=new URLSearchParams({SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetMap',LAYERS:'GOES-East_ABI_Band13_Clean_Infrared',STYLES:'',FORMAT:'image/png',TRANSPARENT:'true',SRS:'EPSG:3857',BBOX:`${sw[0]},${sw[1]},${ne[0]},${ne[1]}`,WIDTH:String(w),HEIGHT:String(h)});
  if(offsetHours>0)params.set('TIME',isoMinute(roundedUtc(offsetHours)));
  return GIBS_WMS+'?'+params.toString();
}
function buildInfrared(offsetHours=0){
  const requestId=++infraredRequestId;
  if(offsetHours<0){if(infraredLayer)map.removeLayer(infraredLayer);infraredLayer=null;setIrStatus('SEM DADOS FUTUROS');return;}
  if(!infraredEnabled)return;
  setIrStatus('CARREGANDO…');
  const b=map.getBounds(), url=irViewportUrl(offsetHours);
  const img=new Image(); img.crossOrigin='anonymous';
  img.onload=()=>{
    if(requestId!==infraredRequestId||!infraredEnabled)return;
    const prev=infraredLayer;infraredLayer=L.imageOverlay(url,b,{opacity:.78,pane:'infraredPane',interactive:false,attribution:'NASA GIBS / GOES-East ABI Band 13'}).addTo(map);if(prev)map.removeLayer(prev);
    setIrStatus(offsetHours===0?'LIVE':labelTime(roundedUtc(offsetHours)));
    updateZoomNotice();
  };
  img.onerror=()=>{if(requestId===infraredRequestId)setIrStatus('SEM IMAGEM');};
  img.src=url;
}
function setIrStatus(text){const el=document.querySelector('#irStatus');if(el)el.textContent=text;}
function updateZoomNotice(){
  const n=document.querySelector('#zoomNotice'); if(!n)return;
  n.classList.toggle('visible',infraredEnabled && map.getZoom()>=9);
}
document.querySelector('#ir').onchange=e=>{
  infraredEnabled=e.target.checked;
  if(infraredEnabled){
    if(satelliteEnabled){document.querySelector('#sat').checked=false;satelliteEnabled=false;if(satelliteLayer)map.removeLayer(satelliteLayer);document.querySelector('#satControls').classList.remove('visible');setSatStatus('DESLIGADO');}
    buildInfrared(12-Number(timeline.value));
  }else{infraredRequestId++;if(infraredLayer)map.removeLayer(infraredLayer);infraredLayer=null;setIrStatus('OFF');updateZoomNotice();}
};

// V5: GLM, vento e limites configurados no bloco final.

const timeline=document.querySelector('#timeline');
function applyTimeline(){
  const n=12-Number(timeline.value);
  document.querySelector('#timeLabel').textContent=n===0?'AGORA':n>0?`-${n} h`:`+${-n} h`;
  if(satelliteEnabled)buildSatellite(n);
  if(infraredEnabled)buildInfrared(n);
  renderPoint();
}
timeline.oninput=()=>{renderPoint();const n=12-Number(timeline.value);document.querySelector('#timeLabel').textContent=n===0?'AGORA':n>0?`-${n} h`:`+${-n} h`;};
timeline.onchange=applyTimeline;

let playTimer=null;
document.querySelector('#play').onclick=()=>{
  if(playTimer){clearInterval(playTimer);playTimer=null;document.querySelector('#play').textContent='▶';return;}
  document.querySelector('#play').textContent='■';
  let v=0;
  playTimer=setInterval(()=>{
    timeline.value=v;applyTimeline();v++;
    if(v>24){clearInterval(playTimer);playTimer=null;document.querySelector('#play').textContent='▶';}
  },1400);
};

// Atualiza o frame LIVE a cada 5 min, sem recarregar a página.
setInterval(()=>{
  if(Number(timeline.value)===12){
    if(satelliteEnabled)buildSatellite(0);
    if(infraredEnabled)buildInfrared(0);
  }
},300000);


// V4 — detector experimental de núcleos frios a partir da imagem IR renderizada.
// Ele procura as cores quentes (amarelo/laranja/vermelho) da paleta do produto Band 13.
// Isso NÃO confirma granizo nem substitui radar/alertas oficiais.
function mercatorXY(lat, lon){
  const R=6378137, x=R*lon*Math.PI/180;
  const y=R*Math.log(Math.tan(Math.PI/4 + Math.max(-85.0511,Math.min(85.0511,lat))*Math.PI/360));
  return [x,y];
}
function wmsIrUrl(bounds,w,h,offsetHours){
  const sw=mercatorXY(bounds.getSouth(),bounds.getWest());
  const ne=mercatorXY(bounds.getNorth(),bounds.getEast());
  const params=new URLSearchParams({SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetMap',LAYERS:'GOES-East_ABI_Band13_Clean_Infrared',STYLES:'',FORMAT:'image/png',TRANSPARENT:'true',SRS:'EPSG:3857',BBOX:`${sw[0]},${sw[1]},${ne[0]},${ne[1]}`,WIDTH:String(w),HEIGHT:String(h)});
  if(offsetHours>0) params.set('TIME',isoMinute(roundedUtc(offsetHours)));
  return GIBS_WMS+'?'+params.toString();
}
function isColdCore(r,g,b,a){
  if(a<80) return false;
  // Paleta realçada observada no produto GIBS: amarelo/laranja/vermelho = topos mais frios.
  const red = r>150 && r>g*1.15 && r>b*1.5;
  const orange = r>170 && g>55 && g<190 && b<90;
  const yellow = r>175 && g>150 && b<95;
  return red||orange||yellow;
}
async function scanInfraredCores(){
  const btn=document.querySelector('#scanStorms'), count=document.querySelector('#coreCount');
  if(!infraredEnabled){ setIrStatus('LIGUE O IR'); return; }
  if(12-Number(timeline.value)<0){setIrStatus('SEM DADOS FUTUROS');return;}
  btn.disabled=true; btn.textContent='ANALISANDO…'; detectedStormLayer.clearLayers();
  const bounds=map.getBounds(), W=480, H=320, offset=12-Number(timeline.value);
  try{
    const img=new Image(); img.crossOrigin='anonymous';
    const loaded=new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
    img.src=wmsIrUrl(bounds,W,H,offset); await loaded;
    const cv=document.createElement('canvas'); cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,W,H);
    const px=ctx.getImageData(0,0,W,H).data, step=4, gw=Math.floor(W/step), gh=Math.floor(H/step);
    const mask=new Uint8Array(gw*gh);
    for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
      let hits=0,total=0;
      for(let yy=0;yy<step;yy+=2)for(let xx=0;xx<step;xx+=2){const x=gx*step+xx,y=gy*step+yy,i=(y*W+x)*4;total++;if(isColdCore(px[i],px[i+1],px[i+2],px[i+3]))hits++;}
      if(hits>=Math.max(1,total/3))mask[gy*gw+gx]=1;
    }
    const seen=new Uint8Array(mask.length), comps=[];
    for(let i=0;i<mask.length;i++) if(mask[i]&&!seen[i]){
      const q=[i];seen[i]=1;let n=0,sx=0,sy=0,minx=1e9,miny=1e9,maxx=0,maxy=0;
      while(q.length){const j=q.pop(),x=j%gw,y=(j/gw)|0;n++;sx+=x;sy+=y;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<gw&&ny<gh){const k=ny*gw+nx;if(mask[k]&&!seen[k]){seen[k]=1;q.push(k);}}}
      }
      if(n>=4) comps.push({n,cx:sx/n,cy:sy/n,minx,miny,maxx,maxy});
    }
    const midLat=(bounds.getNorth()+bounds.getSouth())/2,cellKm2=((bounds.getEast()-bounds.getWest())*111.32*Math.cos(midLat*Math.PI/180)/gw)*((bounds.getNorth()-bounds.getSouth())*110.57/gh);
    comps.forEach(c=>c.km2=c.n*cellKm2);comps.sort((a,b)=>b.km2-a.km2);const chosen=comps.filter(c=>c.km2>=150).slice(0,24);
    chosen.forEach((c,k)=>{
      const lon=bounds.getWest()+(c.cx/gw)*(bounds.getEast()-bounds.getWest());
      const lat=bounds.getNorth()-(c.cy/gh)*(bounds.getNorth()-bounds.getSouth());
      const strength=c.km2>=2300?'SEVERA':c.km2>=840?'FORTE':'CONVECTIVA';
      const color=strength==='SEVERA'?'#ff4d4d':strength==='FORTE'?'#ff9a3d':'#ffd34d';
      const radius=Math.max(8000,Math.min(80000,Math.sqrt(c.km2/Math.PI)*1000));
      L.circle([lat,lon],{radius,color,weight:2,fillColor:color,fillOpacity:.07,dashArray:'5 4'})
        .bindTooltip(`IR-${String(k+1).padStart(2,'0')} · ${strength}<br>Núcleo frio experimental · ~${Math.round(c.km2)} km²`)
        .addTo(detectedStormLayer);
      L.marker([lat,lon],{icon:L.divIcon({className:'storm-id',html:`IR-${String(k+1).padStart(2,'0')}`,iconSize:[48,16],iconAnchor:[24,8]})}).addTo(detectedStormLayer);
    });
    count.textContent=String(chosen.length); setIrStatus(chosen.length?'ANALISADO':'SEM NÚCLEOS');
  }catch(err){console.error(err);setIrStatus('ANÁLISE FALHOU');count.textContent='--';}
  finally{btn.disabled=false;btn.textContent='ANALISAR NÚCLEOS IR';}
}
document.querySelector('#scanStorms').onclick=scanInfraredCores;
document.querySelector('#storms').addEventListener('change',e=>e.target.checked?map.addLayer(detectedStormLayer):map.removeLayer(detectedStormLayer));
map.on('moveend',()=>{detectedStormLayer.clearLayers();document.querySelector('#coreCount').textContent='0';updateZoomNotice();});

// ========================= V5 =========================
map.createPane('boundaryPane');
map.getPane('boundaryPane').style.zIndex=650;
map.getPane('boundaryPane').style.pointerEvents='none';
const worldBoundaries=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,pane:'boundaryPane',opacity:.96,attribution:'Esri boundaries & places'}).addTo(map);
const brazilBorders=L.layerGroup().addTo(map);
async function loadBrazilBorders(){
  const status=document.querySelector('#borderStatus');
  try{
    const url='https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF';
    const r=await fetchT(url); if(!r.ok) throw Error('HTTP '+r.status);
    const gj=await r.json();
    L.geoJSON(gj,{pane:'boundaryPane',style:{color:'#d9f1ff',weight:1.15,opacity:.88,fill:false,className:'boundary-state'}}).addTo(brazilBorders);
    status.textContent='IBGE + ESRI'; status.classList.add('live');
  }catch(err){console.warn('IBGE borders:',err);status.textContent='ESRI';status.classList.add('live');}
}
loadBrazilBorders();
document.querySelector('#borders').onchange=e=>{const on=e.target.checked;for(const l of [worldBoundaries,brazilBorders])on?map.addLayer(l):map.removeLayer(l);const st=document.querySelector('#borderStatus');st.textContent=on?'ON':'OFF';st.classList.toggle('live',on);};

// vC10 — campo de vento: malha densa de setas (estática) + partículas animadas em canvas, sem azul.
map.createPane('windPane');map.getPane('windPane').style.zIndex=455;map.getPane('windPane').style.pointerEvents='none';
const arrCv=document.createElement('canvas'),windCv=document.createElement('canvas');
for(const c of [arrCv,windCv]){c.style.cssText='position:absolute;left:0;top:0;pointer-events:none;display:none';map.getPane('windPane').appendChild(c);}
let windEnabled=false,windRequest=0,wf=null,parts=[],windRaf=0,lat_u=null,lat_v=null,lw=0,lh=0,SU=0,SV=0;
const LSTEP=16, WK=.07, WCOL=['#e6eef2','#ffe28a','#ffb14a','#ff6a4a'];
const wBucket=sp=>sp<15?0:sp<30?1:sp<50?2:3;
function windAt(lat,lon){ // interpolação bilinear na grade geográfica (bordas travadas)
  const fx=Math.max(0,Math.min(wf.cols-1,(lon-wf.west)/(wf.east-wf.west)*(wf.cols-1))),fy=Math.max(0,Math.min(wf.rows-1,(lat-wf.south)/(wf.north-wf.south)*(wf.rows-1)));
  const x0=Math.min(wf.cols-2,Math.floor(fx)),y0=Math.min(wf.rows-2,Math.floor(fy)),tx=fx-x0,ty=fy-y0,k=(x,y)=>y*wf.cols+x,m=(a)=>(a[k(x0,y0)]*(1-tx)+a[k(x0+1,y0)]*tx)*(1-ty)+(a[k(x0,y0+1)]*(1-tx)+a[k(x0+1,y0+1)]*tx)*ty;
  return [m(wf.u),m(wf.v)];
}
function buildLattice(){ // campo em pixels da tela, amostrado a cada LSTEP px
  const s=map.getSize();lw=Math.ceil(s.x/LSTEP)+2;lh=Math.ceil(s.y/LSTEP)+2;lat_u=new Float32Array(lw*lh);lat_v=new Float32Array(lw*lh);
  for(let j=0;j<lh;j++)for(let i=0;i<lw;i++){const ll=map.containerPointToLatLng([i*LSTEP,j*LSTEP]),w=windAt(ll.lat,ll.lng);lat_u[j*lw+i]=w[0];lat_v[j*lw+i]=w[1];}
}
function sample(x,y){
  const fx=Math.max(0,Math.min(lw-2,x/LSTEP)),fy=Math.max(0,Math.min(lh-2,y/LSTEP)),i=fx|0,j=fy|0,tx=fx-i,ty=fy-j,a=j*lw+i,b=a+lw;
  SU=(lat_u[a]*(1-tx)+lat_u[a+1]*tx)*(1-ty)+(lat_u[b]*(1-tx)+lat_u[b+1]*tx)*ty;
  SV=(lat_v[a]*(1-tx)+lat_v[a+1]*tx)*(1-ty)+(lat_v[b]*(1-tx)+lat_v[b+1]*tx)*ty;
}
function drawArrows(){
  const ctx=arrCv.getContext('2d'),w=arrCv.width,h=arrCv.height,G=34;ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineWidth=1.2;ctx.globalAlpha=.6;
  for(let y=G/2;y<h;y+=G)for(let x=G/2;x<w;x+=G){
    sample(x,y);const sp=Math.hypot(SU,SV);if(sp<1)continue;const L=Math.min(22,7+sp*.3),a=Math.atan2(-SV,SU),dx=Math.cos(a)*L/2,dy=Math.sin(a)*L/2,hx=x+dx,hy=y+dy;
    ctx.strokeStyle=WCOL[wBucket(sp)];ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(hx,hy);
    ctx.moveTo(hx,hy);ctx.lineTo(hx-Math.cos(a-.5)*4,hy-Math.sin(a-.5)*4);ctx.moveTo(hx,hy);ctx.lineTo(hx-Math.cos(a+.5)*4,hy-Math.sin(a+.5)*4);ctx.stroke();
  }
}
function seedP(p){p.x=Math.random()*windCv.width;p.y=Math.random()*windCv.height;p.age=0;p.max=50+Math.random()*90;}
function windFrame(){
  if(!windEnabled||!wf)return;
  const ctx=windCv.getContext('2d'),w=windCv.width,h=windCv.height;
  ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='source-over';ctx.lineWidth=1.4;ctx.globalAlpha=.85;
  const segs=[[],[],[],[]];
  for(const p of parts){
    sample(p.x,p.y);const sp=Math.hypot(SU,SV);
    if(sp<.5||p.age++>p.max||p.x<0||p.y<0||p.x>w||p.y>h){seedP(p);continue;}
    const nx=p.x+SU*WK,ny=p.y-SV*WK;segs[wBucket(sp)].push(p.x,p.y,nx,ny);p.x=nx;p.y=ny;
  }
  segs.forEach((a,b)=>{if(!a.length)return;ctx.strokeStyle=WCOL[b];ctx.beginPath();for(let k=0;k<a.length;k+=4){ctx.moveTo(a[k],a[k+1]);ctx.lineTo(a[k+2],a[k+3]);}ctx.stroke();});
  windRaf=requestAnimationFrame(windFrame);
}
function placeWind(){
  const s=map.getSize();
  for(const c of [arrCv,windCv]){if(c.width!==s.x||c.height!==s.y){c.width=s.x;c.height=s.y;}L.DomUtil.setPosition(c,map.containerPointToLayerPoint([0,0]));c.style.display='block';c.style.opacity=1;}
  windCv.getContext('2d').clearRect(0,0,s.x,s.y);
  const n=Math.max(400,Math.min(1800,Math.round(s.x*s.y/900)));while(parts.length<n){const p={};seedP(p);parts.push(p);}parts.length=n;
  if(wf){buildLattice();drawArrows();cancelAnimationFrame(windRaf);windRaf=requestAnimationFrame(windFrame);}
}
async function refreshWind(){
  if(!windEnabled)return;const req=++windRequest,b=map.getBounds(),sz=map.getSize();
  const cols=Math.max(6,Math.min(14,Math.round(sz.x/90))),rows=Math.max(5,Math.min(10,Math.round(sz.y/90))),lats=[],lons=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){lats.push((b.getSouth()+y/(rows-1)*(b.getNorth()-b.getSouth())).toFixed(3));lons.push((b.getWest()+x/(cols-1)*(b.getEast()-b.getWest())).toFixed(3));}
  const st=document.querySelector('#windStatus');st.textContent='CARREGANDO';st.classList.remove('live');
  try{
    const r=await fetchT('https://api.open-meteo.com/v1/forecast?latitude='+lats.join(',')+'&longitude='+lons.join(',')+'&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh',15000);
    if(!r.ok)throw Error('HTTP '+r.status);const raw=await r.json();if(req!==windRequest||!windEnabled)return;
    const arr=Array.isArray(raw)?raw:[raw],u=[],v=[];
    arr.forEach(d=>{const c=d.current||{},s=Number(c.wind_speed_10m||0),a=Number(c.wind_direction_10m||0)*Math.PI/180;u.push(-s*Math.sin(a));v.push(-s*Math.cos(a));});
    wf={cols,rows,south:b.getSouth(),north:b.getNorth(),west:b.getWest(),east:b.getEast(),u,v};
    placeWind();st.textContent='LIVE';st.classList.add('live');
  }catch(err){console.warn('Vento:',err);st.textContent='ERRO';}
}
document.querySelector('#wind').onchange=e=>{
  windEnabled=e.target.checked;const st=document.querySelector('#windStatus');
  if(windEnabled){placeWind();refreshWind();}
  else{cancelAnimationFrame(windRaf);for(const c of [arrCv,windCv]){c.getContext('2d').clearRect(0,0,c.width,c.height);c.style.display='none';}st.textContent='OFF';st.classList.remove('live');}
};
map.on('zoomstart',()=>{if(windEnabled)for(const c of [arrCv,windCv])c.style.opacity=0;});
map.on('moveend resize',()=>{if(windEnabled&&wf)placeWind();});

// V7 — raios no próprio mapa. A API fornece pontos GeoJSON derivados do GOES-19 GLM/NOAA.
const lightningLayer=L.layerGroup(); let lightningEnabled=false,glmTimer=null,glmRequest=0;
function lightningIcon(age){
  const opacity=Math.max(.35,1-Number(age||0)/900);
  return L.divIcon({className:'',iconSize:[20,20],iconAnchor:[10,10],html:`<div class=\"lightning-marker\" style=\"opacity:${opacity.toFixed(2)}\">⚡</div>`});
}
async function refreshGlm(){
  if(!lightningEnabled)return; const req=++glmRequest,st=document.querySelector('#glmStatus'),b=map.getBounds();
  st.textContent='CARREGANDO';st.classList.remove('live');
  try{
    const bbox=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].map(v=>v.toFixed(3)).join(',');
    const url=`https://atmostorm.com/api/v1/lightning?minutes=15&bbox=${bbox}&limit=5000`;
    const r=await fetchT(url);if(!r.ok)throw Error('HTTP '+r.status);const gj=await r.json();if(req!==glmRequest)return;
    lightningLayer.clearLayers();let n=0;
    for(const f of (gj.features||[])){const c=f.geometry&&f.geometry.coordinates;if(!c||c.length<2)continue;const pr=f.properties||{};
      L.circleMarker([c[1],c[0]],{radius:4,weight:1,color:'#ffe066',fillColor:'#ffe066',fillOpacity:Math.max(.35,1-Number(pr.age_seconds||0)/900)}).bindTooltip(`Raio detectado pelo GOES-19<br>${Math.max(0,Math.round((pr.age_seconds||0)/60))} min atrás`).addTo(lightningLayer);n++;}
    st.textContent=n?`${n} · LIVE`:'SEM RAIOS';st.classList.add('live');
  }catch(err){console.warn('GLM:',err);st.textContent='SEM DADOS';st.classList.remove('live');}
}
function setGlm(on){lightningEnabled=on;if(on){lightningLayer.addTo(map);refreshGlm();clearInterval(glmTimer);glmTimer=setInterval(refreshGlm,60000);}else{map.removeLayer(lightningLayer);clearInterval(glmTimer);glmTimer=null;document.querySelector('#glmStatus').textContent='OFF';document.querySelector('#glmStatus').classList.remove('live');}}
document.querySelector('#lightning').onchange=e=>setGlm(e.target.checked);

// Próxima etapa: hotspots/FRP. A camada FireTemp já está pré-configurada, mas não é tratada como foco confirmado.
const FIRE_LAYER_CONFIG={provider:'NASA GIBS',wms:GIBS_WMS,layer:'GOES-East_ABI_FireTemp',enabled:false};
let irMoveTimer=null;map.on('moveend',()=>{if(windEnabled){clearTimeout(window._wm);window._wm=setTimeout(refreshWind,400);}if(infraredEnabled){clearTimeout(irMoveTimer);irMoveTimer=setTimeout(()=>buildInfrared(12-Number(timeline.value)),180);} });


// V7 — localização do usuário via API de geolocalização do navegador (somente após clique).
let userMarker=null,userAccuracy=null;
const locateBtn=document.querySelector('#locateMe');
locateBtn.onclick=()=>{
  if(!navigator.geolocation){locateBtn.textContent='LOCALIZAÇÃO NÃO SUPORTADA';return;}
  locateBtn.textContent='LOCALIZANDO…';
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude,lon=pos.coords.longitude,acc=pos.coords.accuracy||0;
    if(userMarker)map.removeLayer(userMarker);if(userAccuracy)map.removeLayer(userAccuracy);
    userAccuracy=L.circle([lat,lon],{radius:acc,color:'#4ab8ff',weight:1,fillColor:'#4ab8ff',fillOpacity:.06}).addTo(map);
    userMarker=L.marker([lat,lon],{zIndexOffset:1000,icon:L.divIcon({className:'',iconSize:[18,18],iconAnchor:[9,9],html:'<div class=\"user-location\"></div>'})}).bindTooltip('Você está aqui').addTo(map);
    map.flyTo([lat,lon],Math.max(map.getZoom(),9));locateBtn.textContent='● MINHA LOCALIZAÇÃO';locateBtn.classList.add('active');inspect(lat,lon);
  },err=>{locateBtn.textContent=err.code===1?'PERMISSÃO DE LOCALIZAÇÃO NEGADA':'NÃO FOI POSSÍVEL LOCALIZAR';},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
};
map.on('moveend',()=>{if(lightningEnabled){clearTimeout(window._gm);window._gm=setTimeout(refreshGlm,400);}});


// ========================= vC8 =========================
function fetchT(u,ms=10000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(u,{signal:c.signal}).finally(()=>clearTimeout(t));}
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Precipitação real (NASA GIBS / IMERG, observada; tem atraso de algumas horas).
map.createPane('rainPane');map.getPane('rainPane').style.zIndex=240;map.getPane('rainPane').style.pointerEvents='none';
const rainLayer=L.tileLayer.wms(GIBS_WMS,{layers:'IMERG_Precipitation_Rate',format:'image/png',transparent:true,opacity:.7,pane:'rainPane',attribution:'NASA GIBS / IMERG'}).addTo(map);

// Escala única de risco (heurística experimental, não é alerta oficial).
const LV=[
 {t:'BAIXO',c:'#5c7a8c',m:'Sem sinais fortes de tempestade.'},
 {t:'MODERADO',c:'#ffd34d',m:'Instabilidade: pancadas e raios possíveis.'},
 {t:'ALTO',c:'#ff9a3d',m:'Tempestade forte possível. Evite áreas abertas.'},
 {t:'MUITO ALTO',c:'#ff4d4d',m:'Risco de vento forte/granizo. Procure abrigo e siga a Defesa Civil.'}];
function riskAt(v){
  const {cape,gust,precip,li,cin,fz}=v; let l=0;
  if(cape>=800)l=1; if(cape>=1500||gust>=60)l=2; if(cape>=2500||gust>=80)l=3;
  if(l<3&&li!=null&&li<=-6&&cape>=1000)l++;          // instabilidade extrema
  if(l>0&&cin!=null&&Math.abs(cin)>200)l--;          // tampa forte inibe a convecção
  let n=0; if(cape>=1500)n++; if(cape>=2500)n++; if(li!=null&&li<=-6)n++; if(precip>=4)n++; if(fz!=null&&fz<4500&&cape>=1000)n++;
  return {l,hail:n>=4?'ALTO':n===3?'MODERADO':n>=1?'BAIXO':'MÍNIMO'};
}
function setRisk(L0){
  const b=document.querySelector('#civilRisk');b.textContent='RISCO '+L0.t;b.style.color=L0.c;
  b.nextElementSibling.textContent=L0.m+' Não substitui alertas oficiais.';
  const bar=document.querySelector('#riskBar');bar.textContent='RISCO '+L0.t+' — '+L0.m;bar.style.borderColor=bar.style.color=L0.c;bar.classList.add('on');
}

// Ponto selecionado: observação (-12h) + previsão (+12h) do Open-Meteo, ligada à timeline.
let pt=null;
async function inspect(lat,lon){
  const p=document.querySelector('#point');p.textContent='Carregando dados...';
  const hv='relative_humidity_2m,temperature_2m,precipitation,cloud_cover,wind_speed_10m,wind_gusts_10m,cape,lifted_index,convective_inhibition,freezing_level_height';
  try{
    const r=await fetchT(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hv}&past_hours=12&forecast_hours=13&wind_speed_unit=kmh&timezone=America%2FSao_Paulo`);
    if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();
    pt={lat,lon,h:d.hourly||{}};renderPoint();
  }catch(e){p.textContent='Falha ao consultar dados meteorológicos. '+e.message;}
}
function renderPoint(){
  if(!pt||!pt.h.time)return;
  const i=Math.min(Number(timeline.value),pt.h.time.length-1),g=k=>(pt.h[k]||[])[i],n=Number(timeline.value)-12;
  const v={cape:Number(g('cape')||0),gust:Number(g('wind_gusts_10m')||0),precip:Number(g('precipitation')||0),li:g('lifted_index'),cin:g('convective_inhibition'),fz:g('freezing_level_height')};
  const R=riskAt(v),L0=LV[R.l];
  document.querySelector('#point').innerHTML=`${pt.lat.toFixed(3)}, ${pt.lon.toFixed(3)} · ${n===0?'AGORA':n>0?'+'+n+' h':n+' h'}<br><br>TEMP ${g('temperature_2m')??'--'} °C<br>PRECIP ${v.precip} mm/h<br>UMIDADE ${g('relative_humidity_2m')??'--'} %<br>NUVENS ${g('cloud_cover')??'--'} %<br>VENTO ${g('wind_speed_10m')??'--'} km/h<br>RAJADA ${v.gust} km/h<br>CAPE ${v.cape} J/kg<br>LI ${v.li??'--'} · ISOTERMA 0° ${v.fz!=null?Math.round(v.fz):'--'} m<br><br>RISCO ${L0.t}<br>GRANIZO ${R.hail}<br>FOGO (CONDIÇÃO) ${fireWx(Number(g('relative_humidity_2m')),v.gust,v.precip,Number(g('temperature_2m')))}`;
  setRisk(L0);
  weatherLayer.clearLayers();stormLayer.clearLayers();hailLayer.clearLayers();
  L.circleMarker([pt.lat,pt.lon],{radius:5,weight:1,color:'#dce7ef',fillColor:'#37a8ff',fillOpacity:.9}).addTo(weatherLayer);
  if(R.l>0)L.circle([pt.lat,pt.lon],{radius:25000,color:L0.c,weight:1,fillColor:L0.c,fillOpacity:.12}).bindTooltip(L0.t).addTo(stormLayer);
  if(R.hail==='ALTO'||R.hail==='MODERADO')L.circle([pt.lat,pt.lon],{radius:12000,color:'#d35cff',dashArray:'4 4',weight:2,fillOpacity:0}).bindTooltip('Potencial de granizo: '+R.hail).addTo(hailLayer);
}

// Avisos oficiais do INMET (experimental: formato/CORS da API não verificados; falha com elegância).
async function loadAlerts(){
  const el=document.querySelector('#alerts'),link='<a href="https://alertas2.inmet.gov.br" target="_blank" rel="noopener">alertas2.inmet.gov.br</a>';
  try{
    const r=await fetchT('https://apiprevmet3.inmet.gov.br/avisos/ativos');if(!r.ok)throw Error('HTTP '+r.status);
    const j=await r.json(),arr=Array.isArray(j)?j:Object.values(j||{}).flatMap(x=>Array.isArray(x)?x:[]);
    const top=arr.slice(0,3).map(a=>'• '+esc(`${a.severidade||''} ${a.descricao||a.titulo||a.aviso_tipo||'aviso'}`.trim())).join('<br>');
    el.innerHTML=`<b>AVISOS INMET ATIVOS (BR): ${arr.length}</b>${top?'<br>'+top:''}<br>${link}`;
  }catch(e){el.innerHTML='Avisos INMET indisponíveis agora. '+link;}
}
loadAlerts();setInterval(loadAlerts,600000);

// Menu (mobile)
document.querySelector('#menuBtn').onclick=()=>document.querySelector('aside').classList.toggle('open');
map.on('click',()=>document.querySelector('aside').classList.remove('open'));


// ========================= vC9 — queimadas =========================
// Condição meteorológica favorável ao fogo (heurística simples; não indica foco ativo).
function fireWx(rh,gust,p,t){if(!isFinite(rh))return '--';let n=0;if(rh<30)n+=2;else if(rh<45)n++;if(gust>=35)n++;if(t>=30)n++;if(p>0.2)n=0;return n>=4?'MUITO ALTA':n>=3?'ALTA':n>=2?'MÉDIA':'BAIXA';}
// Focos de calor via NASA GIBS: VIIRS 375 m (S-NPP) + GOES-East FireTemp. Detecção térmica, não confirma incêndio.
map.createPane('firePane');map.getPane('firePane').style.zIndex=270;map.getPane('firePane').style.pointerEvents='none';
const fireVIIRS=L.tileLayer.wms(GIBS_WMS,{layers:'VIIRS_SNPP_Thermal_Anomalies_375m_All',format:'image/png',transparent:true,pane:'firePane',attribution:'NASA GIBS / VIIRS S-NPP'});
const fireGOES=L.tileLayer.wms(GIBS_WMS,{layers:FIRE_LAYER_CONFIG.layer,format:'image/png',transparent:true,opacity:.85,pane:'firePane',attribution:'NASA GIBS / GOES-East ABI'});
const fireLayer=L.layerGroup([fireVIIRS,fireGOES]);
const setFire=(t,live)=>{const el=document.querySelector('#fireStatus');el.textContent=t;el.classList.toggle('live',!!live);};
fireVIIRS.on('loading',()=>setFire('CARREGANDO…'));fireVIIRS.on('load',()=>setFire('ATIVO',true));fireVIIRS.on('tileerror',()=>setFire('SEM DADOS'));
document.querySelector('#fires').onchange=e=>{if(e.target.checked){fireLayer.addTo(map);setFire('CARREGANDO…');}else{map.removeLayer(fireLayer);setFire('OFF');}};


// ========================= vC11 — legenda contextual =========================
// Mostra só o que está ativo no mapa; cores e limites vêm das mesmas constantes usadas nas camadas.
const lgOn=id=>{const el=document.querySelector('#'+id);return !!(el&&el.checked);};
const lgRow=(c,t,sm='')=>`<div class="row"><span class="sw" style="background:${c}"></span>${t}${sm?`<small>${sm}</small>`:''}</div>`;
const lgSec=(t,em,body,note='')=>`<div class="lg"><h4>${t}${em?`<em>${em}</em>`:''}</h4>${body}${note?`<p>${note}</p>`:''}</div>`;
function renderLegend(){
  const risk=['','CAPE ≥ 800','CAPE ≥ 1500 · rajada ≥ 60','CAPE ≥ 2500 · rajada ≥ 80'];
  const S=[lgSec('RISCO NO PONTO','clique no mapa',LV.map((l,i)=>lgRow(l.c,l.t,risk[i])).join(''),'Ajustado por índice de instabilidade (LI) e inibição (CIN). Vale para a hora da timeline.')];
  if(lgOn('ir'))S.push(lgSec('NÚCLEOS FRIOS (IR)','área do núcleo',lgRow('#ffd34d','Convectiva','150+ km²')+lgRow('#ff9a3d','Forte','840+ km²')+lgRow('#ff4d4d','Severa','2.300+ km²'),'Na imagem IR, amarelo → vermelho indicam topos de nuvem mais frios. Detecção experimental.'));
  if(lgOn('hail'))S.push(lgSec('GRANIZO','',`<div class="row"><span class="sw ring"></span>Potencial de granizo<small>moderado / alto</small></div>`));
  if(lgOn('wind'))S.push(lgSec('VENTO (10 m)','km/h',`<div class="bar"></div><div class="ticks"><span>0</span><span>15</span><span>30</span><span>50+</span></div>`,'Setas e partículas seguem para onde o vento sopra.'));
  if(lgOn('rain'))S.push(lgSec('CHUVA (IMERG)','',lgRow('#7fb2ff','Precipitação observada'),'NASA IMERG, com atraso de algumas horas. As cores seguem a escala do produto.'));
  if(lgOn('fires'))S.push(lgSec('QUEIMADAS','',lgRow('#ff5a1f','Foco de calor','VIIRS · GOES'),'Detecção térmica por satélite; não confirma incêndio.'));
  if(lgOn('lightning'))S.push(lgSec('RAIOS (GLM)','',lgRow('#ffe066','Descarga detectada','últimos 15 min'),'Mais opaco = mais recente.'));
  if(lgOn('reports'))S.push(lgSec('RELATOS','comunidade',lgRow('#43df86','Ajuda ou serviço disponível')+lgRow('#ffb14a','Necessidade ou serviço faltando')+lgRow('#ff4d4d','Perigo (árvore, poste ou fio)'),'Enviados por usuários, não verificados. Expiram sozinhos (12–48 h).'));
  if(lgOn('sat'))S.push(lgSec('SATÉLITE','',`<p style="margin:0">GOES-19 GeoColor: cor real de dia e infravermelho à noite.</p>`));
  if(locateBtn.classList.contains('active'))S.push(lgSec('LOCALIZAÇÃO','',lgRow('#4ab8ff','Você está aqui')));
  document.querySelector('#legendBox').innerHTML=S.join('');
}
document.querySelector('aside').addEventListener('change',renderLegend);
new MutationObserver(renderLegend).observe(locateBtn,{attributes:true,attributeFilter:['class']});
renderLegend();


// ========================= vC12 — relatos da comunidade =========================
// Relatos compartilhados via Supabase (config.js). Sem configuração, ficam só neste aparelho (localStorage).
const CFG=window.MONI_CONFIG||{},SB_ON=!!(CFG.supabaseUrl&&CFG.supabaseKey);
const sbFetch=(path,opt={})=>fetch(CFG.supabaseUrl+'/rest/v1/'+path,{...opt,headers:{apikey:CFG.supabaseKey,...(CFG.supabaseKey.startsWith('eyJ')?{Authorization:'Bearer '+CFG.supabaseKey}:{}),'Content-Type':'application/json',...(opt.headers||{})}});
const RT=[
 {k:'shelter',e:'🏠',t:'Abrigo',c:'#43df86',g:'ajuda'},
 {k:'collect',e:'📦',t:'Arrecadação de mantimentos',c:'#43df86',g:'ajuda'},
 {k:'distrib',e:'🍞',t:'Distribuição de mantimentos',c:'#43df86',g:'ajuda'},
 {k:'tarp_have',e:'⛺',t:'Lonas disponíveis',c:'#43df86',g:'ajuda'},
 {k:'tarp_need',e:'🏚️',t:'Precisa de lona',c:'#ffb14a',g:'necessidade'},
 {k:'tree',e:'🌳',t:'Árvore caída',c:'#ff4d4d',g:'perigo'},
 {k:'wire',e:'⚡',t:'Poste / fio caído',c:'#ff4d4d',g:'perigo'},
 {k:'power_on',e:'💡',t:'Com energia',c:'#43df86',g:'servico'},
 {k:'power_off',e:'🔌',t:'Sem energia',c:'#ffb14a',g:'servico'},
 {k:'water_on',e:'🚰',t:'Com água',c:'#43df86',g:'servico'},
 {k:'water_off',e:'🚱',t:'Sem água',c:'#ffb14a',g:'servico'}];
const RTTL={ajuda:48,necessidade:24,perigo:12,servico:12}; // validade em horas
const $=q=>document.querySelector(q), rType=k=>RT.find(t=>t.k===k);
const LSg=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}}, LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let reports=LSg('moni.reports',[]),myVotes=LSg('moni.votes',{}),rSel=null,lastSend=0;
const rLayer=L.layerGroup().addTo(map);
const rAlive=r=>{const t=rType(r.k);return !!t&&Date.now()-r.ts<RTTL[t.g]*36e5&&(r.gone||0)<3;};
const ago=ts=>{const m=Math.round((Date.now()-ts)/6e4);return m<1?'agora':m<60?`há ${m} min`:`há ${Math.round(m/60)} h`;};
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,3500);}
function drawReports(){
  rLayer.clearLayers();reports=reports.filter(rAlive);LSs('moni.reports',reports);
  for(const r of reports){const t=rType(r.k);
    const mk=L.marker([r.lat,r.lon],{icon:L.divIcon({className:'',iconSize:[30,30],iconAnchor:[15,15],html:`<div class="rp" style="border-color:${t.c}">${t.e}</div>`})});
    mk.bindPopup(`<b>${t.e} ${esc(t.t)}</b><br><small>${ago(r.ts)} · ✔ ${r.ok||0} · ✖ ${r.gone||0}</small>${r.note?`<p>${esc(r.note)}</p>`:''}${t.k==='wire'?'<p class="rp-warn">Perigo: mantenha distância e avise a concessionária e a Defesa Civil (199).</p>':''}<div class="rp-btns"><button data-v="ok">✔ Ainda vale</button><button data-v="gone">✖ Não está mais</button></div>`);
    mk.on('popupopen',e=>e.popup.getElement().querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>vote(r.id,b.dataset.v)));
    mk.addTo(rLayer);}
}
function vote(id,v){
  if(myVotes[id])return toast('Você já votou neste relato.');
  const r=reports.find(x=>x.id===id);if(!r)return;
  r[v]=(r[v]||0)+1;myVotes[id]=v;LSs('moni.votes',myVotes);
  if(SB_ON)sbFetch('rpc/vote_report',{method:'POST',body:JSON.stringify({rid:id,v})}).catch(()=>{});
  drawReports();map.closePopup();toast('Obrigado pelo voto.');
}
async function submitReport(lat,lon){
  if(!rSel)return toast('Escolha o tipo de relato.');
  if(Date.now()-lastSend<30000)return toast('Aguarde alguns segundos antes de enviar outro relato.');
  const r={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),k:rSel,lat:+lat.toFixed(rType(rSel).g==='ajuda'?4:3),lon:+lon.toFixed(rType(rSel).g==='ajuda'?4:3),note:$('#rsNote').value.trim().slice(0,140),ts:Date.now(),ok:0,gone:0};
  lastSend=Date.now();reports.push(r);LSs('moni.reports',reports);
  let msg='Relato salvo apenas neste aparelho.';
  if(SB_ON){r.local=true;
    try{const x=await sbFetch('reports?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({k:r.k,lat:r.lat,lon:r.lon,note:r.note})});
      if(x.ok){const j=await x.json();if(j[0]&&j[0].id)r.id=j[0].id;delete r.local;msg='Relato enviado. Obrigado!';}
      else{const er=await x.json().catch(()=>({}));msg=/limite/i.test(er.message||'')?'Limite de relatos atingido. Tente mais tarde.':'Não foi possível enviar; relato salvo só neste aparelho.';}
    }catch(e){msg='Sem conexão: relato salvo só neste aparelho.';}
    LSs('moni.reports',reports);}
  $('#reportSheet').hidden=true;drawReports();pullReports();map.flyTo([r.lat,r.lon],Math.max(map.getZoom(),13));toast(msg);
}
const setRep=(t,ok)=>{const el=$('#repStatus');if(el){el.textContent=t;el.classList.toggle('live',!!ok);}};
async function pullReports(){
  if(!SB_ON){setRep('LOCAL');return;}
  try{
    const since=new Date(Date.now()-48*36e5).toISOString();
    const x=await sbFetch(`reports?select=id,k,lat,lon,note,ok,gone,ts&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=500`);
    if(!x.ok){const er=await x.json().catch(()=>({}));console.warn('Relatos:',x.status,er);setRep('ERRO '+x.status);
      if(!window._repErr){window._repErr=1;toast('Relatos: erro '+x.status+(er.message?' — '+er.message:''));}return;}
    const remote=await x.json();
    reports=remote.map(r=>({...r,ts:Date.parse(r.ts)})).concat(reports.filter(l=>l.local));
    drawReports();setRep(remote.length+' · OK',true);
  }catch(e){console.warn('Relatos:',e);setRep('SEM REDE');}
}
// UI
$('#rsGrid').innerHTML=RT.map(t=>`<button data-k="${t.k}" style="--c:${t.c}"><span>${t.e}</span>${esc(t.t)}</button>`).join('');
$('#rsGrid').onclick=e=>{const b=e.target.closest('button');if(!b)return;rSel=b.dataset.k;[...$('#rsGrid').children].forEach(x=>x.classList.toggle('sel',x===b));$('#rsWarn').textContent=rSel==='wire'?'Não se aproxime do fio. Avise a concessionária de energia e a Defesa Civil (199).':'';};
$('#reportFab').onclick=()=>{rSel=null;[...$('#rsGrid').children].forEach(x=>x.classList.remove('sel'));$('#rsNote').value='';$('#rsWarn').textContent='';$('#reportSheet').hidden=false;};
const closeSheet=()=>{$('#reportSheet').hidden=true;};
$('#rsClose').onclick=closeSheet;$('.rs-back').onclick=closeSheet;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});
$('#rsGps').onclick=()=>{
  if(!rSel)return toast('Escolha o tipo de relato primeiro.');
  if(!navigator.geolocation)return toast('Localização não suportada neste navegador.');
  navigator.geolocation.getCurrentPosition(p=>submitReport(p.coords.latitude,p.coords.longitude),()=>toast('Não foi possível obter sua localização.'),{enableHighAccuracy:true,timeout:12000});
};
const endPick=()=>{window._pickMode=false;$('#pickHint').hidden=true;};
$('#rsPick').onclick=()=>{if(!rSel)return toast('Escolha o tipo de relato primeiro.');closeSheet();window._pickMode=true;$('#pickHint').hidden=false;};
$('#pickCancel').onclick=()=>{endPick();$('#reportSheet').hidden=false;};
map.on('click',e=>{if(!window._pickMode)return;endPick();submitReport(e.latlng.lat,e.latlng.lng);});
$('#reports').onchange=e=>e.target.checked?rLayer.addTo(map):map.removeLayer(rLayer);
drawReports();pullReports();setInterval(()=>{drawReports();pullReports();},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pullReports();});
