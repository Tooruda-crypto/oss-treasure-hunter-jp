export function filterCandidates(items,f={}) {
  return items.filter(c=>(!f.query||c.repository.toLowerCase().includes(f.query.toLowerCase())) && c.score.total>=Number(f.score||0) && c.stars>=Number(f.stars||0)
    && (Number(f.feasibility||0)<=0||(c.score.breakdown.feasibility.value!==null&&c.score.breakdown.feasibility.value>=Number(f.feasibility)))
    && ['status','language','category','monetizationType'].every(k=>!f[k]||c[k]===f[k]) && (!f.license||c.license.spdx===f.license));
}
