import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
const root=resolve(process.argv[2]??'dist'),port=Number(process.argv[3]??4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8'};
createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';const p=resolve(root,'.'+name);if(!p.startsWith(root+'/'))throw new Error();const s=await stat(p);if(!s.isFile())throw new Error();res.writeHead(200,{'Content-Type':types[extname(p)]??'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(await readFile(p));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${port}`));
