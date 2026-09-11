// Only enable behind Umbrel's authenticated app_proxy, never a public port.
export function admitUmbrelRequest(req) {
  const deny = {ok:false,status:403,error:'Same-origin Umbrel request required'};
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!host || /[\s/?#@]/.test(host)) return deny;
  if (req.headers['sec-fetch-site'] === 'cross-site') return deny;
  if (req.method !== 'GET' && !origin) return deny;
  if (origin) {
    try {
      const url = new URL(origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.host !== host || url.origin !== origin) return deny;
    } catch { return deny; }
  }
  if (req.method === 'POST' && !String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json'))
    return {ok:false,status:415,error:'Content-Type must be application/json'};
  return {ok:true};
}
