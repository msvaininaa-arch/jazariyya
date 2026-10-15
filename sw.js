// يحفظ الموقع وصوته على الجهاز ليعمل بلا إنترنت
const V='jazariyya-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const AUDIO=['audio/r1.mp3','audio/r2.mp3','audio/r3.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
  // الصوت يُحفظ في الخلفية دون أن يؤخر فتح الموقع
  caches.open(V).then(c=>Promise.all(AUDIO.map(u=>c.match(u).then(m=>m||fetch(u).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function ranged(req,res){const h=req.headers.get('range');if(!h)return res;const buf=await res.arrayBuffer();const m=/bytes=(\d*)-(\d*)/.exec(h);
 let s=m&&m[1]?+m[1]:0,e=m&&m[2]?+m[2]:buf.byteLength-1;e=Math.min(e,buf.byteLength-1);
 return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':`bytes ${s}-${e}/${buf.byteLength}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 if(u.origin===location.origin&&u.pathname.endsWith('.mp3')){e.respondWith(caches.open(V).then(async c=>{const key=u.pathname.slice(u.pathname.indexOf('audio/'));const m=await c.match(key);if(m)return ranged(e.request,m.clone());return fetch(e.request)}));return}
 if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('index.html'))));return}
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.open(V).then(async c=>{const m=await c.match(e.request);if(m)return m;try{const r=await fetch(e.request);c.put(e.request,r.clone());return r}catch(_){return m}}))}});
