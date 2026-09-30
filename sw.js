const CACHE='moni-v5.5-meteocons';
const SHELL=['./','./index.html','./style.css','./app.js','./config.js','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?.text()||''}}e.waitUntil(self.registration.showNotification(d.title||'MONI Weather',{body:d.body||'Novo alerta disponível.',tag:d.tag||'moni-push',icon:d.icon||'https://cdn.jsdelivr.net/gh/basmilius/weather-icons@2.0.0/production/fill/all/thunderstorms-day-rain.svg',data:{url:d.url||'./'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data?.url||'./'));});
