import { mkdir,readFile,writeFile,copyFile,rm,rename,lstat } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson,sizeOf } from './storage.js';
import { reportSchema } from './schema.js';
import { markdown } from './report.js';
const web=fileURLToPath(new URL('../web/',import.meta.url));
export async function build(root,output,{allowFixture=false}={}) {
  const dest=resolve(output);
  if(dest===resolve(root)||dest==='/'||dest===resolve('.'))throw new Error('UNSAFE_BUILD_DESTINATION');
  try {
    const info=await lstat(dest);
    if(!info.isDirectory() || info.isSymbolicLink())throw new Error('UNSAFE_BUILD_DESTINATION');
    if(await readFile(join(dest,'.oth-build'),'utf8')!=='OTH-JP generated site\n')throw new Error('UNSAFE_BUILD_DESTINATION');
  }catch(e){if(e.code!=='ENOENT')throw e;if(await lstat(dest).catch(()=>null))throw new Error('UNMANAGED_BUILD_DESTINATION');}
  const latest=await readJson(join(root,'data/latest.json'));
  const partial=await readJson(join(root,'data/partial.json'));
  for(const r of [latest,partial].filter(Boolean)){reportSchema(r);if(r.mode==='fixture'&&!allowFixture)throw new Error('FIXTURE_PUBLICATION_BLOCKED');}
  const state=await readJson(join(root,'data/last-attempt.json'),{status:'NO_DATA',attemptedAt:null});
  const temp=`${dest}.building-${process.pid}`; await rm(temp,{recursive:true,force:true}); await mkdir(join(temp,'data'),{recursive:true});
  try {
    for(const f of ['index.html','app.js','filter.js','style.css'])await copyFile(join(web,f),join(temp,f));
    // Hash routes keep direct links valid under any GitHub project base path.
    await writeFile(join(temp,'.nojekyll'),'');
    await writeFile(join(temp,'.oth-build'),'OTH-JP generated site\n');
    await writeFile(join(temp,'data/status.json'),JSON.stringify(state,null,2));
    await writeFile(join(temp,'data/latest.json'),JSON.stringify(latest,null,2));
    await writeFile(join(temp,'data/partial.json'),JSON.stringify(partial,null,2));
    await writeFile(join(temp,'data/latest.md'),latest?markdown(latest):'# データなし\n');
    if(await sizeOf(temp)>10000000)throw new Error('BUILD_SIZE_LIMIT');
    await rm(dest,{recursive:true,force:true}); await rename(temp,dest);
  }finally{await rm(temp,{recursive:true,force:true});}
  return {output:dest,bytes:await sizeOf(dest),candidates:latest?.candidates.length??0};
}
