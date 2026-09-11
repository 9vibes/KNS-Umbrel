from pathlib import Path
p=Path('vite.config.js')
s=p.read_text()
changes={
"import fs from 'node:fs';":"import { admitUmbrelRequest, privateDataGuard } from './umbrel-admission.mjs';\nimport fs from 'node:fs';",
"    plugins: [":"    plugins: [privateDataGuard(),",
"const storePath = () => path.join(__dirname, ...(pinokioManaged() ? ['pinokio', 'ENVIRONMENT'] : ['.env']));":"const storePath = () => path.join('/data/config', '.env');",
"const admit = (req) => admitKeySetupRequest({":"const admit = (req) => process.env.GEV_UMBREL === '1' ? admitUmbrelRequest(req) : admitKeySetupRequest({",
"const loaded = loadEnv(mode, __dirname, '');":"const loaded = loadEnv(mode, '/data/config', '');",
}
for old,new in changes.items():
 assert s.count(old)==1, old
 s=s.replace(old,new)
p.write_text(s)
