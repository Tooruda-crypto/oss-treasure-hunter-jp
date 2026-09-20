import { readdir,readFile,mkdir,writeFile,rm } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { reportSchema,assert,timestamp } from '../src/schema.js';
import { sizeOf } from '../src/storage.js';
import { markdown } from '../src/report.js';
import { secretMatches } from '../src/security.js';
export const allowed=/^(?:data\/(?:latest|partial|last-attempt)\.json|data\/archive\/\d{4}-\d{2}-\d{2}\.json|reports\/daily\/\d{4}-\d{2}-\d{2}(?:\.partial)?\.md)$/;
export async function validateState(root) {
  assert(await sizeOf(root)<=20000000,'STATE_SIZE_LIMIT');
  const files=[];
  async function visit(dir='') {for(const entry of await readdir(join(root,dir),{withFileTypes:true})){const path=dir?`${dir}/${entry.name}`:entry.name;if(entry.isDirectory()){assert(['data','data/archive','reports','reports/daily'].includes(path),'UNSAFE_STATE_DIRECTORY');await visit(path);}else{assert(entry.isFile()&&allowed.test(path),'UNSAFE_STATE_FILE');files.push(path);}}}
  await visit();const contents=new Map();
  for(const path of files) {
    const s=await readFile(join(root,path),'utf8');assert(!secretMatches(s),'STATE_SECRET_DETECTED');
    if(path.endsWith('.json')) {
      const r=JSON.parse(s);
      if(path==='data/last-attempt.json'){assert(['SUCCESS','PARTIAL','FAILED'].includes(r.status)&&r.mode==='live'&&timestamp(r.attemptedAt));}
      else {reportSchema(r);assert(r.mode==='live','FIXTURE_PUBLICATION_BLOCKED');}
    }
    contents.set(path,s);
  }
  // Published Markdown is regenerated from validated JSON, never trusted from artifacts.
  const clean=new Map([...contents].filter(([path])=>!path.startsWith('reports/')));
  for(const [path,s] of contents) {
    if(path.startsWith('data/archive/')){const r=JSON.parse(s);clean.set(`reports/daily/${r.date}.md`,markdown(r));}
    if(path==='data/partial.json'){const r=JSON.parse(s);clean.set(`reports/daily/${r.date}.partial.md`,markdown(r));}
  }
  return clean;
}
export async function installState(source,target) {
  const files=await validateState(source);assert(resolve(source)!==resolve(target));
  for(const dir of ['data','reports'])await rm(join(target,dir),{recursive:true,force:true});
  for(const [file,s] of files){await mkdir(join(target,file,'..'),{recursive:true});await writeFile(join(target,file),s);}
  return files.size;
}
const git=(args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:21000000});
export async function restoreState(target,ref='refs/remotes/origin/oth-data') {
  const files=git(['ls-tree','-r','--name-only',ref]).trim().split('\n').filter(Boolean);assert(files.length<=400);
  const stage=`${target}.incoming`;await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
  try {for(const file of files){assert(allowed.test(file),'UNSAFE_STATE_FILE');await mkdir(join(stage,file,'..'),{recursive:true});await writeFile(join(stage,file),git(['show',`${ref}:${file}`]));}return await installState(stage,target);}finally{await rm(stage,{recursive:true,force:true});}
}
if(import.meta.main) {
  try {
    const [cmd,target]=process.argv.slice(2);assert(target);
    if(cmd==='validate')console.log(`Validated ${(await validateState(target)).size} files`);
    else if(cmd==='restore')await restoreState(target);
    else if(cmd==='seed'){await mkdir(target,{recursive:true});const files=await validateStateFromProject();for(const [p,s]of files){await mkdir(join(target,p,'..'),{recursive:true});await writeFile(join(target,p),s);}}
    else if(cmd==='persist') {
      assert(process.env.GITHUB_ACTIONS==='true' && ['schedule','workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME),'WORKFLOW_ONLY');
      await validateState(target);
      let existing=true;try{git(['show-ref','--verify','refs/remotes/origin/oth-data']);}catch{existing=false;}
      if(existing)git(['checkout','-B','oth-data','refs/remotes/origin/oth-data']);else git(['switch','--orphan','oth-data']);
      await installState(target,process.cwd());git(['add','--','data','reports']);
      if(git(['diff','--cached','--name-only']).trim())git(['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m','Update bounded public survey data']);
    }else throw new Error('UNKNOWN_COMMAND');
  }catch{console.error('STATE_VALIDATION_OR_PERSISTENCE_FAILED');process.exitCode=1;}
}
async function validateStateFromProject(){
  const stage='work/seed-validation';await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
  const {cp}=await import('node:fs/promises');
  try {for(const dir of ['data','reports'])await cp(dir,join(stage,dir),{recursive:true});return await validateState(stage);}finally{await rm(stage,{recursive:true,force:true});}
}
