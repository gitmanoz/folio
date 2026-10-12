import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { resolve, dirname, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.includes('.git'))throw Error('forbidden');let file=resolve(root,'.'+pathname);let r=relative(root,file);if(r.startsWith('..')||isAbsolute(r))throw Error('forbidden');if((await stat(file)).isDirectory())file=resolve(file,'index.html');file=await realpath(file);r=relative(root,file);if(r.startsWith('..')||isAbsolute(r))throw Error('forbidden');const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}});
server.listen(0,'127.0.0.1',()=>console.log(`Folio local preview: http://127.0.0.1:${server.address().port}`));
