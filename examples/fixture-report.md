# Daily OSS Treasure Report — 2026-09-20

**FIXTURE / 架空データ。実在案件の調査結果ではありません。**

状態: SUCCESS / 最終成功: 2026-09-20T10:00:00.000Z / 採点: oth-jp-rules-0.1.0
一次評価 3件 / 深掘り 3件 / API要求 0回

## Top 3（評価範囲を満たした候補のみ）
1. [fixture-org/sample-000](https://github.com/fixture-org/sample-000) — 暫定 37/100・評価済み配点 60/100・VALIDATE
2. [fixture-org/sample-001](https://github.com/fixture-org/sample-001) — 暫定 37/100・評価済み配点 60/100・VALIDATE
3. [fixture-org/sample-002](https://github.com/fixture-org/sample-002) — 暫定 37/100・評価済み配点 60/100・VALIDATE

## 新規確認
- fixture-org/sample-000（初回確認 2026-09-20）
- fixture-org/sample-001（初回確認 2026-09-20）
- fixture-org/sample-002（初回確認 2026-09-20）

## 得点変動（絶対値5点以上）

## fixture-org/sample-000
[Repository](https://github.com/fixture-org/sample-000) / VALIDATE / MIT
暫定 37/100、評価済み配点 60、未評価配点 40。
根拠充足指標 0.36（成功確率ではない）。日本競合: UNVERIFIED。商用提供: UNVERIFIED。
ライセンス義務: 著作権・許諾表示の保持 / 依存: NOT_REVIEWED / 商標: UNVERIFIED

|項目|得点 / 配点|理由|
|---|---|---|
|demand|10 / 20|限定Issue: 1検出2点、コメント3件毎に最大2点、反応5件毎に最大2点。合計上限20。|
|commercialGap|未評価 / 20|手動調査で提供あり3点、調査範囲内未確認12点。READMEの不検出のみでは加点しない。|
|japanGap|未評価 / 20|需要＋90日以内の日本関連性・ローカライズ・競合調査が必要。各5点、最大15点。一般Web網羅不足の5点は付与しない。|
|license|15 / 15|SPDXファイル確認時のみ、商用化義務の摩擦に基づく固定表を適用。適法性の保証ではない。|
|feasibility|8 / 15|高負荷領域の用語があれば2点、CLI明示は8点。それ以外は未評価。依存・コードは未監査。|
|monetization|4 / 10|限定Issue需要と対応するGUIまたは導入支援の仮説に4点。支払意思は未検証。|

### MVP・商品化仮説（AIなし）
- **kind**: HYPOTHESIS\_TEMPLATE\_NO\_AI
- **workingName**: sample-000 向け導入支援案（仮称）
- **originalOSS**: https://github.com/fixture-org/sample-000
- **problem**: 取得Issueの要望を顧客面談で再確認する
- **targetUser**: 当該OSSの導入を検討する日本の小規模チーム（仮説）
- **productWedge**: GUI
- **requiredOSSModification**: 最初は本体改変を避ける。必要性とライセンスを別途確認
- **requiredNewComponents**: 日本語の導入手順 / 最小操作画面または設定テンプレート
- **features**: 1つの利用フロー / 失敗時の説明 / 設定のエクスポート
- **nonFeatures**: 会員・決済 / 常時Hostedサービス / 自動営業 / 全用途への対応
- **ui**: 日本語の最小操作画面（GUI仮説の場合）
- **architecture**: 元OSSと薄い入出力層を分離。対象コードは本ツールで実行しない
- **hosting**: まず利用者PC。別製品のホスティング費用は別途検証
- **estimatedComplexity**: 未見積もり。言語・依存・インフラの実装調査が必要
- **licenseRequirements**: 著作権・許諾表示の保持
- **securityConsiderations**: 入力検証 / 秘密情報の非保存 / 依存・実行権限の監査
- **monetization**: GUI
- **pricingHypothesis**: 未設定。支払意思の検証前に価格・売上を断定しない
- **validationPlan**: 対象顧客3者に課題を確認 / 既存サービスと日本語代替を調査 / 手動デモで価値を確認
- **developmentPhases**: 権利と需要の確認 / 1フローの試作 / 受入試験
- **acceptanceCriteria**: ライセンス・依存・商標確認を記録 / 対象者が主要操作を完了 / 競合との差を根拠付きで説明 / 費用上限と停止手順が明確

### 根拠
- [metadata](https://github.com/fixture-org/sample-000) [OK] Stars 200; open issues 12; size 1234 KiB。Starsは得点に使用しない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:metadata:1
- [readme](https://github.com/fixture-org/sample-000) [OK] 限定README確認: CLI手掛かり=true; 日本語手掛かり=false; 商用提供の用語=false; 高負荷領域の用語=false。用語検出であり製品の有無の断定ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:readme:2
- [license](https://api.github.com/repos/fixture-org/sample-000/license) [OK] SPDX=MIT; ファイル確認=OK; 依存・商標は未確認。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:license:3
- [demand](https://github.com/fixture-org/sample-000/issues/1) [OK] 要望関連語を検出。コメント 6、リアクション 10。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:demand:4
- [demand](https://github.com/fixture-org/sample-000/issues/2) [OK] 要望関連語を検出。コメント 3、リアクション 5。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:demand:5
- [issues](https://github.com/fixture-org/sample-000/issues) [OK] 取得状態=OK; 最大10件、需要関連語の検出2件。全Issueの調査ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-000:issues:6

## fixture-org/sample-001
[Repository](https://github.com/fixture-org/sample-001) / VALIDATE / MIT
暫定 37/100、評価済み配点 60、未評価配点 40。
根拠充足指標 0.36（成功確率ではない）。日本競合: UNVERIFIED。商用提供: UNVERIFIED。
ライセンス義務: 著作権・許諾表示の保持 / 依存: NOT_REVIEWED / 商標: UNVERIFIED

|項目|得点 / 配点|理由|
|---|---|---|
|demand|10 / 20|限定Issue: 1検出2点、コメント3件毎に最大2点、反応5件毎に最大2点。合計上限20。|
|commercialGap|未評価 / 20|手動調査で提供あり3点、調査範囲内未確認12点。READMEの不検出のみでは加点しない。|
|japanGap|未評価 / 20|需要＋90日以内の日本関連性・ローカライズ・競合調査が必要。各5点、最大15点。一般Web網羅不足の5点は付与しない。|
|license|15 / 15|SPDXファイル確認時のみ、商用化義務の摩擦に基づく固定表を適用。適法性の保証ではない。|
|feasibility|8 / 15|高負荷領域の用語があれば2点、CLI明示は8点。それ以外は未評価。依存・コードは未監査。|
|monetization|4 / 10|限定Issue需要と対応するGUIまたは導入支援の仮説に4点。支払意思は未検証。|

### MVP・商品化仮説（AIなし）
- **kind**: HYPOTHESIS\_TEMPLATE\_NO\_AI
- **workingName**: sample-001 向け導入支援案（仮称）
- **originalOSS**: https://github.com/fixture-org/sample-001
- **problem**: 取得Issueの要望を顧客面談で再確認する
- **targetUser**: 当該OSSの導入を検討する日本の小規模チーム（仮説）
- **productWedge**: GUI
- **requiredOSSModification**: 最初は本体改変を避ける。必要性とライセンスを別途確認
- **requiredNewComponents**: 日本語の導入手順 / 最小操作画面または設定テンプレート
- **features**: 1つの利用フロー / 失敗時の説明 / 設定のエクスポート
- **nonFeatures**: 会員・決済 / 常時Hostedサービス / 自動営業 / 全用途への対応
- **ui**: 日本語の最小操作画面（GUI仮説の場合）
- **architecture**: 元OSSと薄い入出力層を分離。対象コードは本ツールで実行しない
- **hosting**: まず利用者PC。別製品のホスティング費用は別途検証
- **estimatedComplexity**: 未見積もり。言語・依存・インフラの実装調査が必要
- **licenseRequirements**: 著作権・許諾表示の保持
- **securityConsiderations**: 入力検証 / 秘密情報の非保存 / 依存・実行権限の監査
- **monetization**: GUI
- **pricingHypothesis**: 未設定。支払意思の検証前に価格・売上を断定しない
- **validationPlan**: 対象顧客3者に課題を確認 / 既存サービスと日本語代替を調査 / 手動デモで価値を確認
- **developmentPhases**: 権利と需要の確認 / 1フローの試作 / 受入試験
- **acceptanceCriteria**: ライセンス・依存・商標確認を記録 / 対象者が主要操作を完了 / 競合との差を根拠付きで説明 / 費用上限と停止手順が明確

### 根拠
- [metadata](https://github.com/fixture-org/sample-001) [OK] Stars 200; open issues 12; size 1234 KiB。Starsは得点に使用しない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:metadata:1
- [readme](https://github.com/fixture-org/sample-001) [OK] 限定README確認: CLI手掛かり=true; 日本語手掛かり=false; 商用提供の用語=false; 高負荷領域の用語=false。用語検出であり製品の有無の断定ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:readme:2
- [license](https://api.github.com/repos/fixture-org/sample-001/license) [OK] SPDX=MIT; ファイル確認=OK; 依存・商標は未確認。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:license:3
- [demand](https://github.com/fixture-org/sample-001/issues/1) [OK] 要望関連語を検出。コメント 6、リアクション 10。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:demand:4
- [demand](https://github.com/fixture-org/sample-001/issues/2) [OK] 要望関連語を検出。コメント 3、リアクション 5。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:demand:5
- [issues](https://github.com/fixture-org/sample-001/issues) [OK] 取得状態=OK; 最大10件、需要関連語の検出2件。全Issueの調査ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-001:issues:6

## fixture-org/sample-002
[Repository](https://github.com/fixture-org/sample-002) / VALIDATE / MIT
暫定 37/100、評価済み配点 60、未評価配点 40。
根拠充足指標 0.36（成功確率ではない）。日本競合: UNVERIFIED。商用提供: UNVERIFIED。
ライセンス義務: 著作権・許諾表示の保持 / 依存: NOT_REVIEWED / 商標: UNVERIFIED

|項目|得点 / 配点|理由|
|---|---|---|
|demand|10 / 20|限定Issue: 1検出2点、コメント3件毎に最大2点、反応5件毎に最大2点。合計上限20。|
|commercialGap|未評価 / 20|手動調査で提供あり3点、調査範囲内未確認12点。READMEの不検出のみでは加点しない。|
|japanGap|未評価 / 20|需要＋90日以内の日本関連性・ローカライズ・競合調査が必要。各5点、最大15点。一般Web網羅不足の5点は付与しない。|
|license|15 / 15|SPDXファイル確認時のみ、商用化義務の摩擦に基づく固定表を適用。適法性の保証ではない。|
|feasibility|8 / 15|高負荷領域の用語があれば2点、CLI明示は8点。それ以外は未評価。依存・コードは未監査。|
|monetization|4 / 10|限定Issue需要と対応するGUIまたは導入支援の仮説に4点。支払意思は未検証。|

### MVP・商品化仮説（AIなし）
- **kind**: HYPOTHESIS\_TEMPLATE\_NO\_AI
- **workingName**: sample-002 向け導入支援案（仮称）
- **originalOSS**: https://github.com/fixture-org/sample-002
- **problem**: 取得Issueの要望を顧客面談で再確認する
- **targetUser**: 当該OSSの導入を検討する日本の小規模チーム（仮説）
- **productWedge**: GUI
- **requiredOSSModification**: 最初は本体改変を避ける。必要性とライセンスを別途確認
- **requiredNewComponents**: 日本語の導入手順 / 最小操作画面または設定テンプレート
- **features**: 1つの利用フロー / 失敗時の説明 / 設定のエクスポート
- **nonFeatures**: 会員・決済 / 常時Hostedサービス / 自動営業 / 全用途への対応
- **ui**: 日本語の最小操作画面（GUI仮説の場合）
- **architecture**: 元OSSと薄い入出力層を分離。対象コードは本ツールで実行しない
- **hosting**: まず利用者PC。別製品のホスティング費用は別途検証
- **estimatedComplexity**: 未見積もり。言語・依存・インフラの実装調査が必要
- **licenseRequirements**: 著作権・許諾表示の保持
- **securityConsiderations**: 入力検証 / 秘密情報の非保存 / 依存・実行権限の監査
- **monetization**: GUI
- **pricingHypothesis**: 未設定。支払意思の検証前に価格・売上を断定しない
- **validationPlan**: 対象顧客3者に課題を確認 / 既存サービスと日本語代替を調査 / 手動デモで価値を確認
- **developmentPhases**: 権利と需要の確認 / 1フローの試作 / 受入試験
- **acceptanceCriteria**: ライセンス・依存・商標確認を記録 / 対象者が主要操作を完了 / 競合との差を根拠付きで説明 / 費用上限と停止手順が明確

### 根拠
- [metadata](https://github.com/fixture-org/sample-002) [OK] Stars 200; open issues 12; size 1234 KiB。Starsは得点に使用しない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:metadata:1
- [readme](https://github.com/fixture-org/sample-002) [OK] 限定README確認: CLI手掛かり=true; 日本語手掛かり=false; 商用提供の用語=false; 高負荷領域の用語=false。用語検出であり製品の有無の断定ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:readme:2
- [license](https://api.github.com/repos/fixture-org/sample-002/license) [OK] SPDX=MIT; ファイル確認=OK; 依存・商標は未確認。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:license:3
- [demand](https://github.com/fixture-org/sample-002/issues/1) [OK] 要望関連語を検出。コメント 6、リアクション 10。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:demand:4
- [demand](https://github.com/fixture-org/sample-002/issues/2) [OK] 要望関連語を検出。コメント 3、リアクション 5。否定・文脈は未解釈。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:demand:5
- [issues](https://github.com/fixture-org/sample-002/issues) [OK] 取得状態=OK; 最大10件、需要関連語の検出2件。全Issueの調査ではない。 — 2026-09-20T10:00:00.000Z / ID: fixture-org/sample-002:issues:6

## 除外記録

## 取得エラー

## 調査限界
- 全GitHubを網羅した探索ではない。検索結果と深掘り数に上限がある。
- 競合未調査はUNVERIFIED。日本語文書の不在を需要に換算しない。
- AI不使用。商品化・MVPはテンプレート仮説。価格・売上・工数は未検証。
- 取得対象OSSの依存関係・商標は未監査。権利確認を完了した商品候補ではない。
- 暫定点は100点基準のまま。未評価配点を除いて満点へ換算しない。
- Qiita・Zenn・Discussion・Release・言語別サイズは自動取得対象外。
