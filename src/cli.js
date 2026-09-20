import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { parseArgs } from 'node:util';
import { configSchema,manualSchema,reportSchema } from './schema.js';
import { GitHubClient,collect } from './github.js';
import { analyze } from './analyze.js';
import { locked,readJson,saveReport,atomic } from './storage.js';
import { markdown } from './report.js';
import { build } from './build.js';

export async function main(argv=process.argv.slice(2)) {
  const {values:v,positionals}=parseArgs({args:argv,allowPositionals:true,options:{config:{type:'string',default:'config/default.json'},root:{type:'string',default:'.'},input:{type:'string'},output:{type:'string'},auth:{type:'boolean',default:false},fixture:{type:'boolean',default:false},force:{type:'boolean',default:false},help:{type:'boolean'}}});
  const command=positionals[0];
  if(v.help||!command){console.log('OTH-JP v0.1\nnode src/cli.js hunt [--config PATH] [--root PATH] [--auth] [--force]\nnode src/cli.js analyze --input BUNDLE.json --fixture --root work/demo\nnode src/cli.js report [--input REPORT.json] [--output FILE.md]\nnode src/cli.js build [--root PATH] [--output dist] [--fixture]\nAnonymous by default. No paid providers. Fixture output requires an isolated --root.');return;}
  const root=resolve(v.root);
  if(command==='build'){console.log(JSON.stringify(await build(root,v.output??'dist',{allowFixture:v.fixture})));return;}
  if(command==='report'){const r=reportSchema(await readJson(v.input??join(root,'data/latest.json')));const out=markdown(r);if(v.output)await atomic(v.output,out);else console.log(out);return;}
  if(!['hunt','analyze'].includes(command))throw new Error('UNKNOWN_COMMAND');
  const c=configSchema(JSON.parse(await readFile(v.config,'utf8')));
  let manual,manualError;
  try{manual=manualSchema(await readJson(c.manualFile));}catch{manual={version:1,entries:[]};manualError={stage:'manual',status:'INVALID_MANUAL_PROVIDER'};}
  const token=v.auth?process.env.GITHUB_TOKEN??'':'';
  if(v.auth&&!token)throw new Error('AUTH_TOKEN_MISSING');
  await locked(root,async()=>{
    const previous=await readJson(join(root,'data/latest.json'));if(previous)reportSchema(previous);
    const now=new Date().toISOString();
    if(command==='hunt'&&!v.force&&previous?.mode==='live'&&previous.date===now.slice(0,10)){console.log(JSON.stringify({status:'ALREADY_COMPLETE',date:previous.date}));return;}
    let bundle;
    if(command==='analyze') {
      if(!v.input)throw new Error('INPUT_REQUIRED');
      bundle=await readJson(v.input);
      if(bundle.mode==='fixture' && (!v.fixture||root===resolve('.')))throw new Error('FIXTURE_REQUIRES_ISOLATED_ROOT');
    } else {
      if(v.fixture)throw new Error('HUNT_DOES_NOT_ACCEPT_FIXTURE');
      bundle=await collect(new GitHubClient(c,{token}),c,now);
    }
    if(previous && previous.mode!==bundle.mode)throw new Error('MIXED_DATA_MODES');
    if(manualError)bundle.errors=[...(bundle.errors??[]),manualError];
    const report=analyze(bundle,manual,c,previous);
    await saveReport(root,report,c,{token});
    console.log(JSON.stringify({status:report.runStatus,mode:report.mode,date:report.date,analyzed:report.candidates.length,deep:report.scope.deepAnalyzed??0,requests:report.scope.requests??0,top:report.top.length}));
    if(report.runStatus==='FAILED')process.exitCode=2;
  });
}
if(import.meta.main)main().catch(e=>{const code=/^[A-Z_]{1,80}$/.test(e.message)?e.message:'OPERATION_FAILED';console.error(`ERROR: ${code}. Check config, validated input, run lock, and documented limits. No response body or credentials are logged.`);process.exitCode=1;});
