// Hauteur de chaque section de l'accueil comparée à l'écran utile, et captures section par section (1440 × 800).
// Usage : node outils/mesurer.mjs http://127.0.0.1:8767/ [dossier-captures]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chrome } from './chrome.mjs';
const URL0 = process.argv[2], OUT = process.argv[3];
const c = await chrome();
await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
for (const [w, h] of [[1440, 800], [1280, 720], [1920, 1000]]) {
  await c.go(URL0, w, h);
  const r = JSON.parse(await c.ev(`(()=>{const mh=document.querySelector('.masthead').offsetHeight;
    const secs=[...document.querySelectorAll('main > section, main > aside')].map(s=>{const cs=getComputedStyle(s);const inner=s.offsetHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);return (s.id||s.className.split(' ')[0])+':'+s.offsetHeight+'/'+Math.round(inner)});
    return JSON.stringify({avail:innerHeight-mh, art:Math.round(document.querySelector('.hero__art img').getBoundingClientRect().bottom), secs})})()`));
  console.log(`${w}x${h} utile=${r.avail} bas-ordinateur-hero=${r.art}\n  ${r.secs.join('  ')}`);
  if (OUT && w === 1440) {
    mkdirSync(OUT, { recursive: true });
    const n = await c.ev(`document.querySelectorAll('main > section, main > aside').length`);
    for (let k = 0; k < n; k++) {
      const id = await c.ev(`(()=>{const s=document.querySelectorAll('main > section, main > aside')[${k}];scrollTo(0,s.getBoundingClientRect().top+scrollY-document.querySelector('.masthead').offsetHeight+1);return s.id||s.className.split(' ')[0]})()`);
      await new Promise(r => setTimeout(r, 300));
      const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }); writeFileSync(join(OUT, `${k}-${id}.jpg`), Buffer.from(s.data, 'base64'));
    }
  }
}
c.close();
