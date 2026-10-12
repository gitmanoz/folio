// Extract exact, selected source ranges. Full originals and Git provenance stay external.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),base=resolve(args[0]||'');
if(!args[0])throw Error('Pass external evidence-capture directory');
const content=JSON.parse(await readFile(join(root,'source/content.json'),'utf8'));
const definitions={
 profile:['## Career Highlights','## Core Competencies','Professional Experience Pack',
  'Records the declared professional roles and career path used by this portfolio.','Registra as funções e a trajetória profissional declaradas usadas neste portfólio.',
  'A founder-approved content record; not an independent employment verification.','Registro de conteúdo aprovado pelo fundador; não é verificação independente de vínculo empregatício.'],
 mobs:['## O que é o MOBS','Para o **porquê**','MOBS platform definition',
  'Defines the engineering platform and its current official name.','Define a plataforma de engenharia e seu significado oficial atual.',
  'Evidence of institutional definition, not a measurement of adoption or commercial results.','Evidência da definição institucional, não medição de adoção ou resultados comerciais.'],
 ari:['### 6.1. Autoridade','Antes da revisão','Agent Runtime Integration',
  'Separates institutional approval, snapshot review and mandate approval.','Separa aprovação institucional, revisão de snapshot e aprovação de mandato.',
  'An architectural requirement; consumers need separate implementation validation.','Requisito arquitetural; consumidores precisam de validação própria da implementação.'],
 wes:['## 7b. Composition patterns','Resolução:','Web Experience System',
  'Lists the deterministic compositions available to consumers, including this Folio.','Lista composições determinísticas disponíveis aos consumidores, incluindo este Folio.',
  'The composition contract does not certify the final consumer navigation or accessibility.','O contrato de composição não certifica navegação ou acessibilidade final do consumidor.'],
 odysseus:['def reserve_loopback_socket','def wait_for_readiness','Desktop host · selected implementation',
  'Shows a local listener reserved by the Desktop Host, including cleanup on failure.','Mostra um listener local reservado pelo Desktop Host e sua limpeza em caso de falha.',
  'A code excerpt, not a screenshot of the running application or an operational test.','Trecho de código, não screenshot da aplicação executando nem teste operacional.'],
 promotion:['def seal_private_effects','def record_pending','Controlled Promotion · selected implementation',
  'Shows two-file delta sealing, target inventory checks and content preservation.','Mostra selagem do delta de dois arquivos, verificação do inventário e preservação de conteúdo.',
  'Only a selected part of the mechanism. It does not establish universal safety.','Parte selecionada do mecanismo. Não demonstra segurança universal.'],
 map:['| `execution`','| `planning`','Capability Map · audited limits',
  'Records partial execution, promotion and Git capabilities instead of claiming full parity.','Registra capacidades parciais de execução, promoção e Git, sem alegar paridade integral.',
  'A dated documentary audit; current operational behavior needs its own evidence.','Auditoria documental datada; comportamento operacional atual exige evidência própria.'],
 sentinel:['[application]','[gui]','Godot project configuration',
  'Shows the project entry scene, autoloaded systems and portrait viewport.','Mostra a cena inicial, sistemas autoload e viewport vertical do projeto.',
  'Configuration evidence does not prove a shipped product or successful gameplay test.','Configuração não comprova produto lançado nem teste de gameplay bem-sucedido.'],
 player:['func _play_animation','func _update_sprite_frame','Player animation state logic',
  'Shows walk, shoot, hurt, death and idle timing in the inspected player implementation.','Mostra timing de walk, shoot, hurt, death e idle na implementação examinada.',
  'State logic is observable; animation quality still requires in-game visual assessment.','A lógica é observável; qualidade da animação ainda exige avaliação visual em jogo.']
};
const records={},internal={};
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const [id,d] of Object.entries(definitions)){
 const raw=await readFile(join(base,id+'.txt'),'utf8');
 const start=raw.indexOf(d[0]),end=raw.indexOf(d[1],start+d[0].length);
 if(start<0||end<0)throw Error('Source markers missing: '+id);
 let excerpt=raw.slice(start,end).trimEnd();
 // Keep this lengthy source demonstration bounded, clearly marked as a partial excerpt.
 if(id==='promotion')excerpt=excerpt.split('\n').slice(0,33).join('\n');
 if(/github\.com|ghp_|github_pat_|BEGIN .*PRIVATE KEY|[a-f0-9]{40}/i.test(excerpt))throw Error('Unreviewed source data: '+id);
 const first=raw.slice(0,start).split('\n').length;
 records[id]={date:'2026-10-12',source:d[2],kind:'source-excerpt',excerpt,image:`assets/folio/evidence/${id}.png`,alt:content.evidence[id].labels,proves:{en:d[3],'pt-BR':d[4]},limits:{en:d[5],'pt-BR':d[6]}};
 internal[id]={sourceSha256:hash(raw),excerptSha256:hash(excerpt),firstLine:first,lastLine:first+excerpt.split('\n').length-1,captureMethod:'Screenshot of locally rendered exact source excerpt; not GitHub UI',capturedDate:'2026-10-12'};
 await mkdir(join(base,'frames'),{recursive:true});
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(d[2])}</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f6f0;color:#202a24;font:16px/1.65 Arial;padding:42px;max-width:1050px}h1{font-size:26px;margin:0 0 10px}p{font-size:13px;color:#48594d;margin:0 0 22px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 Consolas,monospace;border-top:2px solid #566d57;padding-top:22px;margin:0}</style></head><body><h1>${escape(d[2])}</h1><p>Source excerpt · captured 2026-10-12 · selected material, no repository access required</p><pre>${escape(excerpt)}</pre></body></html>`;
 await writeFile(join(base,'frames',id+'.html'),html);
}
records.terrain={date:'2026-10-12',source:'The Last Sentinel · Toxic City',kind:'project-asset',image:'assets/folio/toxic-city.png',alt:content.locales.en.ui.terrainAlt,proves:{en:'Real arena asset from the verified project snapshot.','pt-BR':'Asset real da arena do snapshot verificado do projeto.'},limits:{en:'A static asset, not gameplay footage or proof of animation quality.','pt-BR':'Asset estático, não captura de gameplay nem prova de qualidade de animação.'}};
await writeFile(join(root,'source/evidence-public.json'),JSON.stringify(records,null,2)+'\n');
await writeFile(join(base,'excerpt-manifest-private.json'),JSON.stringify(internal,null,2)+'\n');
console.log('Selected 9 exact source excerpts + 1 real project asset.');
