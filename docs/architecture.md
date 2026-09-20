# 処理と公開データ

`src/github.js` → 取得bundle（メモリのみ） → `src/analyze.js` → `src/schema.js`検証 → `src/storage.js` → JSON / `src/report.js` Markdown → `src/build.js` → `web/`。

`security.js`はRepository名・出典URL・文字列・秘密情報を処理します。ネットワークアクセスは固定の `https://api.github.com` のGETだけ。リダイレクトは拒否。manualの出典URLは表示専用です。レスポンスサイズ・タイムアウト・総実行時間・要求回数・ページ数・待機時間・再試行数を制限します。検索とcoreの一次制限は別に記録し、二次制限に遭遇して待てない場合は全リクエストを止めます。

公開スキーマの実行時定義は `src/schema.js`。公開reportはschemaVersion、mode、date、generatedAt、lastSuccessAt、runStatus、scoringVersion、scope、errors、candidates、top、excluded、limitationsを持ちます。Evidenceはid/source/type/url/observedAt/status/summary/weight/confidence。解析本文・Issue投稿者・メール・アバターは保存しません。

詳細ルートは `#repo=owner%2Frepository`。全アセットURLは相対パスで、GitHub project Pages配下でも直リンクと再読込が動く構成です。DOMはtextContentで生成し、外部画像・HTML埋め込みは使いません。CSPを付与します。

日次workflowはread-onlyの収集jobで `oth-data` ブランチから前回データを復元し、初回はソースに含む実API結果をseedにします。検証済みstateとsiteだけを1日保持artifactへ渡します。別のcontents:write jobが `data/` と `reports/` だけの `oth-data` ブランチへ保存し、同じworkflowからreusable Pages jobへ直接進みます。GITHUB_TOKEN pushによる別workflowの起動には依存しません。PR workflowには収集・公開権限もSecretsも渡しません。

`scripts/state.js` はartifactのパス・サイズ・liveモード・report形式を検証し、MarkdownをJSONから再生成します。保存先は各実行の `work/state`、次回読み取り元は `oth-data`。リモートでのこの経路は公開ゲート後に実証する必要があります。
