import { readFile, writeFile, mkdir, cp, symlink, access, unlink } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildEvidence } from './build-evidence.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args=process.argv.slice(2);
const mobs=resolve(args[args.indexOf('--mobs-root')+1] || '');
const runtime=resolve(args[args.indexOf('--runtime-root')+1] || '');
if(!args.includes('--mobs-root')||!args.includes('--runtime-root')||!args.includes('--evidence-file')) throw Error('Use --mobs-root <pinned MOBS checkout> --runtime-root <external lab directory> --evidence-file <external private evidence JSON>');
const evidenceFile=resolve(args[args.indexOf('--evidence-file')+1]);
if(!relative(root,evidenceFile).startsWith('..')||!relative(mobs,evidenceFile).startsWith('..'))throw Error('Private evidence must be outside consumer and MOBS');
const privateData=JSON.parse(await readFile(evidenceFile,'utf8'));
if(runtime===root||!relative(root,runtime).startsWith('..')||runtime===mobs||!relative(mobs,runtime).startsWith('..'))throw Error('Execution copy must be outside consumer and MOBS');
const data=JSON.parse(await readFile(join(root,'source/content.json'),'utf8'));
const config=JSON.parse(await readFile(join(root,'source/presentation.json'),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pinned=execFileSync('git',['-C',mobs,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(pinned!==privateData.baselines.mobs)throw Error('MOBS baseline mismatch');
await mkdir(join(runtime,'project/automation'),{recursive:true});
await mkdir(join(runtime,'docs/mobs/schemas'),{recursive:true});
await cp(join(mobs,'project/automation/dist'),join(runtime,'project/automation/dist'),{recursive:true});
await cp(join(mobs,'docs/mobs/schemas/web-experience'),join(runtime,'docs/mobs/schemas/web-experience'),{recursive:true});
await cp(join(mobs,'project/automation/package.json'),join(runtime,'project/automation/package.json'));
try{await access(join(runtime,'project/automation/node_modules'));}catch{await symlink(join(mobs,'project/automation/node_modules'),join(runtime,'project/automation/node_modules'),'junction');}
const runtimeHashes={};
for(const name of ['web-experience-generator.js','web-experience-compositions.js','web-experience-validator.js','experience-binding.js']){
 const src=await readFile(join(mobs,'project/automation/dist/src/narrative',name));
 const mirror=await readFile(join(runtime,'project/automation/dist/src/narrative',name));
 if(!src.equals(mirror))throw Error('Execution copy differs');
 runtimeHashes[name]=sha(src);
}
const {WebExperienceGenerator}=await import(pathToFileURL(join(runtime,'project/automation/dist/src/narrative/web-experience-generator.js')));
const {WebExperienceValidator}=await import(pathToFileURL(join(runtime,'project/automation/dist/src/narrative/web-experience-validator.js')));
const {compositionScript}=await import(pathToFileURL(join(runtime,'project/automation/dist/src/narrative/web-experience-compositions.js')));
const gen=await WebExperienceGenerator.create();const validator=await WebExperienceValidator.create();
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const out=async(path,text)=>{await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),text);};
const json=async(path,value)=>out(path,JSON.stringify(value,null,2)+'\n');
const baselineManifest=JSON.parse(await readFile(join(root,'source/legacy-manifest.json'),'utf8'));
const artifacts=[];
for(const lang of ['en','pt-BR']){
 const l=data.locales[lang],other=lang==='en'?'pt-BR':'en';
 for(const key of ['home','mobs','odysseus','last-sentinel']){
  const home=key==='home', page=home?l.home:l.cases[key];
  const frame=(id,title,body,pattern='stacked-default',bullets=[])=>({id,order:0,purpose:title,chapterId:id,frameIntent:id==='f-hero'?'open-identity':'explain-list',figurativeLayer:'schematic',visualPlanes:['text'],density:'balanced',highlight:'none',compositionPattern:pattern,slots:[{role:'title',content:title,sourceFactIds:[home?'profile':key==='last-sentinel'?'sentinel':key]},{role:'body',content:body,sourceFactIds:[home?'profile':key==='last-sentinel'?'sentinel':key]},...bullets.map(content=>({role:'bullet',content,sourceFactIds:[home?'profile':key==='last-sentinel'?'sentinel':key]}))]});
  const hero=frame('f-hero',page.title,home?page.body:page.intro,'banner-hero-split');hero.slots.splice(1,0,{role:'subtitle',content:page.subtitle});hero.purpose=home?page.eyebrow:page.tag;
  const frames=home?[hero,frame('f-approach',page.approachTitle,page.approach.join(' '),'manifesto-list',page.approach),frame('f-trajectory',page.trajectoryTitle,page.trajectoryBody,'narrative-chain',page.trajectory)]:[hero,...page.sections.map((s,i)=>frame('f-section-'+i,s.title,s.body,s.pattern||'stacked-default',s.bullets||[]))];
  frames.forEach((f,i)=>{f.order=i+1;if(f.compositionPattern==='narrative-chain')f.compositionPattern='stacked-default';});
  const spec={specVersion:'1.0.0',experienceId:`folio-${key}-${lang}`,title:home?'Lucas Neukirchen — Folio':`${page.title} — Lucas Neukirchen`,status:'approved',language:lang,experienceTier:'L-B',mediumTargets:['web-experience'],narrativeRef:{narrativeId:`folio-${key}`,narrativeSpecVersion:'1.0.0'},frames,authorities:[{path:'project/automation/future/WEB_EXPERIENCE_SYSTEM.md'},{path:'docs/mobs/models/VISUAL_LANGUAGE_MODEL.md'}],provenance:{generator:'llm-assisted',llm:{provider:'OpenAI',model:'Codex'},sourceNarrative:{narrativeId:`folio-${key}`,status:'approved',provenance:{generator:'llm-assisted',notes:config.scopeAuthorization}}},approval:{approvedBy:'founder execution mandate',notes:'Authorized first-slice materialization for local review. This flag is required by WES; it does not assert separate final visual approval or publication approval.'}};
  const specPath=`source/specs/${lang}/${key}.json`,purePath=`preview-pure/${lang}/${key}.html`;
  await json(specPath,spec);
  await mkdir(dirname(join(runtime,specPath)),{recursive:true});await cp(join(root,specPath),join(runtime,specPath));
  const diagnostic=await gen.run({baseDir:root,experienceSpecification:spec,job:{family:'web-experience-generate',outputPath:purePath}});
  if(diagnostic.status!=='ok')throw Error(JSON.stringify(diagnostic));
  const vd=await validator.run({baseDir:root,job:{family:'web-experience-validate',mode:'spec-and-artifact',experienceSpecPath:specPath,artifactPath:purePath,outputPath:`diagnostics/hybrid/${lang}-${key}.json`}});
  if(vd.status!=='ok')throw Error(JSON.stringify(vd));
  const reportPath=join(root,`diagnostics/hybrid/${lang}-${key}.json`);
  await mkdir(join(dirname(evidenceFile),'diagnostics'),{recursive:true});
  await cp(reportPath,join(dirname(evidenceFile),'diagnostics',`${lang}-${key}.json`));await unlink(reportPath);
  let pure=await readFile(join(root,purePath),'utf8');
  const fragment=pure.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const styles=pure.match(/<style>([\s\S]*?)<\/style>/)[1];
  let body=fragment.replace(/<div class="mobs-hero-nav-shell">[\s\S]*?<\/nav>\s*<\/div>/,'');
  let titleCount=0;body=body.replace(/<div class="slot" data-role="title"><p>([\s\S]*?)<\/p><\/div>/g,(_,text)=>`<div class="slot" data-role="title"><${titleCount++?'h2':'h1'}>${text}</${titleCount===1?'h1':'h2'}></div>`);
  body=body.replace(/<header><h2>([\s\S]*?)<\/h2><\/header>/g,'<header><p class="eyebrow">$1</p></header>');
  const prefix=home?'../':'../../',localePrefix=home?'':'../',pagePath=home?'index.html':`cases/${key}.html`;
  const nav=`<a class="skip" href="#main">${esc(l.ui.skip)}</a><header class="site-header"><a class="brand" href="${home?'index.html':'../index.html'}">LN<span>Lucas Neukirchen</span></a><nav aria-label="${esc(l.ui.navigation)}"><a href="${home?'#work':'../index.html#work'}">${esc(l.ui.work)}</a><a href="#evidence">${esc(l.ui.evidence)}</a><a href="#contact">${esc(l.ui.contact)}</a></nav><nav aria-label="${esc(l.ui.language)}" class="languages"><a href="${prefix}${other}/${pagePath}" lang="${other}" hreflang="${other}">${other==='en'?'EN':'PT'}</a><span aria-current="true">${lang==='en'?'EN':'PT'}</span></nav></header>`;
  const cards=`<section class="projects" id="work"><div class="section-head"><p class="eyebrow">${esc(l.ui.work)}</p><h2>${esc(l.home.workIntro)}</h2></div>${Object.entries(l.cases).map(([slug,c])=>`<a class="project-row project-${slug}" href="cases/${slug}.html"><span class="project-number">${c.number}</span><div><p class="eyebrow">${esc(c.tag)}</p><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><span class="state">${esc(c.state)}</span></div><span class="arrow" aria-hidden="true">↗</span></a>`).join('')}</section>`;
  const contribution=home?'':`<section class="contribution"><p class="eyebrow">${lang==='en'?'My contribution':'Minha contribuição'}</p><p>${esc(page.contribution)}</p><div class="status"><span class="eyebrow">${esc(l.ui.status)}</span><p>${esc(page.state)}</p></div></section>`;
  const picture=key==='last-sentinel'?`<figure class="terrain"><img src="${prefix}assets/folio/toxic-city.png" width="720" height="1280" loading="lazy" alt="${esc(l.ui.terrainAlt)}"><figcaption>${esc(l.ui.terrainCaption)}</figcaption></figure>`:'';
  const sources=home?['profile','mobs','odysseus','sentinel']:page.sources;
  const evidence=`<section class="evidence" id="evidence"><p class="eyebrow">${esc(l.ui.evidence)}</p><h2>${lang==='en'?'From intention to implementation.':'Da intenção à implementação.'}</h2><p>${esc(l.ui.sourceNote)}</p><details><summary>${lang==='en'?'View evidence summary':'Ver resumo das evidências'}</summary><ul>${sources.map(id=>`<li>${esc(data.evidence[id].labels[lang])}</li>`).join('')}</ul></details></section>`;
  const footer=`<footer id="contact"><p class="eyebrow">${esc(l.ui.contact)}</p><h2>${lang==='en'?'Let’s build with intention.':'Vamos construir com intenção.'}</h2><p>${esc(l.home.contactBody)}</p><a class="contact-link" href="${data.identity.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><div class="footer-line"><span>Lucas Neukirchen · Folio</span><span>${lang==='en'?'Built with MOBS · independent consumer':'Construído com MOBS · consumidor independente'}</span></div></footer>`;
  if(home){const at=body.indexOf('<section',body.indexOf('</section>')+10);body=body.slice(0,at)+cards+body.slice(at);}else{const at=body.indexOf('</section>')+10;body=body.slice(0,at)+contribution+picture+body.slice(at);}
  const tokens=config.theme;
  const wesScript=home?compositionScript({carousel:false,timeline:false,caps:false,manifesto:true,state:false,philosophy:false,stickyNav:false,pageCursor:false}):'';
  const html=`<!doctype html><html lang="${lang}" data-page="${key}" style="--folio-bg:${esc(tokens.background)};--folio-panel:${esc(tokens.panel)};--folio-text:${esc(tokens.text)};--folio-muted:${esc(tokens.secondary)};--folio-accent:${esc(tokens.accent)};--mobs-font:${esc(tokens.fontFamily)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(spec.title)}</title><meta name="description" content="${esc(home?page.body:page.summary)}"><link rel="alternate" hreflang="${other}" href="${prefix}${other}/${pagePath}"><style>${styles}</style><link rel="stylesheet" href="${prefix}assets/folio/style.css"></head><body>${nav}<main id="main" class="mobs-shell-wide" data-consumer="folio" data-wes-source="${esc(purePath)}">${home?'':`<a class="back-link" href="../index.html#work">← ${esc(l.ui.back)}</a>`}${body}${evidence}</main>${footer}<script src="${prefix}assets/folio/site.js" defer></script></body></html>\n`.replace(/[ \t]+$/gm,'');
  const fallback=home?`<noscript><section class="evidence"><h2>${esc(page.approachTitle)}</h2><ul>${page.approach.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section></noscript>`:'';
  const finalHtml=html.replace('</main>',`${fallback}</main>`).replace('</body>',`${wesScript}</body>`).replace(/[ \t]+$/gm,'');
  const finalPath=home?`${lang}/index.html`:`${lang}/cases/${key}.html`;await out(finalPath,finalHtml);
  artifacts.push({path:finalPath,sha256:sha(finalHtml),purePath,pureSha256:sha(pure),specPath,specSha256:sha(JSON.stringify(spec,null,2)+'\n'),generator:diagnostic.status,validator:vd.status,patterns:frames.map(f=>f.compositionPattern)});
 }
}
await out('index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lucas Neukirchen — Folio</title><meta http-equiv="refresh" content="0;url=en/index.html"></head><body><p><a href="en/index.html">English</a> · <a href="pt-BR/index.html">Português</a></p><script>let l='en';try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('lucas-pe-lang')||'en'}catch{}location.replace(l==='pt-BR'?'pt-BR/index.html':'en/index.html')</script></body></html>\n`);
await writeFile(join(dirname(evidenceFile),'provenance-hybrid.json'),JSON.stringify({scope:'First hybrid slice; local review only',baselines:privateData.baselines,evidence:privateData.evidence,sources:['source/content.json','source/presentation.json'],wes:{institutionalBaseline:pinned,runtimeHashes,mode:'Pinned execution copy outside MOBS; structural WES theme/policy; consumer identity applied in final layer. Validator resolves source paths relative to execution copy.'},artifacts,assets:privateData.assets,preservedBaseline:baselineManifest,limitations:['Final pages need consumer validation beyond pure WES reports','No new playable experience, HD local characters or divergent fog','Final visual acceptance/publication not implied by execution authorization']},null,2)+'\n');
// Explicit public allowlist: build sources, history and private audit records are not served.
await mkdir(join(root,'public/assets/folio'),{recursive:true});
for(const p of ['index.html',...artifacts.map(a=>a.path),'assets/folio/style.css','assets/folio/site.js',...Object.values(config.assets).map(a=>a.path)]){
 await mkdir(dirname(join(root,'public',p)),{recursive:true});await cp(join(root,p),join(root,'public',p));
}
console.log(`Generated and WES-validated ${artifacts.length} pages. No publication.`);
const evidencePages=await buildEvidence(root);
const privateManifestPath=join(dirname(evidenceFile),'provenance-hybrid.json');
const manifest=JSON.parse(await readFile(privateManifestPath,'utf8'));
for(const artifact of manifest.artifacts)artifact.sha256=sha(await readFile(join(root,artifact.path)));
manifest.consumerEvidencePages=await Promise.all(evidencePages.map(async path=>({path,sha256:sha(await readFile(join(root,path)))})));
manifest.sourceExcerptRecord=JSON.parse(await readFile(join(dirname(evidenceFile),'evidence-capture/excerpt-manifest-private.json'),'utf8'));
manifest.evidenceImages=await Promise.all(Object.entries(JSON.parse(await readFile(join(root,'source/evidence-public.json'),'utf8'))).map(async([id,r])=>({id,path:r.image,sha256:sha(await readFile(join(root,r.image)))})));
await writeFile(privateManifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(`Linked claims to ${evidencePages.length} bilingual internal evidence pages.`);
