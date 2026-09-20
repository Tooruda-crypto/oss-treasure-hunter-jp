import { readdir,readFile,lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { secretMatches } from '../src/security.js';
import { reportSchema } from '../src/schema.js';
const failures=[],files=[];
async function visit(dir='.') {
  for(const e of await readdir(dir,{withFileTypes:true})) {
    if(['.git','work','dist','node_modules'].includes(e.name))continue;
    const path=join(dir,e.name);
    if(e.isSymbolicLink()){failures.push(`Symlink: ${path}`);continue;}
    if(e.isDirectory())await visit(path);else files.push(path);
  }
}
await visit();
for(const p of files) {
  if(/(?:^|\/)\.env(?:\.|$)/.test(p)&&!p.endsWith('.env.example'))failures.push(`Private environment file: ${p}`);
  const s=await readFile(p,'utf8');if(secretMatches(s))failures.push(`Secret pattern in ${p}`);
  if(/\/(?:Users|home)\//.test(s))failures.push(`Local personal path in ${p}`);
  if((p.startsWith('data/')||p.startsWith('examples/'))&&p.endsWith('.json')&&!p.endsWith('last-attempt.json')) {
    try{const r=JSON.parse(s);if(r.schemaVersion){reportSchema(r);if(p.startsWith('data/')&&r.mode!=='live')throw new Error();}}catch{failures.push(`Invalid public data: ${p}`);}
  }
}
const pkg=JSON.parse(await readFile('package.json','utf8')),lock=JSON.parse(await readFile('package-lock.json','utf8'));
if(Object.keys(lock.packages??{}).length!==1||Object.keys(pkg.dependencies??{}).length||Object.keys(pkg.devDependencies??{}).length)failures.push('Dependencies changed: audit required');
if(['preinstall','install','postinstall','prepare'].some(k=>pkg.scripts[k]))failures.push('Install lifecycle script requires review');
const pins=JSON.parse(await readFile('docs/action-pins.json','utf8'));
for(const name of ['ci.yml','daily-hunt.yml','pages.yml']) {
  const s=await readFile(`.github/workflows/${name}`,'utf8');
  for(const match of s.matchAll(/uses:\s+(actions\/[\w-]+)@([^\s]+)/g))if(!pins.some(p=>`actions/${p.name}`===match[1]&&p.sha===match[2]))failures.push(`Unreviewed action pin: ${name}`);
  if(s.includes('pull_request_target')||s.includes('secrets: inherit')||s.includes('runs-on: self-hosted'))failures.push(`Unsafe workflow: ${name}`);
}
let historyObjects=0;
try {
  const objects=execFileSync('git',['rev-list','--objects','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  for(const line of objects){const id=line.split(' ')[0];if(execFileSync('git',['cat-file','-t',id],{encoding:'utf8'}).trim()!=='blob')continue;historyObjects++;const content=execFileSync('git',['cat-file','-p',id],{maxBuffer:20000000}).toString('utf8');if(secretMatches(content))failures.push('Secret pattern in Git history (value withheld)');}
}catch{failures.push('Git history scan failed');}
const result={status:failures.length?'FAIL':'PASS',filesScanned:files.length,historyBlobsScanned:historyObjects,npmDependencies:0,installScripts:0,failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
