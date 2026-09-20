import { repoName, publicUrl } from './security.js';
export function assert(ok, code = 'INVALID_SCHEMA') { if (!ok) throw new Error(code); }
export const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const timestamp = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
export function configSchema(c) {
  assert(object(c));
  const limits = {maxCandidates:[1,500],metadataLimit:[1,500],deepLimit:[0,20],issuesPerRepo:[1,30],pagesPerQuery:[1,5],maxRequests:[1,200],timeoutMs:[100,30000],maxRunMs:[1000,600000],retries:[0,2],maxWaitMs:[0,60000],minIntervalMs:[0,10000],topN:[1,10],retentionDays:[1,90],maxStorageBytes:[10000,20000000],maxResponseBytes:[1000,5000000],staleDays:[30,3650]};
  for (const [key,[min,max]] of Object.entries(limits)) assert(Number.isInteger(c[key]) && c[key]>=min && c[key]<=max, `INVALID_CONFIG_${key}`);
  assert(Array.isArray(c.queries) && c.queries.length>0 && c.queries.length<=5);
  for (const q of c.queries) assert(object(q) && typeof q.track==='string' && /^[a-z-]{1,30}$/.test(q.track) && typeof q.query==='string' && q.query.length>0 && q.query.length<240 && !/[\r\n]/.test(q.query));
  assert(typeof c.manualFile==='string');
  assert(Object.keys(c).every(k => k in limits || ['queries','manualFile'].includes(k)), 'UNKNOWN_CONFIG_FIELD');
  return c;
}
export function metadataSchema(r) {
  assert(object(r)); repoName(r.full_name);
  assert(r.private===false && r.visibility!=='private', 'NONPUBLIC_REPOSITORY');
  for (const key of ['stargazers_count','forks_count','open_issues_count','size']) assert(Number.isFinite(r[key]) && r[key]>=0);
  assert(typeof r.archived==='boolean' && typeof r.fork==='boolean');
  for (const key of ['created_at','updated_at','pushed_at']) assert(timestamp(r[key]));
  assert(r.language===null || typeof r.language==='string');
  assert(r.license===null || object(r.license));
  return r;
}
export function manualSchema(m) {
  assert(object(m) && m.version===1 && Array.isArray(m.entries) && m.entries.length<=500);
  const allowed = ['repository','observedAt','url','summary','commercial','japanRelevant','localizationGap','competition','risk'];
  for (const e of m.entries) {
    repoName(e.repository); assert(timestamp(e.observedAt) && publicUrl(e.url));
    assert(typeof e.summary==='string' && e.summary.length>0 && e.summary.length<=300);
    assert(Object.keys(e).every(k=>allowed.includes(k)));
    assert(e.commercial===undefined || ['PRESENT','ABSENT_IN_REVIEWED_SCOPE','UNVERIFIED'].includes(e.commercial));
    assert(e.competition===undefined || ['FOUND','NONE_IN_REVIEWED_SCOPE','UNVERIFIED'].includes(e.competition));
    for (const k of ['japanRelevant','localizationGap']) assert(e[k]===undefined || typeof e[k]==='boolean');
    assert(e.risk===undefined || ['MALWARE_SUSPECTED','REDISTRIBUTION_RESTRICTED','SOURCE_AVAILABLE'].includes(e.risk));
  }
  return m;
}
export function reportSchema(r) {
  assert(object(r) && r.schemaVersion===1 && ['live','fixture'].includes(r.mode));
  assert(timestamp(r.generatedAt) && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
  assert(['SUCCESS','PARTIAL','FAILED'].includes(r.runStatus));
  assert(r.lastSuccessAt===null || timestamp(r.lastSuccessAt));
  assert(typeof r.scoringVersion==='string' && Array.isArray(r.candidates) && r.candidates.length<=500);
  assert(Array.isArray(r.top) && r.top.length<=10 && Array.isArray(r.excluded) && object(r.scope) && Array.isArray(r.limitations));
  const seen=new Set();
  for (const c of r.candidates) {
    repoName(c.repository); assert(!seen.has(c.repository)); seen.add(c.repository);
    assert(c.url===`https://github.com/${c.repository}`);
    assert(['READY','VALIDATE','LOW_SIGNAL','BLOCKED'].includes(c.status));
    assert(object(c.score) && object(c.score.breakdown) && Array.isArray(c.evidence));
    let total=0, evaluated=0;
    for(const [key,max] of Object.entries({demand:20,commercialGap:20,japanGap:20,license:15,feasibility:15,monetization:10})) {
      const s=c.score.breakdown[key]; assert(object(s) && s.max===max && Array.isArray(s.evidenceIds) && typeof s.reason==='string');
      assert(s.value===null || (Number.isFinite(s.value) && s.value>=0 && s.value<=max));
      if(s.value!==null) { total+=s.value; evaluated+=max; }
    }
    assert(c.score.total===total && c.score.evaluatedMax===evaluated && c.score.unevaluatedMax===100-evaluated);
    const ids=new Set();
    for(const e of c.evidence) { assert(typeof e.id==='string' && !ids.has(e.id) && publicUrl(e.url)===e.url && timestamp(e.observedAt) && typeof e.summary==='string' && e.summary.length<=300); ids.add(e.id); }
    for(const s of Object.values(c.score.breakdown)) assert(s.evidenceIds.every(id=>ids.has(id)));
    assert(object(c.license) && object(c.japan) && object(c.mvp) && typeof c.isNew==='boolean');
  }
  assert(r.top.every(id=>seen.has(id)) && new Set(r.top).size===r.top.length);
  return r;
}
