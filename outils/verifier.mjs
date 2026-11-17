// Vérification du site : débordement, hero, visuels, interactions, requêtes externes, erreurs console.
// Usage : node outils/verifier.mjs http://127.0.0.1:8767/
import { chrome } from './chrome.mjs';
const BASE = process.argv[2];
const c = await chrome();
const out = []; const ok = (n, v, x = '') => out.push(`${v ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
try {
  for (const page of ['index.html', 'tarifs.html']) for (const [w, h, mob] of [[1440, 800, false], [1280, 720, false], [1024, 768, false], [768, 1024, true], [390, 844, true], [320, 640, true]]) {
    await c.go(BASE + page, w, h, mob);
    const r = JSON.parse(await c.ev(`JSON.stringify({sw:document.documentElement.scrollWidth, h1:document.querySelectorAll('h1').length})`));
    ok(`${page} ${w}×${h} : pas de débordement, un h1`, r.sw === w && r.h1 === 1, JSON.stringify(r));
    if (page !== 'index.html') continue;
    if (!mob) { const b = await c.ev(`Math.round(document.querySelector('.hero__art img').getBoundingClientRect().bottom)`); ok(`accueil ${w}×${h} : ordinateur du hero entier`, b <= h, `bas ${b}`); }
    const img = JSON.parse(await c.ev(`(async()=>{const i=document.querySelector('.board img');i.loading='eager';await i.decode().catch(()=>0);const cv=document.createElement('canvas');cv.width=i.naturalWidth;cv.height=i.naturalHeight;const x=cv.getContext('2d');x.drawImage(i,0,0);const d=x.getImageData(0,0,cv.width,cv.height).data;let t=0;for(let k=3;k<d.length;k+=4*97){if(d[k]<250)t++}const r=i.getBoundingClientRect();return JSON.stringify({src:i.currentSrc.split('/').pop(),transparent:t,w:Math.round(r.width),h:Math.round(r.height)})})()`));
    ok(`accueil ${w} : intégrations opaques, large sur ordinateur, vertical sur mobile`, img.transparent === 0 && (w >= 900 ? img.w > 3 * img.h : img.h > img.w), JSON.stringify(img));
    const cmp = JSON.parse(await c.ev(`(()=>{const t=document.querySelector('.compare');return JSON.stringify({rows:t.querySelectorAll('tbody tr').length, scroll:t.scrollWidth>t.clientWidth})})()`));
    ok(`accueil ${w} : comparatif à 7 lignes${w < 700 ? ', défilable dans son cadre' : ', sans défilement'}`, cmp.rows === 7 && (w < 700 ? true : !cmp.scroll), JSON.stringify(cmp));
  }
  await c.go(BASE + 'tarifs.html', 390, 844, true);
  await c.ev(`document.querySelector('.menu-btn').click();1`); await new Promise(r => setTimeout(r, 150));
  ok('menu mobile ouvert', await c.ev(`getComputedStyle(document.getElementById('nav')).display==='flex'`));
  await c.go(BASE + 'tarifs.html', 1440, 800);
  const est = JSON.parse(await c.ev(`(()=>{const r=document.getElementById('arrivees');r.value=8;r.dispatchEvent(new Event('input',{bubbles:true}));return JSON.stringify({free:document.getElementById('est-free').textContent,paid:document.getElementById('est-paid').textContent})})()`));
  ok('estimation : 8 → 2 offertes, 6 facturées', est.free === '2' && est.paid === '6', JSON.stringify(est));
  await c.ev(`document.querySelector('[data-demo="bandeau"]').click();1`); await new Promise(r => setTimeout(r, 200));
  ok('démo : message affiché', (await c.ev(`document.getElementById('demo-msg').textContent`)).startsWith('La prise de rendez-vous'));
  await c.go(BASE + 'index.html#mentions', 1440, 800); await new Promise(r => setTimeout(r, 300));
  ok('mentions ouvertes depuis un lien', await c.ev(`document.getElementById('mentions').open`));
  ok('aucun nom de l\'équipe', !(await c.ev(`/Balthazar|Léopold/.test(document.body.innerText)`)));
  await c.ev(`(()=>{const f=document.getElementById('beta-form');f.email.value='test@exemple.fr';f.consent.checked=true;document.getElementById('submit-btn').click();return 1})()`); await new Promise(r => setTimeout(r, 200));
  ok('formulaire : aperçu sans faux succès', (await c.ev(`document.getElementById('form-msg').textContent`)).startsWith('Aperçu') && await c.ev(`document.getElementById('form-ok').hidden`));
  const ext = [...new Set(c.reqs.filter(u => !u.startsWith(new URL(BASE).origin) && !u.startsWith('data:') && u !== 'about:blank'))];
  ok('aucune requête externe', ext.length === 0, ext.join(', '));
  ok('aucune ressource en erreur', c.bad.length === 0, c.bad.join(' | '));
  ok('aucune erreur console', c.errs.length === 0, c.errs.join(' | '));
} finally { c.close(); }
console.log(out.join('\n')); console.log(`\n${out.filter(l => l.startsWith('PASS')).length} PASS / ${out.filter(l => l.startsWith('FAIL')).length} FAIL`);
