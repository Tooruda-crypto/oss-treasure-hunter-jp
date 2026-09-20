// Synthetic, original fixtures. These names do not represent investigated projects.
export const observedAt='2026-09-20T10:00:00.000Z';
export function repo(index=0,overrides={}) {
  return {full_name:`fixture-org/sample-${String(index).padStart(3,'0')}`,private:false,visibility:'public',stargazers_count:200,forks_count:10,open_issues_count:12,size:1234,
    archived:false,fork:false,mirror_url:null,created_at:'2025-01-01T00:00:00Z',updated_at:'2026-09-18T00:00:00Z',pushed_at:'2026-09-18T00:00:00Z',language:'JavaScript',topics:['cli'],license:{spdx_id:'MIT'},...overrides};
}
export function entry(index=0,overrides={}) {
  return {metadata:repo(index),observedAt,track:'fixture',readme:{status:'OK',text:'A command-line tool for local workflows. CLI interface.'},licenseFile:{status:'OK',spdx:'MIT',text:'Synthetic license fixture, not third-party code.'},issues:{status:'OK',items:[{number:1,title:'GUI wanted',body:'Please add export integration.',comments:6,reactions:10},{number:2,title:'Setup is difficult',body:'I need hosted support.',comments:3,reactions:5}]},...overrides};
}
export function bundle(count=100) {
  const repositories=Array.from({length:count},(_,i)=>entry(i));
  if(count>=13){
    for(const [i,spdx] of ['MIT','Apache-2.0','GPL-3.0-only','AGPL-3.0-only','NOASSERTION'].entries()){repositories[i].metadata.license={spdx_id:spdx};repositories[i].licenseFile.spdx=spdx;}
    repositories[5].metadata.archived=true;repositories[6].metadata.fork=true;
    repositories[7].readme.text+=' Our cloud offers pricing and an enterprise plan.';
    repositories[8].issues.items=[];
    repositories[9].readme.text+=' 日本語ドキュメントがあります。';
    repositories[10].readme={status:'NOT_FOUND'};
    repositories[11].readme.text+=' GPU CUDA distributed system.';
    repositories[12].metadata.license=null;repositories[12].licenseFile={status:'NOT_FOUND'};
  }
  return {mode:'fixture',observedAt,repositories,excluded:[],errors:[],scope:{scanned:count,unique:count,analyzed:count,deepAnalyzed:count,requests:0,queries:[],auth:'fixture'}};
}
