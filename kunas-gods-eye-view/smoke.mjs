import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
// Node fetch may replace Host; raw HTTP preserves the proxy authority in CI.
function fetch(url, options={}) {
 return new Promise((resolve,reject) => {
  const req=http.request(url,options,res=>{
   const chunks=[]; res.on('data',chunk=>chunks.push(chunk));
   res.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers:res.headers})));
  });
  req.on('error',reject); if(options.body) req.write(options.body); req.end();
 });
}
const base='http://127.0.0.1:4173';
// Simulate the real Umbrel proxy: non-loopback authority and forwarding headers.
const proxyHeaders={host:'umbrel.local:28107','x-forwarded-for':'192.168.1.50','x-forwarded-proto':'http'};
async function ready(){
 for(let i=0;i<90;i++){
  try { const r=await fetch(base+'/api/setup/status',{headers:proxyHeaders}); if(r.ok) return await r.json(); } catch {}
  await new Promise(r=>setTimeout(r,1000));
 }
 throw new Error('runtime did not become ready');
}
const status=await ready();
const phase=process.argv[2] || 'save';
const key=()=>status.keys.find(k=>k.id==='cesium-ion');
const headers={...proxyHeaders,'content-type':'application/json',origin:'http://umbrel.local:28107'};
if(phase==='save'){
 for(const path of ['/','/src/main.js','/cesium/Cesium.js','/cesium/Widgets/widgets.css','/models/airplane.glb']){
  const r=await fetch(base+path); assert.equal(r.status,200,path); assert.ok((await r.arrayBuffer()).byteLength>100,path);
 }
 for(const path of ['/.env','/%2eenv','/.env.local','/@fs/data/config/.env','/.gev-cache/test']){
  const r=await fetch(base+path); assert.ok([403,404].includes(r.status),path);
 }
 for(const origin of [null,'https://evil.example']){
  const r=await fetch(base+'/api/setup/keys',{method:'POST',headers:{...proxyHeaders,'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify({CESIUM_ION_TOKEN:'ci-not-a-real-key'})});
  assert.equal(r.status,403);
 }
 const r=await fetch(base+'/api/setup/keys',{method:'POST',headers,body:JSON.stringify({CESIUM_ION_TOKEN:'ci-not-a-real-key'})});
 assert.equal(r.status,200,await r.text());
 assert.match(fs.readFileSync('/data/config/.env','utf8'),/ci-not-a-real-key/);
 assert.equal(fs.statSync('/data/config/.env').mode & 0o777,0o600);
 for(const path of ['/.env','/@fs/data/config/.env']) {
  const r=await fetch(base+path,{headers:proxyHeaders}); assert.equal(r.status,403,path); assert.ok(!(await r.text()).includes('ci-not-a-real-key'));
 }
 console.log('PASS UI, Cesium/model assets, credential denial, same-origin save, 0600 persisted file');
}else{
 assert.equal(key().set,true); assert.equal(key().managed,'file');
 const r=await fetch(base+'/api/setup/keys',{method:'POST',headers,body:JSON.stringify({CESIUM_ION_TOKEN:null})});
 assert.equal(r.status,200,await r.text());
 assert.ok(!fs.readFileSync('/data/config/.env','utf8').includes('ci-not-a-real-key'));
 console.log('PASS saved key survives container restart; removal persists');
}
