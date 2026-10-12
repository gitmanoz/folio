import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {join,dirname} from 'node:path';
export async function buildEvidence(root){
 const c=JSON.parse(await readFile(join(root,'source/content.json'),'utf8'));
 const records=JSON.parse(await readFile(join(root,'source/evidence-public.json'),'utf8'));
 const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 // Preserve literal whitespace in transcripts without trailing source whitespace.
 const transcript=s=>e(s).replace(/[ \t]+(?=\n)/g,spaces=>[...spaces].map(ch=>ch===' '?'&#32;':'&#9;').join(''));
 const mapping={mobs:['mobs','ari','wes','mobs'],odysseus:['odysseus','promotion','promotion','map'],'last-sentinel':['player','terrain','sentinel','sentinel']};
 const outputs=[];
 for(const lang of ['en','pt-BR']){
  const other=lang==='en'?'pt-BR':'en',pt=lang==='pt-BR';
  for(const [id,r] of Object.entries(records)){
   const label=c.evidence[id].labels[lang];
   const alt=typeof r.alt==='string'?r.alt:r.alt[lang];
   const kind=r.kind==='source-excerpt'?(pt?'Captura de trecho da fonte':'Captured source excerpt'):(pt?'Asset real do projeto':'Original project asset');
   const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(label)} — Folio</title><link rel="stylesheet" href="../../assets/folio/style.css"><link rel="alternate" hreflang="${other}" href="../../${other}/evidence/${id}.html"></head><body><a class="skip" href="#main">${pt?'Ir para o conteúdo':'Skip to content'}</a><header class="site-header"><a class="brand" href="../index.html">LN<span>Lucas Neukirchen</span></a><nav aria-label="${pt?'Idioma':'Language'}" class="languages"><a href="../../${other}/evidence/${id}.html">${other==='en'?'EN':'PT'}</a><span aria-current="true">${pt?'PT':'EN'}</span></nav></header><main id="main" class="evidence-page"><a href="../index.html#evidence">← ${pt?'Voltar ao portfólio':'Back to portfolio'}</a><p class="eyebrow">${pt?'Evidências do trabalho':'Evidence of the work'}</p><h1>${e(label)}</h1><p class="evidence-meta">${e(kind)} · ${r.date}</p><section><h2>${pt?'O que esta evidência demonstra':'What this evidence demonstrates'}</h2><p>${e(r.proves[lang])}</p></section><figure><a href="../../${e(r.image)}" target="_blank" rel="noopener noreferrer" aria-label="${pt?'Abrir captura em tamanho original':'Open full-size capture'}"><img src="../../${e(r.image)}" alt="${e(alt)}" loading="lazy"></a><figcaption>${e(r.source)} · ${pt?'Material selecionado. A origem completa é mantida no registro privado.':'Selected material. Full origin is retained in the private audit record.'}</figcaption></figure>${r.excerpt?`<details class="transcription"><summary>${pt?'Ler transcrição literal acessível':'Read accessible verbatim transcript'}</summary><pre>${transcript(r.excerpt)}</pre></details>`:''}<section class="evidence-limits"><h2>${pt?'Contexto e limites':'Context and limits'}</h2><p>${e(r.limits[lang])}</p>${r.kind==='source-excerpt'?`<p>${pt?'A imagem é uma captura local de um recorte literal do arquivo verificado. Não é captura da interface do GitHub nem da aplicação em execução. O trecho permanece no idioma original.':'The image captures a locally rendered literal excerpt from the verified file. It is not a GitHub UI screenshot or a running-application screenshot. The excerpt retains its original language.'}</p>`:''}</section><p><button type="button" class="evidence-back" data-history-back>${pt?'← Voltar à afirmação':'← Back to the claim'}</button></p></main><script src="../../assets/folio/site.js" defer></script></body></html>\n`;
   for(const p of [`${lang}/evidence/${id}.html`,`public/${lang}/evidence/${id}.html`]){await mkdir(dirname(join(root,p)),{recursive:true});await writeFile(join(root,p),html)}
   await mkdir(dirname(join(root,'public',r.image)),{recursive:true});await cp(join(root,r.image),join(root,'public',r.image));
   outputs.push(`${lang}/evidence/${id}.html`);
  }
  for(const page of ['home','mobs','odysseus','last-sentinel']){
   const path=page==='home'?`${lang}/index.html`:`${lang}/cases/${page}.html`;
   let html=await readFile(join(root,path),'utf8');
   const prefix=page==='home'?'evidence/':'../evidence/';
   let bodyIndex=0;
   html=html.replace(/(<div class="slot" data-role="body"><p>)([\s\S]*?)(<\/p><\/div>)/g,(all,start,body,end)=>{
    const ids=page==='home'?['profile','profile','profile']:[(page==='last-sentinel'?'sentinel':page),...mapping[page]];
    const id=ids[bodyIndex++]||ids.at(-1);
    return `${start}<a class="claim-link" href="${prefix}${id}.html">${body}</a>${end}`;
   });
   const ids=page==='home'?['profile','mobs','odysseus','sentinel']:c.locales[lang].cases[page].sources;
   for(const id of ids){const label=e(c.evidence[id].labels[lang]);html=html.replace(`<li>${label}</li>`,`<li><a href="${prefix}${id}.html">${label} ↗</a></li>`)}
   html=html.replace(/(<section class="contribution">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,`$1<a class="claim-link" href="${prefix}profile.html">$2</a>$3`);
   await writeFile(join(root,path),html);await writeFile(join(root,'public',path),html);
  }
 }
 return outputs;
}
