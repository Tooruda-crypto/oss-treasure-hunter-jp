import { filterCandidates } from './filter.js';
const root=document.querySelector('#app');
const h=(tag,content='',cls='')=>{const el=document.createElement(tag);el.textContent=String(content??'');if(cls)el.className=cls;return el;};
function link(label,url,external=false) {
  const a=h('a',label);try {const u=new URL(url,location.href);if(external && (u.protocol!=='https:'||u.username||u.password))return h('span',label);a.href=u.href;}catch{return h('span',label);}
  if(external){a.rel='noopener noreferrer';a.target='_blank';}return a;
}
const labels={demand:'需要の手掛かり',commercialGap:'商用化の余地',japanGap:'日本市場の余地',license:'ライセンス摩擦',feasibility:'個人開発の実現性',monetization:'収益化仮説'};
let report=null,state={status:'NO_DATA'};
const statusLabel={SUCCESS:'取得成功',PARTIAL:'一部取得失敗',FAILED:'取得失敗',NO_DATA:'データなし'};
function banner(){
  const b=h('section','','status-band');
  const stale=report && (!report.lastSuccessAt||Date.now()-Date.parse(report.lastSuccessAt)>48*3600000);
  b.append(h('strong',`${statusLabel[state.status]??'状態不明'}${stale?' · 未更新（48時間超）':''}`),h('span',`最終成功 ${report?.lastSuccessAt??'なし'} / 最新試行 ${state.attemptedAt??'なし'}`));
  if(state.status!=='SUCCESS'&&report)b.append(h('p','前回成功データを表示しています。最新試行の失敗を「候補なし」とは扱いません。'));
  if(report?.mode==='fixture')b.append(h('strong','FIXTURE / 架空データのデモ。実在案件の調査結果ではありません。','fixture'));
  return b;
}
function downloads(){const nav=h('nav','','downloads');for(const [label,file] of [['JSONを保存','latest.json'],['Markdownを保存','latest.md']]){const a=link(label,`./data/${file}`);a.download=file;nav.append(a);}if(state.status==='PARTIAL'){const a=link('部分取得JSON','./data/partial.json');a.download='partial.json';nav.append(a);}return nav;}
function scoreBox(c){const box=h('div','','score');box.append(h('strong',c.score.total),h('span',`/ 100 暫定\n評価済み配点 ${c.score.evaluatedMax}\n未評価配点 ${c.score.unevaluatedMax}`));return box;}
function card(c,rank){
  const article=h('article','','card');const meta=h('div','','eyebrow');meta.append(h('span',rank?String(rank).padStart(2,'0'):'要確認'),h('span',c.category));
  article.append(meta,h('h3',c.repository),h('span',c.status,`pill ${c.status.toLowerCase()}`),scoreBox(c),h('p',`商品化仮説: ${c.monetizationType==='UNVERIFIED'?'根拠不足':c.monetizationType}`),h('p',`対象顧客: ${c.mvp.targetUser}`),h('p',`${c.license.spdx} · ${c.language} · ★ ${c.stars.toLocaleString('ja-JP')}`,'small'),h('p',`根拠充足指標 ${c.score.confidence} / 国内競合 ${c.japan.competition}`,'small'),h('p',c.isNew?`初回確認 ${c.firstSeen}`:`継続確認 / 初回 ${c.firstSeen}`,'small'));
  const a=link('根拠と仮説を見る →',`#repo=${encodeURIComponent(c.repository)}`);a.className='detail-link';article.append(a);return article;
}
function home(){
  root.replaceChildren();const hero=h('section','','hero');hero.append(h('p','EVIDENCE FIRST. POSSIBILITY SECOND.','eyebrow'),h('h1','次に作るものを、\n根拠から探す。'),h('p','世界のOSSから、日本で役立つかもしれないアイデアへ。\n需要・ライセンス・調査の限界を、ひとつのカードに。','intro'));root.append(hero,banner());
  if(!report){root.append(h('section','公開済みの成功データはまだありません。取得失敗の場合は運用者が再実行し、結果を確認してください。','empty'));if(state.status==='PARTIAL')root.append(downloads());return;}
  root.append(downloads());
  const stats=h('div','','stats');for(const [v,l] of [[report.candidates.length,'一次評価'],[report.scope.deepAnalyzed??0,'限定深掘り'],[report.top.length,'注目候補'],[report.scoringVersion,'採点ルール']]){const e=h('div');e.append(h('strong',v),h('span',l));stats.append(e);}root.append(stats);
  const controls=h('section','','filters');controls.setAttribute('aria-label','配信済みデータの絞り込み');const filters={};const fields={};
  const input=(key,label,type)=>{const l=h('label',label),i=h('input');i.type=type;i.name=key;if(type==='number'){i.min='0';i.value='0';}l.append(i);controls.append(l);fields[key]=i;};
  input('query','Repositoryを絞り込む','search');input('score','最低得点（暫定）','number');input('stars','最低Stars','number');input('feasibility','最低実現性得点','number');
  for(const [key,label] of [['status','状態'],['license','ライセンス'],['language','言語'],['category','カテゴリ'],['monetizationType','収益化仮説']]) {
    const l=h('label',label),select=h('select'),all=h('option','すべて');select.name=key;all.value='';select.append(all);
    const values=[...new Set(report.candidates.map(c=>key==='license'?c.license.spdx:c[key]))].sort();
    for(const value of values){const o=h('option',value);o.value=value;select.append(o);}l.append(select);controls.append(l);fields[key]=select;
  }
  const results=h('section');results.setAttribute('aria-live','polite');
  const render=()=>{
    for(const [k,el] of Object.entries(fields))filters[k]=el.value;
    const list=filterCandidates(report.candidates,filters);results.replaceChildren();results.append(h('h2',`調査カード / ${list.length}件`));
    for(const [title,predicate] of [['注目候補（最大10件）',c=>report.top.includes(c.repository)],['追加確認が必要な候補',c=>!report.top.includes(c.repository)&&c.status!=='BLOCKED'],['除外・権利確認が必要',c=>c.status==='BLOCKED']]){
      const group=list.filter(predicate);if(!group.length)continue;results.append(h('h3',title,'section-title'));const grid=h('div','','grid');for(const c of group)grid.append(card(c,report.top.indexOf(c.repository)+1));results.append(grid);
    }
    if(!list.length)results.append(h('p','絞り込み条件に一致する配信済みデータはありません。'));
  };
  controls.addEventListener('input',render);controls.addEventListener('change',render);root.append(controls,results);render();
  const limits=h('section','','limits');limits.append(h('h2','この調査で分かること・分からないこと'));for(const s of report.limitations)limits.append(h('p',s));root.append(limits);
  if(report.excluded.length){const d=h('details');d.append(h('summary',`除外記録 ${report.excluded.length}件`));for(const e of report.excluded)d.append(h('p',`${e.repository}: ${e.reason}`));root.append(d);}
}
function detail(c){
  root.replaceChildren(link('← 一覧へ','#'),banner());root.append(h('p',`${c.category} / ${c.status}`,'eyebrow'),h('h1',c.repository),link('GitHubで出典を見る ↗',c.url,true),scoreBox(c),h('p',c.score.confidenceMeaning));
  const breakdown=h('section','','panel');breakdown.append(h('h2','評価内訳'));
  for(const [key,s] of Object.entries(c.score.breakdown)){const row=h('div','','breakdown');row.append(h('strong',labels[key]),h('b',`${s.value??'未評価'} / ${s.max}`),h('p',s.reason),h('small',`根拠ID: ${s.evidenceIds.join(', ')}`));breakdown.append(row);}root.append(breakdown);
  for(const [title,values] of [['商用化状況',c.commercial],['日本向けの手掛かり',c.japan],['ライセンスと権利確認',c.license],['商品化・MVP仮説（AIなしのテンプレート）',c.mvp]]){
    const panel=h('section','','panel');panel.append(h('h2',title));const dl=h('dl');for(const [key,value] of Object.entries(values)){dl.append(h('dt',key),h('dd',Array.isArray(value)?value.join(' / '):value??'未評価'));}panel.append(dl);root.append(panel);
  }
  const ev=h('section','','panel');ev.append(h('h2','根拠と取得状態'));for(const e of c.evidence){const row=h('article','','evidence');row.append(link(`${e.type} ↗`,e.url,true),h('span',e.status,'pill'),h('p',e.summary),h('small',`${e.observedAt} / ${e.id}`));ev.append(row);}root.append(ev,downloads());
}
function route(){const match=location.hash.match(/^#repo=(.+)$/);if(match&&report){let name;try{name=decodeURIComponent(match[1]);}catch{}const c=report.candidates.find(r=>r.repository===name);if(c)detail(c);else{root.replaceChildren(h('h1','このRepositoryの配信済みデータはありません'),link('一覧へ','#'));}}else home();window.scrollTo(0,0);}
try{
  const [a,b]=await Promise.all([fetch('./data/latest.json'),fetch('./data/status.json')]);if(!a.ok||!b.ok)throw new Error();
  report=await a.json();state=await b.json();if(report&&(!Array.isArray(report.candidates)||!Array.isArray(report.top)))throw new Error();route();window.addEventListener('hashchange',route);
}catch{root.replaceChildren(h('h1','配信データを読み込めませんでした'),h('p','通信またはデータ形式の問題です。候補なしという意味ではありません。再読込、または運用者による復旧をお待ちください。'));}
