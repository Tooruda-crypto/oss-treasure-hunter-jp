# 最終公開前監査

監査日時: 2026-09-20 UTC。元のステージ済み57ファイルを基準とし、ユーザーが承認したApache-2.0を正式適用しました。この監査記録1件を追加して公開候補は58ファイルです。

|確認項目|結果|確認内容|
|---|---|---|
|Secret|PASS|既知のtoken・秘密鍵パターン0件、空の.env.exampleのみ。commit後の履歴57個の固有blobも検出0件|
|個人情報|PASS（確認範囲内）|公開データ9,935文字列のメール・電話番号・個人パス検出0件。作者プロフィール、生README/Issueなし。テストのメールはexample.org/example.invalid、URL認証情報も架空値|
|絶対パス|PASS|個人ディレクトリ・一時ディレクトリ・Windows個人パスの混入0件|
|Fixture分離|PASS|data内3 JSONはlive、examples内JSONはfixture。公開buildはFixtureを拒否|
|本体ライセンス|PASS|LICENSEはApache-2.0原文、package/lockもApache-2.0、npm誤publish防止を維持|
|第三者通知|PASS|本体と対象OSSの権利を分離。npm依存・同梱第三者ライブラリ0。ActionsはMIT、公式commitを固定|
|README|PASS|名称・Node/npm/Git起動手順・調査制約・未評価・公開状態へのリンクを確認|
|Pages base path|PASS（ローカル）|相対アセット・相対JSON・hash詳細URL。/oss-treasure-hunter-jp/配下のローカル試験に合格。公開URLは別途検証|
|workflow permissions|PASS|CI/収集contents:read、保存だけcontents:write、配信だけpages:write/id-token:write。PRへの書込権限なし|
|有料サービス|PASS（コード）|GitHub公開REST GETのみ。標準ubuntu-24.04、cache無効。有料API/外部AI/課金/大規模runnerなし|
|不要ファイル|PASS|原本文書・work/dist/.env/依存物/ブラウザプロフィール/生取得本文を除外。公開候補symlink0件|

Apache原文SHA-256: `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`。

修正後の再実行: `npm ci --ignore-scripts --offline --no-audit --no-fund` PASS、`npm test` 49 PASS / 0 FAIL / 0 skipped、`npm run check` PASS、`npm run build` PASS（97件・1,152,840 bytes）、actionlint v1.7.12による3 workflow検証 PASS。actionlintのshellcheck/pyflakesは無効、別途のツール実行は本監査ではNOT_TESTED。`npm audit --offline` は空のnpm依存グラフで0件であり、OS/Actionsの完全監査ではありません。

実APIの前回成功は匿名GitHub GET、100件取得・97件重複排除後評価・3件深掘り・11要求。認証付きリモート取得、CI、日次保存、Pages配信は公開後に別途記録します。初回ブラウザ試験はacceptance-results.mdに記載し、リモート未実施をPASSへ転記しません。

費用を伴う設定変更・有料サービス利用は0件。GitHub Free、無料保存枠の余裕、既存予算による追加支出の停止を読み取り確認しました。課金設定を変更せずに無料条件を満たしています。将来この条件を確認できなくなった場合はその操作をHOLDにします。

公開結果の正本はRELEASE_STATUS.jsonです。機械走査で未知形式の秘密値やあらゆる個人情報の不存在を保証するものではありません。
