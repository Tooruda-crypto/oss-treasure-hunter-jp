import { setTimeout as wait } from 'node:timers/promises';
import { metadataSchema, assert, object } from './schema.js';
import { repoName } from './security.js';

export class GitHubClient {
  constructor(config, {token='', fetcher=fetch, sleep=wait, now=Date.now}={}) {
    this.c=config; this.token=token; this.fetcher=fetcher; this.sleep=sleep; this.now=now;
    this.started=now(); this.count=0; this.cache=new Map(); this.buckets=new Map(); this.lastRequest=null; this.stopped=false;
  }
  async get(path) {
    // Only constructed REST routes; no redirects, arbitrary hosts, credentials, or write methods.
    assert(/^\/(?:search\/repositories\?|repos\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+(?:[/?]|$))/.test(path) && !path.split('?')[0].split('/').some(p=>p==='.'||p==='..') && !/[\r\n#\\]/.test(path), 'UNSAFE_API_PATH');
    if(this.cache.has(path)) return this.cache.get(path);
    const bucket=path.startsWith('/search/')?'search':'core';
    for(let attempt=0;attempt<=this.c.retries;attempt++) {
      if(this.stopped || this.count>=this.c.maxRequests || this.now()-this.started>=this.c.maxRunMs) return {status:'LIMIT_REACHED'};
      const exhausted=this.buckets.get(bucket);
      if(exhausted && exhausted.remaining===0 && exhausted.reset>this.now()) return {status:'RATE_LIMITED'};
      const gap=this.lastRequest===null?0:Math.max(0,this.c.minIntervalMs-(this.now()-this.lastRequest));
      if(gap) await this.sleep(gap);
      if(this.now()-this.started>=this.c.maxRunMs) return {status:'LIMIT_REACHED'};
      this.count++; this.lastRequest=this.now();
      let response;
      try {
        const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'OSS-Treasure-Hunter-JP/0.1'};
        if(this.token) headers.Authorization=`Bearer ${this.token}`;
        response=await this.fetcher(`https://api.github.com${path}`,{headers,redirect:'error',signal:AbortSignal.timeout(Math.min(this.c.timeoutMs,Math.max(1,this.c.maxRunMs-(this.now()-this.started))))});
      } catch {
        if(attempt<this.c.retries && await this.pause(1000*2**attempt)) continue;
        return {status:'NETWORK_ERROR'};
      }
      const remaining=response.headers.get('x-ratelimit-remaining');
      if(remaining!==null) this.buckets.set(bucket,{remaining:Number(remaining),reset:Number(response.headers.get('x-ratelimit-reset')||0)*1000});
      if(response.status===403 || response.status===429) {
        const ra=response.headers.get('retry-after');
        const retryMs=ra ? (/^\d+$/.test(ra)?Number(ra)*1000:Math.max(0,Date.parse(ra)-this.now())) : 60000*2**attempt;
        const reset=remaining==='0'?Math.max(0,Number(response.headers.get('x-ratelimit-reset')||0)*1000-this.now()):0;
        await response.body?.cancel();
        if(attempt<this.c.retries && await this.pause(Math.max(retryMs,reset))) continue;
        // Secondary limits can affect all routes. Stop this run, never hammer another bucket.
        this.stopped=true; return {status:'RATE_LIMITED',httpStatus:response.status};
      }
      if(response.status>=500) {
        await response.body?.cancel();
        if(attempt<this.c.retries && await this.pause(1000*2**attempt)) continue;
        return {status:'HTTP_ERROR',httpStatus:response.status};
      }
      if(!response.ok) { await response.body?.cancel(); return {status:response.status===404?'NOT_FOUND':'HTTP_ERROR',httpStatus:response.status}; }
      try {
        assert(Number(response.headers.get('content-length')||0)<=this.c.maxResponseBytes);
        const reader=response.body.getReader(); let size=0; const chunks=[];
        for (;;) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>this.c.maxResponseBytes){await reader.cancel();throw new Error();} chunks.push(value); }
        const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const result={status:'OK',data}; this.cache.set(path,result); return result;
      } catch { return {status:'INVALID_RESPONSE'}; }
    }
  }
  async pause(ms) {
    if(!Number.isFinite(ms) || ms>this.c.maxWaitMs || this.now()-this.started+ms>=this.c.maxRunMs) return false;
    await this.sleep(ms); return true;
  }
}

export async function collect(client,c,observedAt) {
  const unique=new Map(), excluded=[], errors=[], searched=[]; let scanned=0;
  for(const q of c.queries) {
    const perPage=Math.min(100,Math.ceil(c.maxCandidates/c.queries.length));
    for(let page=1;page<=c.pagesPerQuery && unique.size<c.maxCandidates;page++) {
      const p=new URLSearchParams({q:`${q.query} is:public`,sort:'updated',order:'desc',per_page:String(perPage),page:String(page)});
      const res=await client.get(`/search/repositories?${p}`);
      searched.push({track:q.track,query:q.query,page,status:res.status});
      if(res.status!=='OK'){errors.push({provider:'github',stage:'search',track:q.track,status:res.status});break;}
      if(!object(res.data)||!Array.isArray(res.data.items)){errors.push({stage:'search',status:'INVALID_RESPONSE'});break;}
      if(res.data.incomplete_results) errors.push({stage:'search',status:'INCOMPLETE_RESULTS'});
      for(const r of res.data.items) {
        scanned++;
        try {metadataSchema(r);}catch{errors.push({stage:'metadata',status:'INVALID_RESPONSE'});continue;}
        if(unique.has(r.full_name)){excluded.push({repository:r.full_name,reason:'DUPLICATE'});continue;}
        if(unique.size>=c.maxCandidates) break;
        unique.set(r.full_name,{metadata:r,track:q.track,observedAt,readme:{status:'NOT_FETCHED'},licenseFile:{status:'NOT_FETCHED'},issues:{status:'NOT_FETCHED'}});
      }
      if(res.data.items.length<perPage)break;
    }
  }
  const repositories=[...unique.values()].slice(0,c.metadataLimit); let deep=0;
  for(const r of repositories) {
    if(r.metadata.archived || r.metadata.fork || r.metadata.mirror_url)continue;
    if(deep>=c.deepLimit)continue;
    deep++; const name=repoName(r.metadata.full_name), base=`/repos/${name}`;
    for(const [key,path] of [['readme',`${base}/readme`],['licenseFile',`${base}/license`],['issues',`${base}/issues?state=open&sort=updated&per_page=${c.issuesPerRepo}`]]) {
      const res=await client.get(path); r[key]={status:res.status};
      if(res.status==='OK') {
        try {
          if(key==='issues') {
            assert(Array.isArray(res.data));
            r.issues.items=res.data.filter(i=>!i.pull_request).map(i=>{assert(object(i)&&typeof i.title==='string'&&typeof i.body==='string'||object(i)&&typeof i.title==='string'&&i.body===null);assert(Number.isInteger(i.number)&&i.number>0);return {number:i.number,title:i.title,body:i.body||'',comments:Number(i.comments)||0,reactions:Number(i.reactions?.total_count)||0};});
          } else {
            assert(object(res.data)&&res.data.encoding==='base64'&&typeof res.data.content==='string');
            r[key].text=Buffer.from(res.data.content,'base64').toString('utf8').slice(0,100000);
            if(key==='licenseFile')r[key].spdx=res.data.license?.spdx_id??null;
          }
        }catch{r[key]={status:'INVALID_RESPONSE'};}
      }
      if(!['OK','NOT_FOUND'].includes(r[key].status))errors.push({repository:name,stage:key,status:r[key].status});
    }
  }
  return {mode:'live',observedAt,repositories,excluded,errors,scope:{scanned,unique:unique.size,analyzed:repositories.length,deepAnalyzed:deep,requests:client.count,configuredQueries:c.queries,searched,auth:client.token?'explicit-token':'anonymous'}};
}
