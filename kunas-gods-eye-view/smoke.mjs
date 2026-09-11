import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:4173';
async function ready(){
 for(let i=0;i<90;i++){
  try { const r=await fetch(base+'/api/setup/status'); if(r.ok) return await r.json(); } catch {}
  await new Promise(r=>setTimeout(r,1000));
 }
 throw new Error('runtime did not become ready');
}
const status=await ready();
const phase=process.argv[2] || 'save';
const key=()=>status.keys.find(k=>k.id==='cesium-ion');
const headers={'content-type':'application/json',origin:base};
if(phase==='save'){
 for(const path of ['/','/src/main.js','/cesium/Cesium.js','/cesium/Widgets/widgets.css','/models/airplane.glb']){
  const r=await fetch(base+path); assert.equal(r.status,200,path); assert.ok((await r.arrayBuffer()).byteLength>100,path);
 }
 for(const path of ['/.env','/@fs/data/config/.env']){
  const r=await fetch(base+path); assert.ok([403,404].includes(r.status),path);
 }
 for(const origin of [null,'https://evil.example']){
  const r=await fetch(base+'/api/setup/keys',{method:'POST',headers:{'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify({CESIUM_ION_TOKEN:'ci-not-a-real-key'})});
  assert.equal(r.status,403);
 }
 const r=await fetch(base+'/api/setup/keys',{method:'POST',headers,body:JSON.stringify({CESIUM_ION_TOKEN:'ci-not-a-real-key'})});
 assert.equal(r.status,200,await r.text());
 assert.match(fs.readFileSync('/data/config/.env','utf8'),/ci-not-a-real-key/);
 assert.equal(fs.statSync('/data/config/.env').mode & 0o777,0o600);
 console.log('PASS UI, Cesium/model assets, credential denial, same-origin save, 0600 persisted file');
}else{
 assert.equal(key().set,true); assert.equal(key().managed,'file');
 const r=await fetch(base+'/api/setup/keys',{method:'POST',headers,body:JSON.stringify({CESIUM_ION_TOKEN:null})});
 assert.equal(r.status,200,await r.text());
 assert.ok(!fs.readFileSync('/data/config/.env','utf8').includes('ci-not-a-real-key'));
 console.log('PASS saved key survives container restart; removal persists');
}
