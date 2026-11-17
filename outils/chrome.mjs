// Petit client Chrome headless (CDP) sans dépendance, partagé par les scripts de vérification.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export async function chrome() {
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'trame-chrome-'))}`, `--remote-debugging-port=${port}`, 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.length) break; } catch {} await new Promise(r => setTimeout(r, 200)); }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(); const c = { errs: [], reqs: [], bad: [], onLoad: null };
  ws.addEventListener('message', e => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    if (m.method === 'Page.loadEventFired' && c.onLoad) c.onLoad();
    if (m.method === 'Runtime.exceptionThrown') c.errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') c.errs.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
    if (m.method === 'Network.requestWillBeSent') c.reqs.push(m.params.request.url);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) c.bad.push(m.params.response.status + ' ' + m.params.response.url); });
  c.send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  c.ev = async e => { const r = await c.send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  c.go = async (url, w, h, mob = false) => { await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob }); await new Promise(r => { c.onLoad = r; c.send('Page.navigate', { url }); }); await c.ev('document.fonts.ready.then(()=>1)'); await new Promise(r => setTimeout(r, 400)); };
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
  c.close = () => { ws.close(); proc.kill(); };
  return c;
}
