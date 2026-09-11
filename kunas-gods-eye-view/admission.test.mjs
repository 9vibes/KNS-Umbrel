import {test} from 'node:test';
import assert from 'node:assert/strict';
import {admitUmbrelRequest as admit} from './umbrel-admission.mjs';
const request = (method, headers={}) => ({method,headers:{host:'umbrel.local:28107',...headers}});
test('authenticated proxy GET and same-origin JSON POST',()=>{
 assert.equal(admit(request('GET')).ok,true);
 for(const scheme of ['http','https']) assert.equal(admit(request('POST',{origin:`${scheme}://umbrel.local:28107`,'content-type':'application/json'})).ok,true);
});
test('refuse cross-site, missing origin, forged authorities and non-JSON',()=>{
 for(const origin of [undefined,'null','https://evil.example','http://umbrel.local:28107.evil.example','http://umbrel.local:28107/','http://user@umbrel.local:28107','http://umbrel.local:28107?x']) assert.equal(admit(request('POST',{origin,'content-type':'application/json'})).ok,false);
 assert.equal(admit(request('GET',{'sec-fetch-site':'cross-site'})).ok,false);
 assert.equal(admit(request('GET',{host:'evil/path'})).ok,false);
 assert.equal(admit(request('POST',{origin:'http://umbrel.local:28107','content-type':'text/plain'})).status,415);
});
