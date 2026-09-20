> この文書は初回READY_FOR_PUBLICATION時点の検証記録です。最終ゲート承認後の状態はRELEASE_STATUS.jsonとpublication-audit.mdを参照してください。

# 受入試験結果 — 2026-09-20

到達状態: **LOCAL_COMPLETE / READY_FOR_PUBLICATION（公開判断を受ける準備完了）**。公開先と本体ライセンスの正式採用は、ユーザーが指定した最終公開ゲートに残します。Public Repository・公開push・Pages有効化は実施していません。PUBLIC_RELEASEDではありません。

## 実行環境と結果

ローカルmacOS arm64、Node.js v24.19.0。npm外部依存0。ブラウザは既存Chromium 143.0.7499.4。実機スマートフォンではなくviewportによる確認です。

|確認|結果|実行・証跡|
|---|---|---|
|Unit / Fixture / 統合回帰|PASS|`npm test`: **49 PASS / 0 FAIL / 0 SKIP**|
|新規フォルダ再現|PASS|既存work/dist/node_modules/.gitを除くコピーでGit初期化し、READMEどおりoffline npm ci → 49 tests → check → build。別OSの試験ではない|
|依存・install script|PASS|package-lock依存0、lifecycle script 0。`npm audit --offline --json` のvulnerability total 0（空の依存グラフ対象）|
|静的build|PASS|実APIの97候補を含むsite、1,152,840 bytes、10 MB上限内|
|ブラウザFixture|PASS|[browser-results.json](browser-results.json): 13項目。320/375/390/768px、一覧・詳細・直リンク・再読込・絞り込み・保存・状態・XSS|
|実APIデータのブラウザ表示|PASS|[live-browser-results.json](live-browser-results.json): 320/375/390/768/1280pxで97件表示、詳細直リンク・再読込・横はみ出しなし|
|YAML / shell構文|PASS|3 workflowをRuby YAMLで解析、各runをbash -nで検査|
|workflow静的意味検査|PASS|actionlint v1.7.12、3 workflow、エラーなし。shellcheck/pyflakes連携は無効であり未実施|
|Gitデータbranch保存形式・復元|PASS|ネットワークなしの一時Gitリポジトリで保存・restore・翌日分析・build。リモートpushの実証ではない|
|秘密情報走査|PASS（限定範囲）|公開候補ソース・JSON・Markdown・設定・文書・既知tokenパターン、絶対個人パスなし。値をログへ出さない試験|
|Git履歴の秘密情報|対象履歴なし|この公開候補は初期化済み・commit 0件。history blob 0件。存在しない履歴を実証済みとは扱わない|
|認証付き実API|NOT_TESTED|ローカルGITHUB_TOKENなし。資格情報を取得・作成していない。ヘッダーと送信先の動作はFixtureでPASS|
|GitHub上のCI|NOT_TESTED|公開禁止ゲートにより未実行。ローカルの同等コマンドのみPASS|
|GitHub日次→保存→Pages実行|NOT_TESTED|公開先未指定。workflow/復元形式をローカル検証済み|
|スマホ実機・Safari・Firefox・Windows|NOT_TESTED|Chromium viewport試験と混同しない|
|公開アカウントの保存無料枠|NOT_TESTED|アカウント未指定。日次・配信は既定停止。課金設定を変更していない|

## Fixtureと実APIを区別した実績

Fixture: 架空100Repositoryを一次評価し、上限10件・不足時の非水増し・除外を確認。ネットワーク要求0件。Fixtureの100件深掘り入力は計算機能の試験で、実APIの深掘り上限を示すものではありません。

実API（すべて匿名GET）:

|実行|取得日時UTC|検索結果 / 重複除去後の一次評価|深掘り|要求|結果|
|---|---|---|---:|---:|---|
|最初の成功|2026-09-20T13:57:05.784Z|100 / 100|3|10|SUCCESS、Top 2|
|検索配分改善後の最終成功|2026-09-20T14:07:31.198Z|100 / **97**|3|**11**|SUCCESS、Top **1**|

最終保存されたJSON/Markdownは2回目。同日再実行でarchiveを重複追加せず置換しました。2条件に各50件を配分し、重複3件は除外理由DUPLICATEとして記録。その他の除外を含む記録は33件です。失敗0という意味でSUCCESSですが、競合や各候補の依存・商標を全て調査した意味ではありません。

最終の深掘り3件:

- `synthetic-sciences/openscience`: metadata/README/LICENSE/Issue取得、Apache-2.0識別、VALIDATE、暫定24/100（評価済み配点60）。
- `metalbear-co/mirrord`: 同取得、MIT識別、LOW_SIGNAL。
- `manaflow-ai/cmux`: 同取得、SPDX NOASSERTION、BLOCKED。権利を推測して推奨候補へ通していない。

97件すべてのREADME/Issue/ライセンスファイルを深掘りしたわけではありません。残る一次評価案件には未取得・未評価が残ります。公式サービスや国内競合の全面調査、Qiita/Zenn検索は行っていません。根拠URLと観測日時は [data/latest.json](../data/latest.json) に保存しています。

## 障害・自己修正

49試験には403/429、Retry-After、一次/二次制限、要求/時間/応答サイズ上限、timeout、不正JSON、500、404、Provider部分停止、欠測、score再現性、ライセンス分類、古い/未来の手動観測、重複、前日比較、原子的latest更新前の中断、容量・保持期限、lock、symlink、秘密値redaction、HTML/URL/Markdown注入、Fixture公開拒否、全8種filter、空白・日本語のプロジェクトパスを含みます。これらの障害はFixtureで再現しており、実GitHubに意図的な429等を発生させていません。

発見して修正した不具合:

1. 検索の数値範囲 `100..30000` をパス攻撃と誤認。パス部分だけを検査し、回帰試験と実API再試験でPASS。
2. 既定の最低実現性0がnullの候補を隠す問題。0は未評価を含めるよう修正。97件全表示のブラウザ再試験でPASS。
3. 空白・日本語・OSのシンボリックなパスでCLI入口が動かない問題。Node 24のimport.meta.mainを使用し、回帰試験・新規環境でPASS。
4. 保存stateのMarkdown再生成と容量上限の処理を自己レビューで修正し、復元・容量試験でPASS。

途中のFAILを削除して「常に成功」とは記録しません。現在の未解決FAILは0件です。

## SPEC受入条件の対応

|ID|判定と範囲|
|---|---|
|AC-001|PASS: 匿名実GitHub自動候補収集|
|AC-002|PASS: 100件Fixture一次評価。最初の実APIでも100件、最終実APIは重複除去後97件|
|AC-003〜006|PASS: score、内訳、Evidence、license分類|
|AC-007|PASS: no/unknown licenseをBLOCKED|
|AC-008〜012|PASS: Japan Gap/Confidence/実現性/収益化/MVP。根拠不足はnull・UNVERIFIED|
|AC-013|PASS: 最大10件。Fixture 10、最終実API 1。水増しなし|
|AC-014|ローカルbase path/直リンクPASS、実Pages NOT_TESTED|
|AC-015|workflow静的検査と復元形式PASS、実Actions NOT_TESTED|
|AC-016〜017|PASS: APIキーなし、有料API呼び出しなし|
|AC-018|ローカルCI同等49試験PASS、リモートCI NOT_TESTED|
|AC-019|公開候補の走査PASS、Git履歴なし。無制限の漏洩不存在保証ではない|
|AC-020|READY_FOR_PUBLICATION: 内容・制約・未検証項目を提示可能。外部公開は未実施|

## 公開前後に残る操作

最終公開ゲートでowner/repositoryとApache-2.0採用を確定、無料保存条件を確認。承認後だけ公開とActions/Pages設定へ進み、認証付き取得・実CI・日次復元・Pages・スマホ実機を検証します。[release-checklist.md](release-checklist.md)を参照。
