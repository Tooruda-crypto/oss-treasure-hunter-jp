import { metadataSchema, manualSchema, assert, timestamp } from './schema.js';
import { text, publicUrl } from './security.js';

export const SCORING_VERSION='oth-jp-rules-0.1.0';
export const WEIGHTS={demand:20,commercialGap:20,japanGap:20,license:15,feasibility:15,monetization:10};
const demandPattern=/\b(hosted|cloud|saas|gui|web ui|mobile|team|multi-user|install|setup|docker|pricing|paid|support|api|export|integration)\b|日本語|欲しい|ほしい|使いにくい|導入|連携|設定|チーム/iu;
const families={
  'MIT':['LOW',15,'著作権・許諾表示の保持'], 'BSD-2-Clause':['LOW',15,'著作権・条件・免責表示の保持'], 'BSD-3-Clause':['LOW',15,'表示保持・推薦への名称利用制限'],
  'Apache-2.0':['LOW',14,'ライセンス・変更表示・適用されるNOTICE・特許条項の確認'],
  'MPL-2.0':['MEDIUM',11,'対象ファイルのソース開示義務を確認'],
  'LGPL-2.1-only':['MEDIUM',10,'ライブラリ改変・リンク・再リンク条件を確認'], 'LGPL-2.1-or-later':['MEDIUM',10,'適用版とリンク条件を確認'],
  'LGPL-3.0-only':['MEDIUM',10,'ライブラリ改変・リンク条件を確認'], 'LGPL-3.0-or-later':['MEDIUM',10,'適用版とリンク条件を確認'],
  'GPL-2.0-only':['MEDIUM-HIGH',7,'配布時の対応ソース・同一ライセンス条件を確認'], 'GPL-2.0-or-later':['MEDIUM-HIGH',7,'適用版・配布時のソース条件を確認'],
  'GPL-3.0-only':['MEDIUM-HIGH',7,'配布時の対応ソース・同一ライセンス条件を確認'], 'GPL-3.0-or-later':['MEDIUM-HIGH',7,'適用版・配布時のソース条件を確認'],
  'AGPL-3.0-only':['HIGH',4,'変更版のネットワーク利用を含むソース提供条件を確認'], 'AGPL-3.0-or-later':['HIGH',4,'適用版・ネットワーク利用を含むソース条件を確認']
};
export function licenseClass(spdx, verified=false) {
  const f=families[spdx];
  return {spdx:typeof spdx==='string'?text(spdx,60):'UNKNOWN',friction:f?.[0]??'BLOCKED',points:verified&&f?f[1]:null,
    status:!f?'BLOCKED':verified?'IDENTIFIED':'NEEDS_FILE_REVIEW',requirements:f?.[2]??'権利・許諾範囲の確認が必要',
    commercialUse:f?'POSSIBLE_SUBJECT_TO_TERMS':'UNVERIFIED',dependencyReview:'NOT_REVIEWED',trademark:'UNVERIFIED',manualReview:'REQUIRED_FOR_PRODUCT'};
}
export function categoryOf(r,body) {
  const s=`${(r.topics||[]).join(' ')} ${r.full_name} ${body}`.toLowerCase();
  const rules=[['AI',/machine-learning|\bllm\b|neural/],['Security',/security|encrypt|password/],['Data',/database|analytics|\betl\b/],['Automation',/automat|workflow/],['Developer Tools',/\bcli\b|developer|debug|compiler/],['Design',/design|drawing/],['Education',/education|learning/],['Finance',/finance|accounting/],['Media',/video|audio/],['Marketing',/marketing/],['Content',/content|publishing/],['Business',/business|\bcrm\b/],['Productivity',/productivity|notes|task/]];
  return rules.find(([,re])=>re.test(s))?.[0]??'Other';
}
export function mvpTemplate(repository,wedge,license,hasDemand) {
  return {
    kind:'HYPOTHESIS_TEMPLATE_NO_AI',workingName:`${repository.split('/')[1]} 向け導入支援案（仮称）`,originalOSS:`https://github.com/${repository}`,
    problem:hasDemand?'取得Issueの要望を顧客面談で再確認する':'具体的な顧客課題は未検証',targetUser:'当該OSSの導入を検討する日本の小規模チーム（仮説）',
    productWedge:wedge,requiredOSSModification:'最初は本体改変を避ける。必要性とライセンスを別途確認',requiredNewComponents:['日本語の導入手順','最小操作画面または設定テンプレート'],
    features:['1つの利用フロー','失敗時の説明','設定のエクスポート'],nonFeatures:['会員・決済','常時Hostedサービス','自動営業','全用途への対応'],
    ui:'日本語の最小操作画面（GUI仮説の場合）',architecture:'元OSSと薄い入出力層を分離。対象コードは本ツールで実行しない',hosting:'まず利用者PC。別製品のホスティング費用は別途検証',
    estimatedComplexity:'未見積もり。言語・依存・インフラの実装調査が必要',licenseRequirements:license.requirements,securityConsiderations:['入力検証','秘密情報の非保存','依存・実行権限の監査'],
    monetization:wedge,pricingHypothesis:'未設定。支払意思の検証前に価格・売上を断定しない',validationPlan:['対象顧客3者に課題を確認','既存サービスと日本語代替を調査','手動デモで価値を確認'],
    developmentPhases:['権利と需要の確認','1フローの試作','受入試験'],acceptanceCriteria:['ライセンス・依存・商標確認を記録','対象者が主要操作を完了','競合との差を根拠付きで説明','費用上限と停止手順が明確']
  };
}

export function analyzeOne(input,manual,c,observedAt) {
  const r=metadataSchema(input.metadata), name=r.full_name, url=`https://github.com/${name}`;
  const evidence=[];
  function ev(type,status,summary,sourceUrl=url,source='github',at=observedAt) {
    const id=`${name}:${type}:${evidence.length+1}`;
    evidence.push({id,source,type,url:publicUrl(sourceUrl)||url,observedAt:at,status,summary:text(summary),weight:1,confidence:status==='OK'?1:0});return id;
  }
  const meta=ev('metadata','OK',`Stars ${r.stargazers_count}; open issues ${r.open_issues_count}; size ${r.size} KiB。Starsは得点に使用しない。`);
  const readme=input.readme??{status:'NOT_FETCHED'}, issues=input.issues??{status:'NOT_FETCHED'}, lf=input.licenseFile??{status:'NOT_FETCHED'};
  const body=readme.status==='OK'?String(readme.text??''):'';
  const japanese=/[ぁ-んァ-ン]|readme[._-]ja|日本語|japanese/i.test(body);
  const cli=/\bcli\b|command[- ]line|コマンドライン/i.test(body);
  const commercial=/\b(our cloud|official cloud|enterprise plan|pricing|paid plan)\b|公式クラウド|有料プラン/i.test(body);
  const hard=/\bgpu\b|kernel|driver|distributed|cuda|medical|custody|医療|金融資産/i.test(body);
  const readmeId=ev('readme',readme.status,readme.status==='OK'?`限定README確認: CLI手掛かり=${cli}; 日本語手掛かり=${japanese}; 商用提供の用語=${commercial}; 高負荷領域の用語=${hard}。用語検出であり製品の有無の断定ではない。`:`README取得状態: ${readme.status}`,`${url}#readme`);
  const lic=licenseClass(lf.status==='OK'?lf.spdx:r.license?.spdx_id,lf.status==='OK' && Boolean(lf.text?.trim()));
  const licId=ev('license',lf.status,`SPDX=${lic.spdx}; ファイル確認=${lf.status}; 依存・商標は未確認。`,`https://api.github.com/repos/${name}/license`);
  const hits=[];
  if(issues.status==='OK') {
    assert(Array.isArray(issues.items));
    for(const i of issues.items.slice(0,c.issuesPerRepo)) {
      assert(Number.isInteger(i.number)&&i.number>0);
      if(demandPattern.test(`${i.title} ${i.body}`)) {
        const comments=Math.max(0,Number(i.comments)||0),reactions=Math.max(0,Number(i.reactions)||0);
        const id=ev('demand','OK',`要望関連語を検出。コメント ${comments}、リアクション ${reactions}。否定・文脈は未解釈。`,`${url}/issues/${i.number}`);
        hits.push({id,points:2+Math.min(2,Math.floor(comments/3))+Math.min(2,Math.floor(reactions/5))});
      }
    }
  }
  const issueId=ev('issues',issues.status,`取得状態=${issues.status}; 最大${c.issuesPerRepo}件、需要関連語の検出${hits.length}件。全Issueの調査ではない。`,`${url}/issues`);
  const observations=manual.entries.filter(e=>e.repository.toLowerCase()===name.toLowerCase()).map(e=>({e,id:ev('manual','OK',e.summary,e.url,'manual',e.observedAt)}));
  const fresh=observations.filter(({e})=>Date.parse(e.observedAt)<=Date.parse(observedAt) && Date.parse(observedAt)-Date.parse(e.observedAt)<=90*86400000);
  const last=fresh.at(-1), m=last?.e;
  const bd={}; const add=(key,value,reason,ids=[])=>bd[key]={value,max:WEIGHTS[key],reason,evidenceIds:ids};
  const demand=issues.status==='OK'?Math.min(20,hits.reduce((s,h)=>s+h.points,0)):null;
  add('demand',demand,'限定Issue: 1検出2点、コメント3件毎に最大2点、反応5件毎に最大2点。合計上限20。',[issueId,...hits.map(h=>h.id)]);
  const commercialState=m?.commercial??(commercial?'SIGNAL_FOUND':'UNVERIFIED');
  add('commercialGap',m?.commercial==='PRESENT'?3:m?.commercial==='ABSENT_IN_REVIEWED_SCOPE'?12:null,'手動調査で提供あり3点、調査範囲内未確認12点。READMEの不検出のみでは加点しない。',last?[last.id]:[readmeId]);
  const japanValue=demand>0 && typeof m?.japanRelevant==='boolean' && typeof m?.localizationGap==='boolean' && ['FOUND','NONE_IN_REVIEWED_SCOPE'].includes(m?.competition)?(m.japanRelevant?5:0)+(m.japanRelevant&&m.localizationGap?5:0)+(m.japanRelevant&&m.competition==='NONE_IN_REVIEWED_SCOPE'?5:0):null;
  add('japanGap',japanValue,'需要＋90日以内の日本関連性・ローカライズ・競合調査が必要。各5点、最大15点。一般Web網羅不足の5点は付与しない。',last?[last.id,issueId]:[readmeId]);
  add('license',lic.points,'SPDXファイル確認時のみ、商用化義務の摩擦に基づく固定表を適用。適法性の保証ではない。',[licId]);
  add('feasibility',readme.status==='OK'?(hard?2:cli?8:null):null,'高負荷領域の用語があれば2点、CLI明示は8点。それ以外は未評価。依存・コードは未監査。',[readmeId,meta]);
  const wedge=hits.length>0?(cli?'GUI':'Support'):'UNVERIFIED';
  add('monetization',hits.length>0?4:null,'限定Issue需要と対応するGUIまたは導入支援の仮説に4点。支払意思は未検証。',[...hits.map(h=>h.id),readmeId]);
  const evaluatedMax=Object.values(bd).filter(s=>s.value!==null).reduce((s,v)=>s+v.max,0),total=Object.values(bd).reduce((s,v)=>s+(v.value??0),0);
  const reasons=[];
  if(r.archived)reasons.push('ARCHIVED');if(r.fork)reasons.push('FORK');if(r.mirror_url)reasons.push('MIRROR');
  if(Date.parse(observedAt)-Date.parse(r.pushed_at)>c.staleDays*86400000)reasons.push('STALE_ACTIVITY_REVIEW');
  if(lic.status==='BLOCKED')reasons.push('LICENSE_UNVERIFIED');if(readme.status==='NOT_FOUND')reasons.push('NO_README');
  if(m?.risk)reasons.push(m.risk);
  const status=reasons.length?'BLOCKED':evaluatedMax<60||demand===null||demand===0?'LOW_SIGNAL':japanValue===null||lic.status!=='IDENTIFIED'||total<70?'VALIDATE':'READY';
  const ageDays=Math.max(0,(Date.parse(observedAt)-Date.parse(input.observedAt??observedAt))/86400000);
  const confidence=Math.round(evaluatedMax/100 * (ageDays<=30?1:0.5) * (m?.competition && m.competition!=='UNVERIFIED'?0.8:0.6)*100)/100;
  return {repository:name,url,stars:r.stargazers_count,language:text(r.language??'Unknown',60),category:categoryOf(r,body),track:input.track??'fixture',status,exclusionReasons:reasons,
    score:{total,evaluatedMax,unevaluatedMax:100-evaluatedMax,breakdown:bd,confidence,confidenceMeaning:'根拠の範囲・鮮度に基づく内部指標。成功確率ではない。'},
    license:lic,commercial:{status:commercialState,scope:'限定README＋投入された手動調査のみ'},
    japan:{japaneseDocumentation:readme.status==='OK'?(japanese?'SIGNAL_FOUND':'NOT_FOUND_IN_README'):'UNVERIFIED',competition:m?.competition??'UNVERIFIED',score:japanValue,confidence:japanValue===null?'LOW':'MEDIUM',qiita:'NOT_REQUESTED',zenn:'NOT_REQUESTED'},
    monetizationType:wedge,mvp:mvpTemplate(name,wedge,lic,hits.length>0),evidence,isNew:false,firstSeen:null,scoreChange:null};
}
export function analyze(bundle,manual,c,previous=null) {
  assert(['live','fixture'].includes(bundle.mode) && timestamp(bundle.observedAt) && Array.isArray(bundle.repositories));
  manualSchema(manual);
  const errors=[...(bundle.errors||[])],excluded=[...(bundle.excluded||[])],seen=new Set(),candidates=[];
  for(const input of bundle.repositories.slice(0,c.metadataLimit)) {
    try {
      const candidate=analyzeOne(input,manual,c,bundle.observedAt);
      if(seen.has(candidate.repository)){excluded.push({repository:candidate.repository,reason:'DUPLICATE'});continue;}
      seen.add(candidate.repository); candidates.push(candidate);
      for(const reason of candidate.exclusionReasons)excluded.push({repository:candidate.repository,reason});
    }catch{errors.push({stage:'analysis',status:'INVALID_INPUT'});}
  }
  const date=bundle.observedAt.slice(0,10);
  for(const candidate of candidates) {
    const old=previous?.candidates.find(r=>r.repository===candidate.repository);
    candidate.firstSeen=old?.firstSeen??date; candidate.isNew=!old || old.firstSeen===date;
    candidate.scoreChange=old?candidate.score.total-old.score.total:null;
  }
  candidates.sort((a,b)=>b.score.total-a.score.total||a.repository.localeCompare(b.repository,'en'));
  const runStatus=errors.length?(candidates.length?'PARTIAL':'FAILED'):'SUCCESS';
  return {schemaVersion:1,mode:bundle.mode,date,generatedAt:bundle.observedAt,lastSuccessAt:runStatus==='SUCCESS'?bundle.observedAt:previous?.lastSuccessAt??null,
    runStatus,scoringVersion:SCORING_VERSION,scope:{...bundle.scope,analyzed:candidates.length},errors,candidates,
    top:candidates.filter(r=>['READY','VALIDATE'].includes(r.status)).slice(0,c.topN).map(r=>r.repository),excluded,
    limitations:['全GitHubを網羅した探索ではない。検索結果と深掘り数に上限がある。','競合未調査はUNVERIFIED。日本語文書の不在を需要に換算しない。','AI不使用。商品化・MVPはテンプレート仮説。価格・売上・工数は未検証。','取得対象OSSの依存関係・商標は未監査。権利確認を完了した商品候補ではない。','暫定点は100点基準のまま。未評価配点を除いて満点へ換算しない。','Qiita・Zenn・Discussion・Release・言語別サイズは自動取得対象外。']};
}
