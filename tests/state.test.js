import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,mkdtemp,rm,mkdir,writeFile,symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateState,installState,restoreState } from '../scripts/state.js';
import { analyze } from '../src/analyze.js';
import { saveReport,readJson } from '../src/storage.js';
import { build } from '../src/build.js';
import { bundle } from './fixtures/repos.js';
const config=JSON.parse(await readFile(new URL('../config/default.json',import.meta.url),'utf8'));
async function temp(t){const p=await mkdtemp(join(tmpdir(),'oth-state-'));t.after(()=>rm(p,{recursive:true,force:true}));return p;}
function syntheticLive(){const b=bundle(2);b.mode='live';return analyze(b,{version:1,entries:[]},config);}
test('state roundtrip regenerates Markdown and rejects unapproved artifact files',async t=>{const source=await temp(t),target=await temp(t);await saveReport(source,syntheticLive(),config);await writeFile(join(source,'reports/daily/2026-09-20.md'),'<script>malicious artifact</script>');await installState(source,target);const md=await readFile(join(target,'reports/daily/2026-09-20.md'),'utf8');assert(!md.includes('<script>'));assert(md.includes('根拠'));await mkdir(join(source,'.github'));await assert.rejects(()=>validateState(source),/UNSAFE_STATE_DIRECTORY/);});
test('state refuses fixture data and symlinks',async t=>{const root=await temp(t);await saveReport(root,analyze(bundle(1),{version:1,entries:[]},config),config);await assert.rejects(()=>validateState(root),/FIXTURE/);await symlink('/etc/passwd',join(root,'data/link'));await assert.rejects(()=>validateState(root),/SYMLINK/);});
test('durable data branch restore, next-day analysis, and project base build',async t=>{const gitroot=await temp(t),target=await temp(t),r=syntheticLive();await saveReport(gitroot,r,config);const g=(...args)=>execFileSync('git',args,{cwd:gitroot,stdio:'pipe'});g('init','-b','oth-data');g('add','data','reports');g('-c','user.name=Fixture Test','-c','user.email=fixture@example.invalid','commit','-m','Synthetic local test only');g('update-ref','refs/remotes/origin/oth-data','HEAD');const old=process.cwd();try{process.chdir(gitroot);await restoreState(target);}finally{process.chdir(old);}const previous=await readJson(join(target,'data/latest.json'));assert.equal(previous.candidates.length,2);const b=bundle(2);b.mode='live';b.observedAt='2026-09-21T10:00:00Z';const next=analyze(b,{version:1,entries:[]},config,previous);assert(next.candidates.every(c=>!c.isNew));await saveReport(target,next,config);await build(target,join(target,'project-base'));assert.equal((await readJson(join(target,'project-base/data/latest.json'))).date,'2026-09-21');});
test('build refuses to delete an unrelated directory',async t=>{const root=await temp(t),dest=join(root,'other-project');await mkdir(dest);await writeFile(join(dest,'important.txt'),'preserve');await assert.rejects(()=>build(root,dest),/UNMANAGED/);assert.equal(await readFile(join(dest,'important.txt'),'utf8'),'preserve');});
test('storage evicts old archives at capacity while retaining latest',async t=>{const root=await temp(t);const r=syntheticLive();await saveReport(root,r,config);await writeFile(join(root,'data/archive/2026-09-01.json'),' '.repeat(50000));r.date='2026-09-21';r.generatedAt='2026-09-21T10:00:00Z';await saveReport(root,r,{...config,maxStorageBytes:80000});assert.equal((await readJson(join(root,'data/latest.json'))).date,'2026-09-21');await assert.rejects(()=>readFile(join(root,'data/archive/2026-09-01.json')));});
