import { mkdir,readFile,writeFile,rename,readdir,rm,stat } from 'node:fs/promises';
import { join } from 'node:path';
import { reportSchema } from './schema.js';
import { markdown } from './report.js';
import { redact,secretMatches } from './security.js';
export async function readJson(path,fallback=null) {
  try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw new Error('INVALID_LOCAL_JSON');}
}
export async function atomic(path,content) {
  await mkdir(join(path,'..'),{recursive:true});
  const tmp=`${path}.${process.pid}.tmp`;
  try {await writeFile(tmp,content,{mode:0o600});await rename(tmp,path);}finally{await rm(tmp,{force:true});}
}
export async function locked(root,fn) {
  await mkdir(root,{recursive:true}); const path=join(root,'.hunt-lock');
  try{await mkdir(path);}catch(e){if(e.code==='EEXIST')throw new Error('RUN_LOCKED');throw e;}
  try{await writeFile(join(path,'owner.json'),JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));return await fn();}
  finally{await rm(path,{recursive:true,force:true});}
}
export async function sizeOf(dir) {
  let bytes=0;for(const entry of await readdir(dir,{withFileTypes:true}).catch(e=>{if(e.code==='ENOENT')return [];throw e;})) {
    if(entry.isSymbolicLink())throw new Error('SYMLINK_REJECTED');
    const path=join(dir,entry.name);bytes+=entry.isDirectory()?await sizeOf(path):(await stat(path)).size;
  }return bytes;
}
export async function prune(root,c,date) {
  for(const dir of ['data/archive','reports/daily']) {
    const p=join(root,dir); const names=await readdir(p).catch(()=>[]);
    for(const name of names) {
      const match=name.match(/^(\d{4}-\d{2}-\d{2})(?:\.partial)?\.(json|md)$/);
      if(match && Date.parse(date)-Date.parse(match[1])>=c.retentionDays*86400000)await rm(join(p,name));
    }
  }
}
export async function saveReport(root,report,c,{token='',beforeLatest=async()=>{}}={}) {
  reportSchema(report);
  // Redact explicit token defensively even when it resembles ordinary text.
  const encoded=redact(JSON.stringify(report,null,2)+'\n',token);
  const clean=reportSchema(JSON.parse(encoded));
  const md=markdown(clean);
  if(secretMatches(encoded)||secretMatches(md))throw new Error('SECRET_SCAN_FAILED');
  await prune(root,c,report.date);
  const required=Buffer.byteLength(encoded)*2+Buffer.byteLength(md)+4096;
  let stored=await sizeOf(join(root,'data'))+await sizeOf(join(root,'reports'));
  const days=new Set();
  for(const dir of ['data/archive','reports/daily'])for(const name of await readdir(join(root,dir)).catch(()=>[])){
    const m=name.match(/^(\d{4}-\d{2}-\d{2})(?:\.partial)?\.(json|md)$/);if(m && m[1]<report.date)days.add(m[1]);
  }
  for(const day of [...days].sort()) {
    if(stored+required<=c.maxStorageBytes)break;
    for(const file of [`data/archive/${day}.json`,`reports/daily/${day}.md`,`reports/daily/${day}.partial.md`])await rm(join(root,file),{force:true});
    stored=await sizeOf(join(root,'data'))+await sizeOf(join(root,'reports'));
  }
  if(stored+required>c.maxStorageBytes)throw new Error('STORAGE_LIMIT');
  const attempt={date:report.date,attemptedAt:report.generatedAt,status:report.runStatus,mode:report.mode,requests:report.scope.requests??0,errors:report.errors};
  if(report.runStatus==='SUCCESS') {
    await atomic(join(root,'data/archive',`${report.date}.json`),encoded);
    await atomic(join(root,'reports/daily',`${report.date}.md`),md);
    await beforeLatest();
    await atomic(join(root,'data/latest.json'),encoded);
    await rm(join(root,'data/partial.json'),{force:true});
  } else if(report.candidates.length) {
    await atomic(join(root,'data/partial.json'),encoded);
    await atomic(join(root,'reports/daily',`${report.date}.partial.md`),md);
  }
  await atomic(join(root,'data/last-attempt.json'),JSON.stringify(attempt,null,2)+'\n');
  return clean;
}
