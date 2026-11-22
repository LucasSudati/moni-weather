// MONI Earth — visualização terrestre 3D independente das camadas Leaflet.
// O mapa meteorológico 2D permanece disponível pelo alternador da interface.
(function(){
  const container=document.getElementById('earth3dMap');
  const host=document.getElementById('map');
  const toggle=document.getElementById('earthModeToggle');
  if(!container||!host||!toggle)return;
  let earth=null,ready=false,mode='globe';

  function setMode(next){
    mode=next;
    host.classList.toggle('globe-mode',mode==='globe');
    toggle.textContent=mode==='globe'?'GLOBO 3D · VER 2D':'MAPA 2D · VER GLOBO';
    toggle.setAttribute('aria-pressed',String(mode==='globe'));
    if(earth&&mode==='globe')requestAnimationFrame(()=>earth.resize());
    window.dispatchEvent(new CustomEvent('moni:map-mode',{detail:{mode}}));
  }
  function initialize(){
    if(ready||!window.maplibregl)return;
    ready=true;
    try{
      earth=new window.maplibregl.Map({
        container,
        style:'https://tiles.openfreemap.org/styles/liberty',
        center:[-54.87,-29.19],
        zoom:1.65,
        pitch:18,
        bearing:0,
        attributionControl:true,
        canvasContextAttributes:{antialias:true}
      });
      earth.addControl(new window.maplibregl.NavigationControl({visualizePitch:true}),'top-right');
      earth.on('style.load',()=>{
        try{
          earth.setProjection({type:'globe'});
          earth.setFog({
            color:'rgb(8, 15, 27)',
            'high-color':'rgb(25, 72, 112)',
            'horizon-blend':0.12,
            'space-color':'rgb(3, 7, 15)',
            'star-intensity':0.18
          });
        }catch(error){console.warn('[MONI Earth] Projeção/fog indisponível:',error);}
      });
      earth.on('error',event=>console.warn('[MONI Earth] Falha ao carregar mapa:',event.error||event));
      setMode('globe');
    }catch(error){
      console.error('[MONI Earth] Não foi possível inicializar o globo:',error);
      setMode('2d');
      toggle.textContent='GLOBO INDISPONÍVEL · MAPA 2D';
    }
  }
  toggle.addEventListener('click',()=>setMode(mode==='globe'?'2d':'globe'));
  window.addEventListener('moni:maplibre-ready',initialize,{once:true});
  if(window.maplibregl)initialize();
  // O estado inicial é o globo; a interface 2D continua pronta por baixo.
  setMode('globe');
})();