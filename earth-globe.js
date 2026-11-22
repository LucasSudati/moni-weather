// MONI Earth — ponte geoespacial compartilhada entre as camadas meteorológicas e o globo.
(function(){
  const container=document.getElementById('earth3dMap');
  const host=document.getElementById('map');
  const toggle=document.getElementById('earthModeToggle');
  if(!container||!host||!toggle)return;
  let earth=null,ready=false,mode='globe';
  const imageSets=new Map();
  const rasterSets=new Map();

  function setMode(next){
    mode=next;
    host.classList.toggle('globe-mode',mode==='globe');
    toggle.textContent=mode==='globe'?'GLOBO 3D · VER 2D':'MAPA 2D · VER GLOBO';
    toggle.setAttribute('aria-pressed',String(mode==='globe'));
    if(earth&&mode==='globe')requestAnimationFrame(()=>earth.resize());
    if(window.L&&window.moniMap)requestAnimationFrame(()=>window.moniMap.invalidateSize());
    window.dispatchEvent(new CustomEvent('moni:map-mode',{detail:{mode}}));
  }
  function wmsUrl(layer,time){
    const p=new URLSearchParams({SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetMap',LAYERS:layer,STYLES:'',FORMAT:'image/png',TRANSPARENT:'true',SRS:'EPSG:4326',WIDTH:'2048',HEIGHT:'1024',BBOX:'-180,-90,180,90'});
    if(time)p.set('TIME',time);
    p.set('_moni',String(Date.now()));
    return 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'+p.toString();
  }
  function setWms(id,layer,visible,opacity,time,attribution){
    rasterSets.set(id,{layer,visible,opacity,time,attribution});
    if(!earth||!earth.isStyleLoaded())return;
    const sourceId='moni-src-'+id,layerId='moni-layer-'+id;
    try{
      if(earth.getLayer(layerId))earth.removeLayer(layerId);
      if(earth.getSource(sourceId))earth.removeSource(sourceId);
      earth.addSource(sourceId,{type:'image',url:wmsUrl(layer,time),coordinates:[[-180,90],[180,90],[180,-90],[-180,-90]]});
      earth.addLayer({id:layerId,type:'raster',source:sourceId,layout:{visibility:visible?'visible':'none'},paint:{'raster-opacity':opacity,'raster-fade-duration':0}});
      console.info('[MONI Earth] Camada WMS adicionada:',id,layer);
    }catch(error){console.warn('[MONI Earth] WMS '+id,error);}
  }
  function setVisible(id,visible){
    const layerId='moni-layer-'+id,entry=rasterSets.get(id);
    if(entry)entry.visible=visible;
    if(earth&&earth.getLayer(layerId))earth.setLayoutProperty(layerId,'visibility',visible?'visible':'none');
    const set=imageSets.get(id);if(set)set.visible=visible;
    if(set)renderImages(id);
  }
  function setOpacity(id,opacity){
    const layerId='moni-layer-'+id,entry=rasterSets.get(id);
    if(entry)entry.opacity=opacity;
    if(earth&&earth.getLayer(layerId))earth.setPaintProperty(layerId,'raster-opacity',opacity);
    const set=imageSets.get(id);if(set){set.opacity=opacity;renderImages(id);}
  }
  function clearImages(id){
    const set=imageSets.get(id);if(!set)return;
    set.ids.forEach((key)=>{const lid='moni-image-layer-'+key,sid='moni-image-src-'+key;if(earth?.getLayer(lid))earth.removeLayer(lid);if(earth?.getSource(sid))earth.removeSource(sid);});
    imageSets.delete(id);
  }
  function renderImages(id){
    const set=imageSets.get(id);if(!earth||!earth.isStyleLoaded()||!set)return;
    set.ids.forEach((key)=>{const lid='moni-image-layer-'+key,sid='moni-image-src-'+key;if(earth.getLayer(lid))earth.removeLayer(lid);if(earth.getSource(sid))earth.removeSource(sid);});
    set.ids=[];
    if(!set.visible)return;
    set.images.forEach((im,index)=>{
      const b=im?.bounds;if(!im?.image||!b)return;
      const south=Number(b.south),west=Number(b.west),north=Number(b.north),east=Number(b.east);
      if(![south,west,north,east].every(Number.isFinite)||south>=north||west>=east)return;
      const key=id.replace(/[^a-z0-9]/gi,'-')+'-'+index+'-'+Date.now().toString(36);
      const sid='moni-image-src-'+key,lid='moni-image-layer-'+key;
      try{
        earth.addSource(sid,{type:'image',url:im.image,coordinates:[[west,north],[east,north],[east,south],[west,south]]});
        earth.addLayer({id:lid,type:'raster',source:sid,paint:{'raster-opacity':set.opacity,'raster-fade-duration':0}});
        set.ids.push(key);
      }catch(error){console.warn('[MONI Earth] Imagem '+id,error);}
    });
  }
  function setImages(id,images,opacity,attribution){
    clearImages(id);
    imageSets.set(id,{images:Array.isArray(images)?images:[],opacity,attribution,visible:true,ids:[]});
    renderImages(id);
  }
  function initialize(){
    if(ready||!window.maplibregl)return;
    ready=true;
    try{
      earth=new window.maplibregl.Map({container,style:'https://tiles.openfreemap.org/styles/liberty',center:[-54.87,-29.19],zoom:1.65,pitch:18,bearing:0,attributionControl:true,canvasContextAttributes:{antialias:true}});
      earth.addControl(new window.maplibregl.NavigationControl({visualizePitch:true}),'top-right');
      earth.on('style.load',()=>{
        try{
          earth.setProjection({type:'globe'});
          earth.setFog({color:'rgb(8, 15, 27)','high-color':'rgb(25, 72, 112)','horizon-blend':0.12,'space-color':'rgb(3, 7, 15)','star-intensity':0.18});
        }catch(error){console.warn('[MONI Earth] Projeção/fog:',error);}
        rasterSets.forEach((v,id)=>setWms(id,v.layer,v.visible,v.opacity,v.time,v.attribution));
        imageSets.forEach((v,id)=>renderImages(id));
        window.dispatchEvent(new CustomEvent('moni:earth-ready'));
      });
      earth.on('error',event=>console.warn('[MONI Earth] Mapa:',event.error||event));
      setMode('globe');
    }catch(error){console.error('[MONI Earth] Inicialização:',error);setMode('2d');}
  }
  window.MONIEarth={setWms,setVisible,setOpacity,setImages,clearImages,getMap:()=>earth};
  toggle.addEventListener('click',()=>setMode(mode==='globe'?'2d':'globe'));
  window.addEventListener('moni:maplibre-ready',initialize,{once:true});
  if(window.maplibregl)initialize();
  setMode('globe');
})();