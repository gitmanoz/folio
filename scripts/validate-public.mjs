import {readFile, readdir, lstat} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const records=JSON.parse(await readFile(join(root,'source/evidence-public.json'),'utf8'));
const expected=new Set(['index.html','assets/folio/style.css','assets/folio/site.js',...Object.values(records).map(r=>r.image)]);
for(const lang of ['en','pt-BR']) {
  expected.add(`${lang}/index.html`);
  for(const id of ['mobs','odysseus','last-sentinel']) expected.add(`${lang}/cases/${id}.html`);
  for(const id of Object.keys(records)) expected.add(`${lang}/evidence/${id}.html`);
}
const actual=[];
async function walk(path='') {
  for(const name of await readdir(join(root,'public',path))) {
    const file=path?`${path}/${name}`:name;
    const stat=await lstat(join(root,'public',file));
    assert.ok(!stat.isSymbolicLink(),`Link prohibited in public payload: ${file}`);
    if(stat.isDirectory()) await walk(file);
    else {assert.ok(stat.isFile(),file); actual.push(file);}
  }
}
await walk();
assert.deepEqual(actual.sort(),[...expected].sort(),'Public payload must exactly match the approved page and asset list');
for(const file of actual.filter(p=>p.endsWith('.html'))) {
  const html=await readFile(join(root,'public',file),'utf8');
  assert.ok(!/github\.com|[a-f0-9]{40}|C:\\Users|github_pat_|ghp_/.test(html),file);
  for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if(/^(https?:|#)/.test(link)) continue;
    const target=resolve(dirname(join(root,'public',file)),link.split('#')[0]);
    assert.ok(target.startsWith(join(root,'public')+'/')||target.startsWith(join(root,'public')+'\\'),file);
    assert.ok((await lstat(target)).isFile(),`${file}: ${link}`);
  }
}
console.log(`Public payload validated: ${actual.length} files; no private audit records or historical releases.`);
