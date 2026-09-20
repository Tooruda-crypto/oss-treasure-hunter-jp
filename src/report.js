import { md } from './security.js';
import { reportSchema } from './schema.js';
export function markdown(report) {
  reportSchema(report);
  const lines=[`# Daily OSS Treasure Report — ${report.date}`, '', report.mode==='fixture'?'**FIXTURE / 架空データ。実在案件の調査結果ではありません。**':'**GitHub公開データの限定調査 / 商品化案は未検証の仮説です。**','',
    `状態: ${report.runStatus} / 最終成功: ${report.lastSuccessAt??'なし'} / 採点: ${report.scoringVersion}`,
    `一次評価 ${report.candidates.length}件 / 深掘り ${report.scope.deepAnalyzed??0}件 / API要求 ${report.scope.requests??0}回`,'',`## Top ${report.top.length}（評価範囲を満たした候補のみ）`];
  for(const [i,id] of report.top.entries()) {const c=report.candidates.find(c=>c.repository===id);lines.push(`${i+1}. [${md(id)}](${c.url}) — 暫定 ${c.score.total}/100・評価済み配点 ${c.score.evaluatedMax}/100・${c.status}`);}
  if(!report.top.length)lines.push('該当する十分な根拠の候補なし。根拠不足一覧を参照。');
  lines.push('','## 新規確認',...report.candidates.filter(c=>c.isNew).map(c=>`- ${md(c.repository)}（初回確認 ${c.firstSeen}）`),'','## 得点変動（絶対値5点以上）',...report.candidates.filter(c=>Math.abs(c.scoreChange??0)>=5).map(c=>`- ${md(c.repository)}: ${c.scoreChange>0?'+':''}${c.scoreChange}`));
  for(const c of report.candidates) {
    lines.push('',`## ${md(c.repository)}`,`[Repository](${c.url}) / ${c.status} / ${md(c.license.spdx)}`,`暫定 ${c.score.total}/100、評価済み配点 ${c.score.evaluatedMax}、未評価配点 ${c.score.unevaluatedMax}。`,
      `根拠充足指標 ${c.score.confidence}（成功確率ではない）。日本競合: ${c.japan.competition}。商用提供: ${c.commercial.status}。`,
      `ライセンス義務: ${md(c.license.requirements)} / 依存: ${c.license.dependencyReview} / 商標: ${c.license.trademark}`,'','|項目|得点 / 配点|理由|','|---|---|---|');
    for(const [key,s] of Object.entries(c.score.breakdown))lines.push(`|${key}|${s.value??'未評価'} / ${s.max}|${md(s.reason)}|`);
    lines.push('','### MVP・商品化仮説（AIなし）');
    for(const [key,v] of Object.entries(c.mvp))lines.push(`- **${key}**: ${md(Array.isArray(v)?v.join(' / '):v)}`);
    lines.push('','### 根拠');
    for(const e of c.evidence) lines.push(`- [${md(e.type)}](${e.url}) [${e.status}] ${md(e.summary)} — ${e.observedAt} / ID: ${md(e.id)}`);
  }
  lines.push('','## 除外記録',...report.excluded.map(e=>`- ${md(e.repository)}: ${md(e.reason)}`),'','## 取得エラー',...report.errors.map(e=>`- ${md(e.stage)}: ${md(e.status)}`),'','## 調査限界',...report.limitations.map(v=>`- ${md(v)}`),'');
  return lines.join('\n');
}
